<?php

namespace App\Services\Notifications;

use App\Models\ConfigurationVersion;
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
                    if ($dispatch->event_type !== 'programme_updated') {
                        $dispatch->update(['status' => 'invalidated', 'open_key' => null, 'invalidated_at' => $now]);

                        return false;
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

    private function send(User $recipient, NotificationDispatch $dispatch): void
    {
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
