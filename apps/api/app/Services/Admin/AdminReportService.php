<?php

namespace App\Services\Admin;

use App\Models\AssessmentSession;
use App\Models\ConfigurationVersion;
use App\Models\EntranceExaminationResult;
use App\Models\RecommendationRun;
use App\Models\RoleSlug;
use App\Models\StudentSavedProgramme;
use App\Models\User;
use App\Services\Recommendation\ProgrammeSourceRegistry;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Database\Eloquent\Builder;

final class AdminReportService
{
    public function __construct(
        private readonly TccProgrammeCatalogueRepository $catalogues,
        private readonly ProgrammeSourceRegistry $sourceRegistry,
    ) {}

    /** @return array<string, mixed> */
    public function generate(?string $from, ?string $to): array
    {
        $period = static function (Builder $query, string $column) use ($from, $to): Builder {
            return $query
                ->when($from, fn (Builder $builder) => $builder->whereDate($column, '>=', $from))
                ->when($to, fn (Builder $builder) => $builder->whereDate($column, '<=', $to));
        };

        $assessmentActivityQuery = AssessmentSession::query();
        $period($assessmentActivityQuery, 'started_at');
        $completedStudents = (clone $assessmentActivityQuery)
            ->where('status', 'result_available')
            ->distinct()
            ->count('user_id');
        $assessmentActivity = (clone $assessmentActivityQuery)->distinct()->count('user_id');
        $assessmentStatusCounts = (clone $assessmentActivityQuery)
            ->selectRaw('status, count(distinct user_id) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $declarationQuery = EntranceExaminationResult::query()->whereNull('superseded_at');
        $period($declarationQuery, 'declared_at');
        $declarations = (clone $declarationQuery)->distinct()->count('user_id');
        $eligibility = (clone $declarationQuery)
            ->selectRaw('eligibility_group, count(distinct user_id) as aggregate')
            ->groupBy('eligibility_group')
            ->pluck('aggregate', 'eligibility_group');

        $completionEventQuery = AssessmentSession::query()->where('status', 'result_available');
        $period($completionEventQuery, 'result_available_at');

        $runs = RecommendationRun::query()
            ->when($from, fn (Builder $query) => $query->whereDate('generated_at', '>=', $from))
            ->when($to, fn (Builder $query) => $query->whereDate('generated_at', '<=', $to))
            ->get(['user_id']);

        $savedProgrammeQuery = StudentSavedProgramme::query();
        $period($savedProgrammeQuery, 'created_at');

        $recommendationGroups = RecommendationRun::query()
            ->when($from, fn (Builder $query) => $query->whereDate('generated_at', '>=', $from))
            ->when($to, fn (Builder $query) => $query->whereDate('generated_at', '<=', $to))
            ->get(['user_id', 'entrance_examination_snapshot'])
            ->groupBy(fn (RecommendationRun $run): string => (string) ($run->entrance_examination_snapshot['eligibilityGroup'] ?? 'unavailable'))
            ->map(fn ($group): int => $group->pluck('user_id')->unique()->count());

        $savedByEligibility = (clone $savedProgrammeQuery)
            ->with('user.currentEntranceExaminationResult')
            ->get()
            ->groupBy(fn (StudentSavedProgramme $save): string => (string) ($save->user?->currentEntranceExaminationResult?->eligibility_group ?? 'unavailable'))
            ->map->count();

        $sources = collect($this->sourceRegistry->entries($this->catalogues->current()));
        $completionMonths = (clone $completionEventQuery)
            ->get(['user_id', 'result_available_at'])
            ->groupBy(static fn (AssessmentSession $session): string => $session->result_available_at->format('Y-m'))
            ->sortKeys()
            ->map(static fn ($sessions, string $month): array => [
                'month' => $month,
                'count' => $sessions->pluck('user_id')->unique()->count(),
            ])
            ->values()
            ->all();

        return [
            'generatedAt' => now()->toAtomString(),
            'from' => $from,
            'to' => $to,
            'scope' => 'institution',
            'studentCount' => $this->studentQuery()->count(),
            'entranceDeclarations' => $declarations,
            'eligibilityDistribution' => [
                'board' => (int) ($eligibility['board'] ?? 0),
                'nonBoard' => (int) ($eligibility['non_board'] ?? 0),
            ],
            'assessmentActivity' => $assessmentActivity,
            'completedAssessments' => $completedStudents,
            'assessmentCompletionRate' => $assessmentActivity > 0 ? round(($completedStudents / $assessmentActivity) * 100, 1) : 0,
            'assessmentFunnel' => [
                'started' => $assessmentActivity,
                'inProgress' => (int) ($assessmentStatusCounts['in_progress'] ?? 0),
                'processing' => (int) ($assessmentStatusCounts['preparing_result'] ?? 0),
                'resultAvailable' => (int) ($assessmentStatusCounts['result_available'] ?? 0),
                'failed' => (int) ($assessmentStatusCounts['result_failed'] ?? 0),
            ],
            'recommendationRuns' => $runs->pluck('user_id')->filter()->unique()->count(),
            'recommendationsByEligibility' => [
                'board' => (int) ($recommendationGroups['board'] ?? 0),
                'nonBoard' => (int) ($recommendationGroups['non_board'] ?? 0),
            ],
            'programmeSaves' => $savedProgrammeQuery->count(),
            'programmeSavesByEligibility' => [
                'board' => (int) ($savedByEligibility['board'] ?? 0),
                'nonBoard' => (int) ($savedByEligibility['non_board'] ?? 0),
            ],
            'catalogueGovernance' => [
                'currentSources' => $sources->where('reviewStatus', 'current')->count(),
                'reviewDueSources' => $sources->where('reviewStatus', 'review_due')->count(),
                'unverifiedSources' => $sources->where('reviewStatus', 'not_verified')->count(),
                'draftVersions' => ConfigurationVersion::query()->where('status', 'draft')->count(),
            ],
            'assessmentCompletionsByMonth' => $completionMonths,
        ];
    }

    /** @return Builder<User> */
    private function studentQuery(): Builder
    {
        return User::query()->whereHas('roles', static fn (Builder $query) => $query->where('slug', RoleSlug::Student->value));
    }
}
