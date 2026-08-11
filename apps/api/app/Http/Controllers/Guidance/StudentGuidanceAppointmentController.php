<?php

namespace App\Http\Controllers\Guidance;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\GuidanceAppointment;
use App\Models\GuidanceAppointmentEvent;
use App\Models\GuidanceRequest;
use App\Services\Notifications\NotificationPolicyScheduler;
use App\Services\Notifications\PathwaysNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class StudentGuidanceAppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $appointments = GuidanceAppointment::query()
            ->where('student_id', $request->user()->getKey())
            ->with(['counselor:id,name', 'events.actor:id,name'])
            ->orderByRaw("case when status = 'scheduled' then 0 when status = 'completed' then 1 else 2 end")
            ->orderByDesc('scheduled_at')
            ->limit(25)
            ->get()
            ->map(fn (GuidanceAppointment $appointment): array => $this->payload($appointment));

        return response()->json(['data' => $appointments]);
    }

    public function confirm(Request $request, GuidanceAppointment $guidanceAppointment, PathwaysNotifier $notifier, NotificationPolicyScheduler $notificationPolicies): JsonResponse
    {
        $this->assertOwnedBy($request, $guidanceAppointment);

        $newlyConfirmed = false;
        $appointment = DB::transaction(function () use ($request, $guidanceAppointment, &$newlyConfirmed): GuidanceAppointment {
            $appointment = GuidanceAppointment::query()->lockForUpdate()->findOrFail($guidanceAppointment->getKey());
            abort_unless($appointment->status === 'scheduled', 409, 'Only a scheduled appointment can be confirmed.');

            if ($appointment->student_confirmed_at === null) {
                $newlyConfirmed = true;
                $appointment->update(['student_confirmed_at' => now()]);
                $appointment->events()->create([
                    'actor_id' => $request->user()->getKey(),
                    'event_type' => 'student_confirmed',
                    'from_status' => 'scheduled',
                    'to_status' => 'scheduled',
                    'scheduled_at' => $appointment->scheduled_at,
                    'ends_at' => $appointment->ends_at,
                ]);
                $this->audit($request, 'guidance_appointment.student_confirmed', $appointment);
            }

            return $appointment;
        });

        $appointment->loadMissing('counselor:id,name,email');
        $notificationPolicies->refreshAppointmentReminders($appointment);
        if ($newlyConfirmed && $appointment->counselor !== null) {
            $notifier->notify(
                $appointment->counselor,
                'appointment_student_confirmed',
                'Student confirmed appointment',
                'A student confirmed the guidance appointment schedule.',
                ['appointmentId' => $appointment->getKey(), 'studentId' => $appointment->student_id],
            );
        }

        return response()->json(['data' => $this->payload($appointment->load(['counselor:id,name', 'events.actor:id,name']))]);
    }

    public function cancel(Request $request, GuidanceAppointment $guidanceAppointment, PathwaysNotifier $notifier, NotificationPolicyScheduler $notificationPolicies): JsonResponse
    {
        $this->assertOwnedBy($request, $guidanceAppointment);
        $validated = $request->validate(['reason' => ['required', 'string', 'min:3', 'max:1000']]);

        $appointment = DB::transaction(function () use ($request, $guidanceAppointment, $validated): GuidanceAppointment {
            $appointment = GuidanceAppointment::query()->lockForUpdate()->findOrFail($guidanceAppointment->getKey());
            abort_unless($appointment->status === 'scheduled', 409, 'Only a scheduled appointment can be cancelled.');
            abort_if($appointment->scheduled_at?->isPast(), 409, 'A past appointment cannot be cancelled by the student.');

            $appointment->update([
                'status' => 'cancelled',
                'cancellation_reason' => trim($validated['reason']),
            ]);
            $appointment->events()->create([
                'actor_id' => $request->user()->getKey(),
                'event_type' => 'status_changed',
                'from_status' => 'scheduled',
                'to_status' => 'cancelled',
                'scheduled_at' => $appointment->scheduled_at,
                'ends_at' => $appointment->ends_at,
                'reason' => $appointment->cancellation_reason,
            ]);
            $guidanceRequest = GuidanceRequest::query()
                ->where('appointment_id', $appointment->getKey())
                ->lockForUpdate()
                ->first();
            if ($guidanceRequest?->status === 'scheduled') {
                $guidanceRequest->update([
                    'status' => 'cancelled',
                    'closed_at' => now(),
                    'resolution_reason' => $appointment->cancellation_reason,
                ]);
                $guidanceRequest->events()->create([
                    'actor_id' => $request->user()->getKey(),
                    'event_type' => 'cancelled',
                    'from_status' => 'scheduled',
                    'to_status' => 'cancelled',
                    'reason' => $appointment->cancellation_reason,
                ]);
            }
            $this->audit($request, 'guidance_appointment.student_cancelled', $appointment);

            return $appointment;
        });

        $appointment->loadMissing('counselor:id,name,email');
        $notificationPolicies->refreshAppointmentReminders($appointment);
        if ($appointment->counselor !== null) {
            $notifier->notify(
                $appointment->counselor,
                'appointment_cancelled_by_student',
                'Student cancelled appointment',
                'A student cancelled a scheduled guidance appointment. Review the recorded reason.',
                ['appointmentId' => $appointment->getKey(), 'studentId' => $appointment->student_id],
            );
        }

        return response()->json(['data' => $this->payload($appointment->load(['counselor:id,name', 'events.actor:id,name']))]);
    }

    private function assertOwnedBy(Request $request, GuidanceAppointment $appointment): void
    {
        abort_unless($appointment->student_id === $request->user()->getKey(), 404);
    }

    /** @return array<string, mixed> */
    private function payload(GuidanceAppointment $appointment): array
    {
        return [
            'id' => $appointment->getKey(),
            'counselorName' => $appointment->counselor?->name,
            'scheduledAt' => $appointment->scheduled_at?->toAtomString(),
            'endsAt' => $appointment->ends_at?->toAtomString(),
            'topic' => $appointment->topic,
            'programmeCode' => $appointment->programme_code,
            'status' => $appointment->status,
            'cancellationReason' => $appointment->cancellation_reason,
            'studentConfirmedAt' => $appointment->student_confirmed_at?->toAtomString(),
            'statusHistory' => $appointment->events->map(static fn (GuidanceAppointmentEvent $event): array => [
                'eventType' => $event->event_type,
                'fromStatus' => $event->from_status,
                'toStatus' => $event->to_status,
                'reason' => $event->reason,
                'actor' => $event->actor?->name,
                'createdAt' => $event->created_at?->toAtomString(),
            ])->values()->all(),
        ];
    }

    private function audit(Request $request, string $action, GuidanceAppointment $appointment): void
    {
        AdminAuditEvent::query()->create([
            'actor_id' => $request->user()->getKey(),
            'action' => $action,
            'subject_type' => 'guidance_appointment',
            'subject_reference' => (string) $appointment->getKey(),
            'metadata' => ['status' => $appointment->status, 'scheduled_at' => $appointment->scheduled_at?->toAtomString()],
        ]);
    }
}
