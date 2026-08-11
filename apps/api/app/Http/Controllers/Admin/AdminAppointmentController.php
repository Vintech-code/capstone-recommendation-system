<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\CounselorAvailabilityWindow;
use App\Models\GuidanceAppointment;
use App\Models\GuidanceAppointmentEvent;
use App\Models\GuidanceRequest;
use App\Models\RoleSlug;
use App\Models\User;
use App\Services\Notifications\NotificationPolicyScheduler;
use App\Services\Notifications\PathwaysNotifier;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class AdminAppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $appointments = GuidanceAppointment::query()
            ->with(['student:id,name,email', 'counselor:id,name,email', 'events.actor:id,name'])
            ->when($request->user()->hasRole(RoleSlug::Counselor), fn ($query) => $query->where('counselor_id', $request->user()->getKey()))
            ->orderByRaw("case when status = 'scheduled' then 0 when status = 'completed' then 1 else 2 end")
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn (GuidanceAppointment $appointment): array => $this->payload($appointment));

        return response()->json(['data' => $appointments]);
    }

    public function store(Request $request, PathwaysNotifier $notifier, NotificationPolicyScheduler $notificationPolicies): JsonResponse
    {
        $validated = $request->validate($this->rules(true));
        if ($request->user()->hasRole(RoleSlug::Counselor)) {
            $validated['counselorId'] = $request->user()->getKey();
        }
        $this->ensureStudentAndCounselor((int) $validated['studentId'], (int) $validated['counselorId']);

        $appointment = DB::transaction(function () use ($request, $validated): GuidanceAppointment {
            $guidanceRequest = isset($validated['guidanceRequestId'])
                ? GuidanceRequest::query()->lockForUpdate()->findOrFail($validated['guidanceRequestId'])
                : null;
            if ($guidanceRequest && ($guidanceRequest->student_id !== (int) $validated['studentId'] || $guidanceRequest->status !== 'pending')) {
                abort(409, 'This guidance request has already been handled.');
            }

            if ($guidanceRequest !== null) {
                $guidanceRequest->update([
                    'status' => 'accepted',
                    'accepted_by' => $request->user()->getKey(),
                    'accepted_at' => now(),
                ]);
                $guidanceRequest->events()->create([
                    'actor_id' => $request->user()->getKey(),
                    'event_type' => 'accepted',
                    'from_status' => 'pending',
                    'to_status' => 'accepted',
                ]);
            }

            $scheduledAt = CarbonImmutable::parse($validated['scheduledAt'])->utc();
            $endsAt = CarbonImmutable::parse($validated['endsAt'])->utc();
            $this->ensureScheduleIsAvailable((int) $validated['counselorId'], $scheduledAt, $endsAt);

            $appointment = GuidanceAppointment::query()->create([
                'student_id' => $validated['studentId'],
                'counselor_id' => $validated['counselorId'],
                'created_by' => $request->user()->getKey(),
                'scheduled_at' => $scheduledAt,
                'ends_at' => $endsAt,
                'topic' => trim($validated['topic']),
                'programme_code' => isset($validated['programmeCode']) ? strtoupper(trim($validated['programmeCode'])) : null,
                'status' => 'scheduled',
                'notes' => isset($validated['notes']) ? trim($validated['notes']) : null,
            ]);

            $this->recordEvent(
                appointment: $appointment,
                actorId: $request->user()->getKey(),
                eventType: 'created',
                fromStatus: null,
                toStatus: 'scheduled',
                scheduledAt: $appointment->scheduled_at,
                endsAt: $appointment->ends_at,
            );

            if ($guidanceRequest !== null) {
                $guidanceRequest->update(['status' => 'scheduled', 'appointment_id' => $appointment->getKey()]);
                $guidanceRequest->events()->create([
                    'actor_id' => $request->user()->getKey(),
                    'event_type' => 'scheduled',
                    'from_status' => 'accepted',
                    'to_status' => 'scheduled',
                ]);
            }

            return $appointment;
        });

        $this->audit($request, 'guidance_appointment.created', $appointment);
        $notificationPolicies->refreshAppointmentReminders($appointment);

        $appointment->loadMissing(['student:id,name,email', 'counselor:id,name,email']);
        if ($appointment->student !== null) {
            if (isset($validated['guidanceRequestId'])) {
                $notifier->notify(
                    $appointment->student,
                    'guidance_request_accepted',
                    'Guidance request accepted',
                    'A counselor accepted your guidance request.',
                    ['guidanceRequestId' => (int) $validated['guidanceRequestId']],
                );
            }
            $notifier->notify(
                $appointment->student,
                'guidance_request_scheduled',
                'Guidance appointment scheduled',
                'A schedule is available for your guidance request. Review the appointment details and confirm it.',
                ['appointmentId' => $appointment->getKey(), 'guidanceRequestId' => $validated['guidanceRequestId'] ?? null],
            );
        }

        return response()->json(['data' => $this->payload($appointment->load(['student:id,name,email', 'counselor:id,name,email', 'events.actor:id,name']))], 201);
    }

    public function update(Request $request, GuidanceAppointment $guidanceAppointment, PathwaysNotifier $notifier, NotificationPolicyScheduler $notificationPolicies): JsonResponse
    {
        abort_if($request->user()->hasRole(RoleSlug::Counselor) && $guidanceAppointment->counselor_id !== $request->user()->getKey(), 403);
        $validated = $request->validate([
            ...$this->rules(false),
            'status' => ['required', 'in:scheduled,completed,cancelled,no_show'],
            'cancellationReason' => ['required_if:status,cancelled', 'nullable', 'string', 'min:3', 'max:1000'],
        ]);
        if ($request->user()->hasRole(RoleSlug::Counselor)) {
            $validated['counselorId'] = $request->user()->getKey();
        }
        $this->ensureStudentAndCounselor((int) $validated['studentId'], (int) $validated['counselorId']);

        $notificationEvent = null;
        $guidanceAppointment = DB::transaction(function () use ($guidanceAppointment, $request, $validated, &$notificationEvent): GuidanceAppointment {
            $appointment = GuidanceAppointment::query()->lockForUpdate()->findOrFail($guidanceAppointment->getKey());
            $fromStatus = $appointment->status;
            $toStatus = $validated['status'];
            $nextScheduledAt = CarbonImmutable::parse($validated['scheduledAt'])->utc();
            $nextEndsAt = isset($validated['endsAt']) ? CarbonImmutable::parse($validated['endsAt'])->utc() : $appointment->ends_at;

            if ($fromStatus !== 'scheduled') {
                abort(409, 'Completed, cancelled, and no-show appointments are immutable.');
            }
            if (! in_array($toStatus, ['scheduled', 'completed', 'cancelled', 'no_show'], true)) {
                abort(409, 'This appointment status transition is not allowed.');
            }

            $wasRescheduled = ! $appointment->scheduled_at?->equalTo($nextScheduledAt);
            if ($toStatus === 'scheduled') {
                if ($nextEndsAt === null) {
                    throw ValidationException::withMessages(['endsAt' => 'Enter an end time before scheduling or rescheduling this appointment.']);
                }
                $this->ensureScheduleIsAvailable((int) $validated['counselorId'], $nextScheduledAt, $nextEndsAt, $appointment->getKey());
            }

            $previousScheduledAt = $appointment->scheduled_at;
            $previousEndsAt = $appointment->ends_at;
            $appointment->update([
                'student_id' => $validated['studentId'],
                'counselor_id' => $validated['counselorId'],
                'scheduled_at' => $nextScheduledAt,
                'ends_at' => $nextEndsAt,
                'topic' => trim($validated['topic']),
                'programme_code' => isset($validated['programmeCode']) ? strtoupper(trim($validated['programmeCode'])) : null,
                'status' => $toStatus,
                'notes' => isset($validated['notes']) ? trim($validated['notes']) : null,
                'cancellation_reason' => $toStatus === 'cancelled' ? trim((string) $validated['cancellationReason']) : null,
            ]);

            if ($wasRescheduled && $toStatus === 'scheduled') {
                $notificationEvent = 'appointment_rescheduled';
                $this->recordEvent($appointment, $request->user()->getKey(), 'rescheduled', $fromStatus, $toStatus, $previousScheduledAt, $nextScheduledAt, null, $previousEndsAt, $nextEndsAt);
            } elseif ($fromStatus !== $toStatus) {
                $notificationEvent = match ($toStatus) {
                    'completed' => 'appointment_completed',
                    'cancelled' => 'appointment_cancelled',
                    default => null,
                };
                $this->recordEvent(
                    $appointment,
                    $request->user()->getKey(),
                    'status_changed',
                    $fromStatus,
                    $toStatus,
                    $previousScheduledAt,
                    $nextScheduledAt,
                    $appointment->cancellation_reason,
                    $previousEndsAt,
                    $nextEndsAt,
                );
            }

            if (in_array($toStatus, ['completed', 'cancelled', 'no_show'], true)) {
                $guidanceRequest = GuidanceRequest::query()
                    ->where('appointment_id', $appointment->getKey())
                    ->lockForUpdate()
                    ->first();
                if ($guidanceRequest?->status === 'scheduled') {
                    $requestStatus = $toStatus === 'cancelled' ? 'cancelled' : 'closed';
                    $guidanceRequest->update([
                        'status' => $requestStatus,
                        'closed_at' => now(),
                        'resolution_reason' => $toStatus === 'cancelled'
                            ? $appointment->cancellation_reason
                            : ($toStatus === 'no_show' ? 'Appointment recorded as no-show.' : 'Appointment completed.'),
                    ]);
                    $guidanceRequest->events()->create([
                        'actor_id' => $request->user()->getKey(),
                        'event_type' => $requestStatus,
                        'from_status' => 'scheduled',
                        'to_status' => $requestStatus,
                        'reason' => $guidanceRequest->resolution_reason,
                    ]);
                }
            }

            return $appointment;
        });

        $this->audit($request, 'guidance_appointment.updated', $guidanceAppointment);
        $notificationPolicies->refreshAppointmentReminders($guidanceAppointment);

        $guidanceAppointment->loadMissing('student:id,name,email');
        if ($notificationEvent !== null && $guidanceAppointment->student !== null) {
            [$title, $message] = match ($notificationEvent) {
                'appointment_rescheduled' => ['Guidance appointment rescheduled', 'Your counselor changed the appointment schedule. Review the updated date and time.'],
                'appointment_completed' => ['Guidance appointment completed', 'Your guidance appointment was marked completed.'],
                default => ['Guidance appointment cancelled', 'Your guidance appointment was cancelled. Review the recorded reason in the appointment details.'],
            };
            $notifier->notify(
                $guidanceAppointment->student,
                $notificationEvent,
                $title,
                $message,
                ['appointmentId' => $guidanceAppointment->getKey()],
            );
        }

        return response()->json(['data' => $this->payload($guidanceAppointment->load(['student:id,name,email', 'counselor:id,name,email', 'events.actor:id,name']))]);
    }

    /** @return array<string, array<int, string>> */
    private function rules(bool $creating): array
    {
        return [
            'studentId' => ['required', 'integer', 'exists:users,id'],
            'counselorId' => ['required', 'integer', 'exists:users,id'],
            'scheduledAt' => ['required', 'date'],
            'endsAt' => [$creating ? 'required' : 'nullable', 'date', 'after:scheduledAt'],
            'topic' => ['required', 'string', 'min:3', 'max:160'],
            'programmeCode' => ['nullable', 'string', 'max:32'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'guidanceRequestId' => ['nullable', 'integer', 'exists:guidance_requests,id'],
        ];
    }

    private function ensureScheduleIsAvailable(int $counselorId, CarbonImmutable $scheduledAt, CarbonImmutable $endsAt, ?int $exceptAppointmentId = null): void
    {
        $this->ensureWithinCounselorAvailability($counselorId, $scheduledAt, $endsAt);

        $conflict = GuidanceAppointment::query()
            ->where('counselor_id', $counselorId)
            ->where('status', 'scheduled')
            ->where(function ($query) use ($scheduledAt, $endsAt): void {
                $query->where(function ($knownWindow) use ($scheduledAt, $endsAt): void {
                    $knownWindow->whereNotNull('ends_at')
                        ->where('scheduled_at', '<', $endsAt)
                        ->where('ends_at', '>', $scheduledAt);
                })->orWhere(function ($legacyWindow) use ($scheduledAt, $endsAt): void {
                    $legacyWindow->whereNull('ends_at')
                        ->where('scheduled_at', '>=', $scheduledAt)
                        ->where('scheduled_at', '<', $endsAt);
                });
            })
            ->when($exceptAppointmentId !== null, fn ($query) => $query->whereKeyNot($exceptAppointmentId))
            ->lockForUpdate()
            ->exists();

        abort_if($conflict, 409, 'This appointment overlaps another active appointment for the counselor.');
    }

    private function ensureWithinCounselorAvailability(int $counselorId, CarbonImmutable $scheduledAt, CarbonImmutable $endsAt): void
    {
        $availability = CounselorAvailabilityWindow::query()
            ->where('counselor_id', $counselorId);

        if (! (clone $availability)->exists()) {
            throw ValidationException::withMessages([
                'scheduledAt' => 'Configure your counselor availability before scheduling an appointment.',
            ]);
        }

        $manilaStart = $scheduledAt->setTimezone('Asia/Manila');
        $manilaEnd = $endsAt->setTimezone('Asia/Manila');
        if (! $manilaStart->isSameDay($manilaEnd)) {
            throw ValidationException::withMessages([
                'scheduledAt' => 'Appointments must start and end on the same date in Asia/Manila.',
            ]);
        }

        $withinWindow = $availability
            ->where('weekday', $manilaStart->dayOfWeek)
            ->where('starts_at', '<=', $manilaStart->format('H:i:s'))
            ->where('ends_at', '>=', $manilaEnd->format('H:i:s'))
            ->exists();

        if (! $withinWindow) {
            throw ValidationException::withMessages([
                'scheduledAt' => 'Select a time inside your recorded Asia/Manila availability.',
            ]);
        }
    }

    private function ensureStudentAndCounselor(int $studentId, int $counselorId): void
    {
        $studentExists = User::query()->whereKey($studentId)
            ->whereHas('roles', static fn ($query) => $query->where('slug', RoleSlug::Student->value))
            ->exists();
        $counselorExists = User::query()->whereKey($counselorId)
            ->where('account_status', 'active')
            ->whereHas('roles', static fn ($query) => $query->where('slug', RoleSlug::Counselor->value))
            ->exists();

        if (! $studentExists) {
            throw ValidationException::withMessages(['studentId' => 'Select a valid student account.']);
        }
        if (! $counselorExists) {
            throw ValidationException::withMessages(['counselorId' => 'Select an active authorized counselor account.']);
        }
    }

    /** @return array<string, mixed> */
    private function payload(GuidanceAppointment $appointment): array
    {
        return [
            'id' => $appointment->getKey(),
            'studentId' => $appointment->student_id,
            'studentName' => $appointment->student?->name,
            'studentEmail' => $appointment->student?->email,
            'counselorId' => $appointment->counselor_id,
            'counselorName' => $appointment->counselor?->name,
            'scheduledAt' => $appointment->scheduled_at?->toAtomString(),
            'endsAt' => $appointment->ends_at?->toAtomString(),
            'topic' => $appointment->topic,
            'programmeCode' => $appointment->programme_code,
            'status' => $appointment->status,
            'notes' => $appointment->notes,
            'cancellationReason' => $appointment->cancellation_reason,
            'studentConfirmedAt' => $appointment->student_confirmed_at?->toAtomString(),
            'statusHistory' => $appointment->events->map(static fn (GuidanceAppointmentEvent $event): array => [
                'id' => $event->getKey(),
                'eventType' => $event->event_type,
                'fromStatus' => $event->from_status,
                'toStatus' => $event->to_status,
                'previousScheduledAt' => $event->previous_scheduled_at?->toAtomString(),
                'scheduledAt' => $event->scheduled_at?->toAtomString(),
                'previousEndsAt' => $event->previous_ends_at?->toAtomString(),
                'endsAt' => $event->ends_at?->toAtomString(),
                'reason' => $event->reason,
                'actor' => $event->actor?->name,
                'createdAt' => $event->created_at?->toAtomString(),
            ])->values()->all(),
        ];
    }

    private function recordEvent(
        GuidanceAppointment $appointment,
        int $actorId,
        string $eventType,
        ?string $fromStatus,
        string $toStatus,
        mixed $previousScheduledAt = null,
        mixed $scheduledAt = null,
        ?string $reason = null,
        mixed $previousEndsAt = null,
        mixed $endsAt = null,
    ): void {
        $appointment->events()->create([
            'actor_id' => $actorId,
            'event_type' => $eventType,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'previous_scheduled_at' => $previousScheduledAt,
            'scheduled_at' => $scheduledAt,
            'previous_ends_at' => $previousEndsAt,
            'ends_at' => $endsAt,
            'reason' => $reason,
        ]);
    }

    private function audit(Request $request, string $action, GuidanceAppointment $appointment): void
    {
        AdminAuditEvent::query()->create([
            'actor_id' => $request->user()->getKey(),
            'action' => $action,
            'subject_type' => 'guidance_appointment',
            'subject_reference' => (string) $appointment->getKey(),
            'metadata' => [
                'student_id' => $appointment->student_id,
                'counselor_id' => $appointment->counselor_id,
                'status' => $appointment->status,
                'scheduled_at' => $appointment->scheduled_at?->toAtomString(),
            ],
        ]);
    }
}
