<?php

namespace App\Services\Admin;

use App\Models\RecommendationFeedback;
use Illuminate\Database\Eloquent\Builder;

final class AdminRecommendationFeedbackService
{
    /** @return array<string, mixed> */
    public function generate(?string $from, ?string $to): array
    {
        $query = RecommendationFeedback::query()
            ->with('recommendationRun:id,ranked_courses')
            ->when($from, fn (Builder $builder) => $builder->whereDate('updated_at', '>=', $from))
            ->when($to, fn (Builder $builder) => $builder->whereDate('updated_at', '<=', $to))
            ->latest('updated_at');

        $latestStudentProgrammeResponses = $query
            ->get([
                'id',
                'user_id',
                'recommendation_run_id',
                'programme_id',
                'rating',
                'comment',
                'updated_at',
            ])
            ->unique(static fn (RecommendationFeedback $feedback): string => $feedback->user_id.'|'.$feedback->programme_id);

        $grouped = $latestStudentProgrammeResponses->groupBy('programme_id');
        $programmes = $grouped
            ->map(function ($responses, string $programmeId): array {
                $first = $responses->first();

                return [
                    'programmeId' => $programmeId,
                    'programmeName' => $first instanceof RecommendationFeedback
                        ? $this->programmeName($first)
                        : $programmeId,
                    'respondentCount' => $responses->count(),
                    'averageRating' => round((float) $responses->avg('rating'), 1),
                    'ratingDistribution' => collect(range(1, 5))
                        ->mapWithKeys(static fn (int $rating): array => [
                            (string) $rating => $responses->where('rating', $rating)->count(),
                        ])
                        ->all(),
                ];
            })
            ->sortBy([
                ['respondentCount', 'desc'],
                ['programmeName', 'asc'],
            ])
            ->values();

        $comments = $latestStudentProgrammeResponses
            ->filter(static fn (RecommendationFeedback $feedback): bool => is_string($feedback->comment)
                && trim($feedback->comment) !== '')
            ->map(fn (RecommendationFeedback $feedback): array => [
                'programmeId' => $feedback->programme_id,
                'programmeName' => $this->programmeName($feedback),
                'rating' => $feedback->rating,
                'comment' => $feedback->comment,
                'updatedAt' => $feedback->updated_at?->toAtomString(),
            ])
            ->values();

        return [
            'generatedAt' => now()->toAtomString(),
            'from' => $from,
            'to' => $to,
            'scope' => 'institution',
            'publishedResponseCount' => $latestStudentProgrammeResponses->count(),
            'publishedRespondentCount' => $latestStudentProgrammeResponses
                ->pluck('user_id')
                ->unique()
                ->count(),
            'eligibleProgrammeCount' => $programmes->count(),
            'programmes' => $programmes->all(),
            'commentCount' => $comments->count(),
            'comments' => $comments->all(),
        ];
    }

    private function programmeName(RecommendationFeedback $feedback): string
    {
        $recordedProgramme = collect($feedback->recommendationRun?->ranked_courses ?? [])
            ->first(static fn (mixed $course): bool => is_array($course)
                && ($course['id'] ?? null) === $feedback->programme_id);

        return is_array($recordedProgramme)
            ? (string) ($recordedProgramme['name'] ?? $feedback->programme_id)
            : $feedback->programme_id;
    }
}
