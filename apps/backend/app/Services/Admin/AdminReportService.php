<?php

namespace App\Services\Admin;

use App\Models\RecommendationRun;
use App\Models\StudentEnrollment;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Database\Eloquent\Builder;

final class AdminReportService
{
    public function __construct(
        private readonly TccProgrammeCatalogueRepository $catalogues,
    ) {}

    /** @return array<string, mixed> */
    public function generate(?string $from, ?string $to): array
    {
        return [
            'generatedAt' => now()->toAtomString(),
            'from' => $from,
            'to' => $to,
            'scope' => 'institution',
            'enrollmentAlignment' => $this->enrollmentAlignment($from, $to),
        ];
    }

    /** @return array<string, mixed> */
    private function enrollmentAlignment(?string $from, ?string $to): array
    {
        $catalogue = $this->catalogues->current();
        $programmes = collect($catalogue['programmes'] ?? []);
        $programmesById = $programmes->keyBy('id');
        $counts = $programmes->mapWithKeys(static fn (array $programme): array => [
            (string) $programme['id'] => [
                'programmeId' => (string) $programme['id'],
                'programmeCode' => (string) ($programme['short_label'] ?? $programme['id']),
                'programmeName' => (string) ($programme['display_name'] ?? $programme['id']),
                'recommended' => 0,
                'aligned' => 0,
                'notAligned' => 0,
                'unallocated' => 0,
                'alternateEnrollmentCounts' => [],
            ],
        ])->all();

        $latestRuns = RecommendationRun::query()
            ->when($from, fn (Builder $query) => $query->whereDate('generated_at', '>=', $from))
            ->when($to, fn (Builder $query) => $query->whereDate('generated_at', '<=', $to))
            ->latest('generated_at')
            ->get(['user_id', 'ranked_courses'])
            ->unique('user_id');

        $enrollments = StudentEnrollment::query()
            ->get(['user_id', 'enrolled_programme_id', 'verification_status'])
            ->keyBy('user_id');

        foreach ($latestRuns as $run) {
            $topCourse = $run->ranked_courses[0] ?? null;
            $topProgrammeId = is_array($topCourse) ? (string) ($topCourse['id'] ?? '') : '';
            if ($topProgrammeId === '' || ! isset($counts[$topProgrammeId])) {
                continue;
            }

            $counts[$topProgrammeId]['recommended']++;
            $enrollment = $enrollments->get($run->user_id);

            if (! $enrollment instanceof StudentEnrollment || $enrollment->verification_status !== 'verified') {
                $counts[$topProgrammeId]['unallocated']++;
            } elseif ($enrollment->enrolled_programme_id === $topProgrammeId) {
                $counts[$topProgrammeId]['aligned']++;
            } else {
                $counts[$topProgrammeId]['notAligned']++;
                $enrolledProgrammeId = $enrollment->enrolled_programme_id;
                $counts[$topProgrammeId]['alternateEnrollmentCounts'][$enrolledProgrammeId] =
                    ($counts[$topProgrammeId]['alternateEnrollmentCounts'][$enrolledProgrammeId] ?? 0) + 1;
            }
        }

        $programsList = collect($counts)
            ->map(static function (array $row) use ($programmesById): array {
                $recommended = $row['recommended'];
                $alternateEnrollments = collect($row['alternateEnrollmentCounts'])
                    ->map(function (int $count, string $programmeId) use ($programmesById): array {
                        $programme = $programmesById->get($programmeId);

                        return [
                            'programmeId' => $programmeId,
                            'programmeCode' => is_array($programme)
                                ? (string) ($programme['short_label'] ?? $programmeId)
                                : $programmeId,
                            'programmeName' => is_array($programme)
                                ? (string) ($programme['display_name'] ?? $programmeId)
                                : $programmeId,
                            'count' => $count,
                        ];
                    })
                    ->sortBy([
                        ['count', 'desc'],
                        ['programmeName', 'asc'],
                    ])
                    ->values()
                    ->all();
                unset($row['alternateEnrollmentCounts']);

                return [
                    ...$row,
                    'verifiedEnrolled' => $row['aligned'] + $row['notAligned'],
                    'alternateEnrollments' => $alternateEnrollments,
                    'alignmentRate' => $recommended > 0
                        ? round(($row['aligned'] / $recommended) * 100, 2)
                        : 0.0,
                ];
            })
            ->sortBy([
                ['recommended', 'desc'],
                ['programmeName', 'asc'],
            ])
            ->values()
            ->all();

        $totalRecommended = array_sum(array_column($programsList, 'recommended'));
        $totalAligned = array_sum(array_column($programsList, 'aligned'));
        $totalNotAligned = array_sum(array_column($programsList, 'notAligned'));
        $totalUnallocated = array_sum(array_column($programsList, 'unallocated'));
        $totalVerifiedEnrolled = $totalAligned + $totalNotAligned;

        return [
            'programs' => $programsList,
            'overall' => [
                'recommended' => $totalRecommended,
                'aligned' => $totalAligned,
                'notAligned' => $totalNotAligned,
                'unallocated' => $totalUnallocated,
                'verifiedEnrolled' => $totalVerifiedEnrolled,
                'alignmentRate' => $totalRecommended > 0
                    ? round(($totalAligned / $totalRecommended) * 100, 2)
                    : 0.0,
            ],
        ];
    }
}
