<?php

namespace App\Services\Admin;

use App\Models\RecommendationFeedback;
use App\Models\RoleSlug;
use App\Models\User;
use App\Services\Assessment\ResultCardPresenter;
use App\Services\Recommendation\ProgrammeRankPresenter;
use Illuminate\Database\Eloquent\Builder;

final class AdminRecommendationFeedbackService
{
    public function __construct(
        private readonly ProgrammeRankPresenter $rankPresenter,
        private readonly ResultCardPresenter $resultPresenter,
    ) {}

    /** @return array<string, mixed> */
    public function generate(?string $from, ?string $to): array
    {
        $query = RecommendationFeedback::query()
            ->with([
                'recommendationRun:id,assessment_session_id,ranked_courses,generated_at',
                'recommendationRun.assessmentSession:id,result_payload',
            ])
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

        $studentOrderMap = User::query()
            ->whereHas('roles', static fn (Builder $roleQuery) => $roleQuery->where('slug', RoleSlug::Student->value))
            ->orderBy('created_at')
            ->orderBy('id')
            ->pluck('id')
            ->flip()
            ->map(static fn (int $index): int => $index + 1);

        $respondents = $latestStudentProgrammeResponses
            ->groupBy('user_id')
            ->map(function ($responses, int|string $userId) use ($studentOrderMap): array {
                $programmeFeedback = $responses
                    ->sortByDesc('updated_at')
                    ->map(fn (RecommendationFeedback $feedback): array => [
                        'programmeId' => $feedback->programme_id,
                        'programmeName' => $this->programmeName($feedback),
                        'rating' => $feedback->rating,
                        'comment' => is_string($feedback->comment) && trim($feedback->comment) !== ''
                            ? $feedback->comment
                            : null,
                        'updatedAt' => $feedback->updated_at?->toAtomString(),
                    ])
                    ->values();

                $resultSets = $responses
                    ->groupBy('recommendation_run_id')
                    ->map(function ($resultResponses): array {
                        /** @var RecommendationFeedback|null $first */
                        $first = $resultResponses->first();
                        $run = $first?->recommendationRun;
                        $session = $run?->assessmentSession;
                        $feedbackByProgramme = $resultResponses->keyBy('programme_id');
                        $recommendations = collect($this->rankPresenter->dense($run?->ranked_courses ?? []))
                            ->map(function (array $course) use ($feedbackByProgramme): array {
                                $programmeId = (string) ($course['id'] ?? '');
                                /** @var RecommendationFeedback|null $feedback */
                                $feedback = $feedbackByProgramme->get($programmeId);

                                return [
                                    'programmeId' => $programmeId,
                                    'programmeCode' => (string) ($course['code'] ?? ''),
                                    'programmeName' => (string) ($course['name'] ?? $programmeId),
                                    'rank' => (int) ($course['rank'] ?? 0),
                                    'match' => round((float) ($course['match'] ?? 0), 2),
                                    'feedback' => $feedback instanceof RecommendationFeedback
                                        ? [
                                            'rating' => $feedback->rating,
                                            'comment' => is_string($feedback->comment) && trim($feedback->comment) !== ''
                                                ? $feedback->comment
                                                : null,
                                            'updatedAt' => $feedback->updated_at?->toAtomString(),
                                        ]
                                        : null,
                                ];
                            })
                            ->values();

                        $assessmentResult = null;
                        if ($session !== null) {
                            $profileVariants = $this->resultPresenter->profileVariants($session);
                            $assessmentResult = [
                                'topCode' => $profileVariants['variants'][0]['code'] ?? null,
                                'profileVariantVersion' => $profileVariants['version'],
                                'profileVariants' => array_map(
                                    static fn (array $variant): array => [
                                        'code' => $variant['code'],
                                        'labels' => $variant['labels'],
                                    ],
                                    $profileVariants['variants'],
                                ),
                                'dimensions' => $this->resultPresenter->dimensions($session),
                            ];
                        }

                        return [
                            'resultDate' => $run?->generated_at?->toAtomString(),
                            'assessmentResult' => $assessmentResult,
                            'recommendationCount' => $recommendations->count(),
                            'feedbackCount' => $resultResponses->count(),
                            'recommendations' => $recommendations->all(),
                        ];
                    })
                    ->sortByDesc('resultDate')
                    ->values()
                    ->map(static fn (array $resultSet, int $index): array => [
                        'resultSetNumber' => $index + 1,
                        ...$resultSet,
                    ]);

                return [
                    'respondentNumber' => (int) ($studentOrderMap->get((int) $userId) ?? $userId),
                    'responseCount' => $programmeFeedback->count(),
                    'commentCount' => $programmeFeedback
                        ->filter(static fn (array $feedback): bool => $feedback['comment'] !== null)
                        ->count(),
                    'averageRating' => round((float) $responses->avg('rating'), 1),
                    'latestUpdatedAt' => $responses->max('updated_at')?->toAtomString(),
                    'programmeFeedback' => $programmeFeedback->all(),
                    'resultSets' => $resultSets->all(),
                ];
            })
            ->sortByDesc('latestUpdatedAt')
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
            'respondents' => $respondents->all(),
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
