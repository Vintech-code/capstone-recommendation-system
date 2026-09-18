<?php

namespace App\Services\Admin;

use App\Models\AssessmentSession;
use App\Models\EntranceExaminationResult;
use App\Models\RecommendationRun;
use App\Models\RoleSlug;
use App\Models\StudentSavedProgramme;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

final class AdminReportService
{
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
            'eligibilityDistribution' => [
                'board' => (int) ($eligibility['board'] ?? 0),
                'nonBoard' => (int) ($eligibility['non_board'] ?? 0),
            ],
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
            'programmeSaves' => $savedProgrammeQuery->count(),
            'retakeMetrics' => [
                'totalAssessmentAttempts' => (clone $assessmentActivityQuery)->count(),
                'totalCompletedAttempts' => (clone $completionEventQuery)->count(),
                'studentsWithRetakes' => AssessmentSession::query()
                    ->where('status', 'result_available')
                    ->selectRaw('user_id, count(*) as completed_count')
                    ->groupBy('user_id')
                    ->havingRaw('count(*) > 1')
                    ->get()
                    ->count(),
                'totalRetakeAttempts' => (clone $assessmentActivityQuery)->where('attempt_number', '>', 1)->count(),
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
