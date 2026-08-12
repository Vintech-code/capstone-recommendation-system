<?php

namespace App\Services\Recommendation;

use App\Models\ProgrammeSourceRecord;
use Carbon\CarbonImmutable;

final class ProgrammeSourceRegistry
{
    /** @param array<string, mixed> $catalogue @return array<int, array<string, mixed>> */
    public function entries(array $catalogue): array
    {
        $sources = [];
        foreach ($catalogue['programmes'] ?? [] as $programme) {
            foreach (['duration', 'salary', 'job_growth'] as $kind) {
                $value = $programme[$kind] ?? null;
                if (! is_array($value) || empty($value['source_url']) || empty($value['source_name'])) {
                    continue;
                }

                $reference = $this->reference((string) $value['source_url']);
                $sources[$reference] ??= [
                    'reference' => $reference,
                    'sourceName' => (string) $value['source_name'],
                    'sourceUrl' => (string) $value['source_url'],
                    'programmeIds' => [],
                    'fields' => [],
                    'recordedStatuses' => [],
                ];
                $sources[$reference]['programmeIds'][] = (string) ($programme['id'] ?? '');
                $sources[$reference]['fields'][] = $kind;
                if (! empty($value['status'])) {
                    $sources[$reference]['recordedStatuses'][] = (string) $value['status'];
                }
            }
        }

        $stored = ProgrammeSourceRecord::query()
            ->with('verifier:id,name')
            ->whereIn('reference', array_keys($sources))
            ->get()
            ->keyBy('reference');

        return collect($sources)->map(function (array $source, string $reference) use ($stored): array {
            $record = $stored->get($reference);
            $source['programmeIds'] = array_values(array_unique(array_filter($source['programmeIds'])));
            $source['fields'] = array_values(array_unique($source['fields']));
            $source['recordedStatuses'] = array_values(array_unique($source['recordedStatuses']));
            $source['lastVerifiedAt'] = $record?->last_verified_at?->toDateString();
            $source['verifiedBy'] = $record?->verifier?->name;
            $reviewDays = max(1, (int) config('pathways.source_review_days', 180));
            $nextReviewAt = $record?->last_verified_at?->addDays($reviewDays);
            $source['reviewIntervalDays'] = $reviewDays;
            $source['nextReviewAt'] = $nextReviewAt?->toDateString();
            $source['reviewStatus'] = $record === null
                ? 'not_verified'
                : ($nextReviewAt->lessThanOrEqualTo(CarbonImmutable::today()) ? 'review_due' : 'current');

            return $source;
        })->values()->all();
    }

    /** @param array<string, mixed> $catalogue @return array<string, mixed>|null */
    public function find(array $catalogue, string $reference): ?array
    {
        return collect($this->entries($catalogue))->firstWhere('reference', $reference);
    }

    public function reference(string $url): string
    {
        return substr(hash('sha256', $url), 0, 32);
    }
}
