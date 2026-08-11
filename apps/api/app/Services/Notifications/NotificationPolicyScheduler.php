<?php

namespace App\Services\Notifications;

use App\Models\ConfigurationVersion;
use App\Models\CounselorAvailabilityWindow;
use App\Models\GuidanceAppointment;
use App\Models\NotificationDispatch;
use App\Models\RecommendationRun;
use App\Models\StudentSavedProgramme;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class NotificationPolicyScheduler
{
    public function __construct(private readonly PathwaysNotifier $notifier) {}

    public function refreshAppointmentReminders(GuidanceAppointment $appointment): void
    {
        $appointment->refresh();
        $desired = [];
        $now = CarbonImmutable::now('UTC');
        $appointmentAt = $appointment->scheduled_at === null
            ? null
            : CarbonImmutable::instance($appointment->scheduled_at)->utc();

        if ($appointment->status === 'scheduled'
            && $appointment->student_confirmed_at !== null
            && $appointmentAt?->isFuture()) {
            foreach (config('notifications.appointment_reminder_minutes', [1440, 60]) as $minutes) {
                $raw = $appointmentAt->subMinutes((int) $minutes);
                if (! $raw->isFuture()) {
                    continue;
                }
                $scheduledFor = $this->nextOfficeTime($appointment->counselor_id, $raw);
                if ($scheduledFor === null || $scheduledFor->greaterThanOrEqualTo($appointmentAt)) {
                    continue;
                }
                $deduplicationKey = hash('sha256', implode(':', [
                    'appointment-reminder',
                    $appointment->getKey(),
                    $appointmentAt->toAtomString(),
                    $minutes,
                ]));
                $desired[$deduplicationKey] = [
                    'minutes' => (int) $minutes,
                    'scheduledFor' => $scheduledFor,
                ];
            }
        }

        DB::transaction(function () use ($appointment, $desired, $now): void {
            $pending = NotificationDispatch::query()
                ->where('subject_type', 'guidance_appointment')
                ->where('subject_reference', (string) $appointment->getKey())
                ->where('status', 'pending')
                ->lockForUpdate()
                ->get();

            foreach ($pending as $dispatch) {
                if (! isset($desired[$dispatch->deduplication_key])) {
                    $dispatch->update([
                        'status' => 'invalidated',
                        'open_key' => null,
                        'invalidated_at' => $now,
                    ]);
                }
            }

            foreach ($desired as $deduplicationKey => $details) {
                $existing = NotificationDispatch::query()
                    ->where('deduplication_key', $deduplicationKey)
                    ->lockForUpdate()
                    ->first();
                if ($existing?->status === 'sent' || $existing?->status === 'pending') {
                    continue;
                }

                $values = [
                    'recipient_id' => $appointment->student_id,
                    'event_type' => 'appointment_reminder',
                    'subject_type' => 'guidance_appointment',
                    'subject_reference' => (string) $appointment->getKey(),
                    'deduplication_key' => $deduplicationKey,
                    'open_key' => "appointment-reminder:{$appointment->getKey()}:{$details['minutes']}",
                    'scheduled_for' => $details['scheduledFor'],
                    'status' => 'pending',
                    'payload' => [
                        'appointmentId' => $appointment->getKey(),
                        'scheduledAt' => $appointment->scheduled_at?->toAtomString(),
                        'intervalMinutes' => $details['minutes'],
                        'timezone' => 'Asia/Manila',
                    ],
                    'sent_at' => null,
                    'invalidated_at' => null,
                ];

                if ($existing !== null) {
                    $existing->update($values);
                } else {
                    NotificationDispatch::query()->create($values);
                }
            }
        });
    }

    /** @param array<string, mixed>|null $previousPayload */
    public function queuePublishedProgrammeUpdates(ConfigurationVersion $version, ?array $previousPayload): void
    {
        if ($version->kind !== 'catalogue' || $version->status !== 'published') {
            return;
        }

        $previous = collect($previousPayload['programmes'] ?? [])->keyBy('id');
        foreach ($version->payload['programmes'] ?? [] as $programme) {
            $programmeId = (string) ($programme['id'] ?? '');
            if ($programmeId === '' || $this->sameProgramme($previous->get($programmeId), $programme)) {
                continue;
            }

            $recipientIds = StudentSavedProgramme::query()
                ->where('programme_id', $programmeId)
                ->pluck('user_id');
            $recommendedIds = RecommendationRun::query()
                ->get(['user_id', 'ranked_courses'])
                ->filter(fn (RecommendationRun $run): bool => collect($run->ranked_courses ?? [])->contains(
                    fn (array $course): bool => ($course['id'] ?? null) === $programmeId,
                ))
                ->pluck('user_id');

            User::query()
                ->whereIn('id', $recipientIds->merge($recommendedIds)->unique()->values())
                ->where('account_status', 'active')
                ->get()
                ->each(fn (User $student) => $this->queueProgrammeUpdate($student, $programme, $version));
        }
    }

    public function dispatchDue(?CarbonImmutable $now = null): int
    {
        $now ??= CarbonImmutable::now('UTC');
        $ids = NotificationDispatch::query()
            ->where('status', 'pending')
            ->where('scheduled_for', '<=', $now)
            ->orderBy('scheduled_for')
            ->limit(100)
            ->pluck('id');
        $sent = 0;

        foreach ($ids as $id) {
            try {
                $dispatched = DB::transaction(function () use ($id, $now): bool {
                    $dispatch = NotificationDispatch::query()->lockForUpdate()->find($id);
                    if ($dispatch === null || $dispatch->status !== 'pending') {
                        return false;
                    }
                    if ($dispatch->event_type === 'appointment_reminder' && ! $this->appointmentReminderStillValid($dispatch, $now)) {
                        $dispatch->update(['status' => 'invalidated', 'open_key' => null, 'invalidated_at' => $now]);

                        return false;
                    }
                    if ($dispatch->event_type === 'appointment_reminder') {
                        $appointment = GuidanceAppointment::query()->findOrFail($dispatch->subject_reference);
                        $nextOfficeTime = $this->nextOfficeTime($appointment->counselor_id, $now);
                        $appointmentAt = CarbonImmutable::instance($appointment->scheduled_at)->utc();
                        if ($nextOfficeTime === null || $nextOfficeTime->greaterThanOrEqualTo($appointmentAt)) {
                            $dispatch->update(['status' => 'invalidated', 'open_key' => null, 'invalidated_at' => $now]);

                            return false;
                        }
                        if ($nextOfficeTime->greaterThan($now)) {
                            $dispatch->update(['scheduled_for' => $nextOfficeTime]);

                            return false;
                        }
                    }

                    $recipient = $dispatch->recipient()->where('account_status', 'active')->first();
                    if ($recipient === null) {
                        $dispatch->update(['status' => 'invalidated', 'open_key' => null, 'invalidated_at' => $now]);

                        return false;
                    }

                    $this->send($recipient, $dispatch);
                    $dispatch->update(['status' => 'sent', 'open_key' => null, 'sent_at' => $now]);

                    return true;
                });
                $sent += $dispatched ? 1 : 0;
            } catch (\Throwable $exception) {
                Log::warning('A scheduled in-app notification could not be dispatched.', [
                    'dispatch_id' => $id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return $sent;
    }

    private function nextOfficeTime(int $counselorId, CarbonImmutable $requested): ?CarbonImmutable
    {
        $windows = CounselorAvailabilityWindow::query()
            ->where('counselor_id', $counselorId)
            ->orderBy('weekday')
            ->orderBy('starts_at')
            ->get()
            ->groupBy('weekday');
        if ($windows->isEmpty()) {
            return null;
        }

        $requestedManila = $requested->setTimezone('Asia/Manila');
        for ($offset = 0; $offset <= 7; $offset++) {
            $date = $requestedManila->startOfDay()->addDays($offset);
            foreach ($windows->get($date->dayOfWeek, collect()) as $window) {
                $start = $date->setTimeFromTimeString($window->starts_at);
                $end = $date->setTimeFromTimeString($window->ends_at);
                if ($offset === 0 && $requestedManila->betweenIncluded($start, $end)) {
                    return $requestedManila->utc();
                }
                if ($start->greaterThanOrEqualTo($requestedManila)) {
                    return $start->utc();
                }
            }
        }

        return null;
    }

    /** @param array<string, mixed> $programme */
    private function queueProgrammeUpdate(User $student, array $programme, ConfigurationVersion $version): void
    {
        $programmeId = (string) $programme['id'];
        $openKey = "programme-update:{$student->getKey()}:{$programmeId}";
        DB::transaction(function () use ($student, $programme, $programmeId, $version, $openKey): void {
            $alreadyRecorded = NotificationDispatch::query()
                ->where('recipient_id', $student->getKey())
                ->where('event_type', 'programme_updated')
                ->where('subject_reference', $programmeId)
                ->lockForUpdate()
                ->get()
                ->contains(fn (NotificationDispatch $dispatch): bool => in_array($version->getKey(), $dispatch->payload['versionIds'] ?? [], true));
            if ($alreadyRecorded) {
                return;
            }

            $existing = NotificationDispatch::query()->where('open_key', $openKey)->lockForUpdate()->first();
            $versions = collect($existing?->payload['versionIds'] ?? [])->push($version->getKey())->unique()->values()->all();
            $payload = [
                'programmeId' => $programmeId,
                'programmeCode' => $programme['short_label'] ?? null,
                'programmeName' => $programme['display_name'] ?? 'Programme',
                'versionIds' => $versions,
                'publishedAt' => $version->published_at?->toAtomString(),
            ];
            if ($existing !== null) {
                $existing->update(['payload' => $payload]);

                return;
            }

            NotificationDispatch::query()->create([
                'recipient_id' => $student->getKey(),
                'event_type' => 'programme_updated',
                'subject_type' => 'programme',
                'subject_reference' => $programmeId,
                'deduplication_key' => hash('sha256', "programme-update:{$student->getKey()}:{$programmeId}:{$version->getKey()}"),
                'open_key' => $openKey,
                'scheduled_for' => now()->addMinutes((int) config('notifications.programme_update_batch_minutes', 15)),
                'status' => 'pending',
                'payload' => $payload,
            ]);
        });
    }

    private function appointmentReminderStillValid(NotificationDispatch $dispatch, CarbonImmutable $now): bool
    {
        $appointment = GuidanceAppointment::query()->find($dispatch->subject_reference);

        return $appointment !== null
            && $appointment->status === 'scheduled'
            && $appointment->student_confirmed_at !== null
            && $appointment->scheduled_at?->isFuture()
            && $appointment->scheduled_at?->toAtomString() === ($dispatch->payload['scheduledAt'] ?? null)
            && CarbonImmutable::instance($appointment->scheduled_at)->utc()->greaterThan($now);
    }

    private function send(User $recipient, NotificationDispatch $dispatch): void
    {
        if ($dispatch->event_type === 'appointment_reminder') {
            $hours = ((int) $dispatch->payload['intervalMinutes']) === 1440 ? '24 hours' : '1 hour';
            $this->notifier->notify(
                $recipient,
                'appointment_reminder',
                "Guidance appointment in {$hours}",
                'Your confirmed guidance appointment is approaching. Review the schedule before attending.',
                ['appointmentId' => (int) $dispatch->subject_reference, 'dispatchId' => $dispatch->getKey()],
            );

            return;
        }

        $this->notifier->notify(
            $recipient,
            'programme_updated',
            'Programme information updated',
            ($dispatch->payload['programmeName'] ?? 'A programme').' has published information updates for you to review.',
            ['programmeId' => $dispatch->subject_reference, 'dispatchId' => $dispatch->getKey()],
        );
    }

    /** @param array<string, mixed>|null $before @param array<string, mixed> $after */
    private function sameProgramme(?array $before, array $after): bool
    {
        return $before !== null
            && json_encode($before, JSON_THROW_ON_ERROR) === json_encode($after, JSON_THROW_ON_ERROR);
    }
}
