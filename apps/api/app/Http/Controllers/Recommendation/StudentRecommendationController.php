<?php

namespace App\Http\Controllers\Recommendation;

use App\Http\Controllers\Controller;
use App\Models\AssessmentSession;
use App\Models\RecommendationRun;
use App\Services\Assessment\RiasecQuestionnaire;
use App\Services\Recommendation\ProvisionalRiasecRecommendationEngine;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class StudentRecommendationController extends Controller
{
    public function latest(
        Request $request,
        ProvisionalRiasecRecommendationEngine $engine,
        TccProgrammeCatalogueRepository $catalogues,
    ): JsonResponse {
        $current = AssessmentSession::query()
            ->whereBelongsTo($request->user())
            ->where('instrument_code', RiasecQuestionnaire::INSTRUMENT_CODE)
            ->where('is_current', true)
            ->latest('attempt_number')
            ->first();

        $session = AssessmentSession::query()
            ->whereBelongsTo($request->user())
            ->whereIn('instrument_code', [RiasecQuestionnaire::INSTRUMENT_CODE, RiasecQuestionnaire::LEGACY_INSTRUMENT_CODE])
            ->where('status', 'result_available')
            ->with('recommendationRun')
            ->latest('result_available_at')
            ->first();

        if ($session === null && $current?->status === 'preparing_result') {
            return response()->json(['data' => ['status' => 'preparing', 'recommendation' => null]]);
        }

        return $this->forSession($request, $session, $engine, $catalogues);
    }

    public function show(
        Request $request,
        AssessmentSession $assessmentSession,
        ProvisionalRiasecRecommendationEngine $engine,
        TccProgrammeCatalogueRepository $catalogues,
    ): JsonResponse {
        abort_unless($assessmentSession->user_id === $request->user()->getKey(), 404);
        $assessmentSession->load('recommendationRun');

        return $this->forSession($request, $assessmentSession, $engine, $catalogues);
    }

    private function forSession(
        Request $request,
        ?AssessmentSession $session,
        ProvisionalRiasecRecommendationEngine $engine,
        TccProgrammeCatalogueRepository $catalogues,
    ): JsonResponse {

        $entries = $session?->result_payload['result'] ?? null;
        if ($session?->status !== 'result_available' || ! is_array($entries)) {
            return $this->notAvailable('ASSESSMENT_RESULT_UNAVAILABLE');
        }

        try {
            $catalogue = $catalogues->current();
        } catch (\JsonException) {
            return $this->notAvailable('RECOMMENDATION_CONFIGURATION_INVALID');
        }

        $run = $session->recommendationRun;
        if ($run === null) {
            try {
                $result = $engine->recommend(RiasecQuestionnaire::normalizeResultEntries($entries), $catalogue);
            } catch (DomainException) {
                return $this->notAvailable('RECOMMENDATION_CONFIGURATION_INVALID');
            }

            if ($result['ranked'] === []) {
                return $this->notAvailable('PROGRAMME_PROFILES_UNAVAILABLE');
            }

            $defaultCount = (int) ($catalogue['matching_policy']['display']['default_count'] ?? 3);
            $run = $session->recommendationRun()->firstOrCreate([], [
                'user_id' => $request->user()->getKey(),
                'catalogue_reference' => 'TCC-AY-'.$catalogue['academic_year'].'-V'.$catalogue['catalogue_version'],
                'rule_reference' => 'PROPOSED-RIASEC-1',
                'methodology_status' => 'Proposed methodology',
                'default_count' => $defaultCount,
                'total_eligible' => count($result['ranked']),
                'ranked_courses' => array_map([$this, 'coursePayload'], $result['ranked']),
                'generated_at' => now(),
            ]);
        }

        return response()->json(['data' => [
            'status' => 'available',
            'recommendation' => $this->recommendationPayload(
                $run,
                $session,
                RiasecQuestionnaire::normalizeResultEntries($entries),
                $request->query('view') === 'all',
                $catalogue,
            ),
        ]]);
    }

    /** @param array<string, mixed> $course
     * @return array<string, mixed>
     */
    private function coursePayload(array $course): array
    {
        return [
            'id' => $course['id'],
            'rank' => $course['rank'],
            'code' => $course['code'],
            'name' => $course['name'],
            'department' => '',
            'duration' => '',
            'level' => '',
            'match' => $course['match'],
            'eligibility' => 'Provisional',
            'summary' => $course['description'] ?: 'Based on the proposed RIASEC profile connected to this programme.',
            'factors' => array_map(static fn (string $code): string => "Profile includes {$code}", $course['profile']),
            'interestAreas' => $course['profile'],
            'learningAreas' => $course['learning_areas'],
            'learningAreaDescriptions' => $course['learning_area_descriptions'] ?? [],
            'careerDirections' => $course['career_directions'] ?? [],
            'reviewNotes' => array_values(array_filter([
                ...$course['requirements'],
                $course['readiness_prompt'],
            ])),
            'contentStatus' => $course['content_status'],
            'contentVersion' => $course['content_version'],
            'degreeType' => $course['degree_type'] ?? '',
            'durationSource' => $course['duration'] ?? null,
            'duration' => $course['duration']['display'] ?? '',
            'salary' => $course['salary'] ?? null,
            'jobGrowth' => $course['job_growth'] ?? null,
            'outlookVersion' => $course['outlook_version'] ?? null,
            'coverImageUrl' => $course['cover_image_url'] ?? null,
            'logoImageUrl' => $course['logo_image_url'] ?? null,
            'coverImagePosition' => $course['cover_image_position'] ?? null,
            'logoImagePosition' => $course['logo_image_position'] ?? null,
            'catalogueSnapshotVersion' => 1,
        ];
    }

    /** @return array<string, mixed> */
    private function recommendationPayload(
        RecommendationRun $run,
        AssessmentSession $session,
        array $entries,
        bool $viewAll,
        array $catalogue,
    ): array {
        $courses = $run->ranked_courses ?? [];
        $programmes = collect($catalogue['programmes'] ?? [])->keyBy('id');
        $courses = array_map(static function (array $course) use ($programmes): array {
            $programme = $programmes->get($course['id'], []);

            return array_merge($course, [
                'summary' => $programme['description'] ?? '',
                'learningAreas' => $programme['learning_areas'] ?? [],
                'learningAreaDescriptions' => $programme['learning_area_descriptions'] ?? [],
                'careerDirections' => $programme['career_directions'] ?? [],
                'reviewNotes' => array_values(array_filter([
                    ...($programme['requirements'] ?? []),
                    $programme['readiness_prompt'] ?? null,
                ])),
                'contentStatus' => $programme['content_status'] ?? 'proposed',
                'contentVersion' => $programme['content_version'] ?? '',
                'degreeType' => $programme['degree_type'] ?? '',
                'duration' => $programme['duration']['display'] ?? '',
                'durationSource' => $programme['duration'] ?? null,
                'salary' => $programme['salary'] ?? null,
                'jobGrowth' => $programme['job_growth'] ?? null,
                'outlookVersion' => $programme['outlook_version'] ?? null,
                'coverImageUrl' => $programme['cover_image_url'] ?? null,
                'logoImageUrl' => $programme['logo_image_url'] ?? null,
                'coverImagePosition' => $programme['cover_image_position'] ?? null,
                'logoImagePosition' => $programme['logo_image_position'] ?? null,
            ]);
        }, $courses);
        $visibleCourses = $viewAll ? $courses : array_slice($courses, 0, $run->default_count);
        $profile = $this->profilePayload($session, $entries);
        $visibleCourses = array_map(
            fn (array $course): array => array_merge($course, [
                'explanation' => $this->explanationPayload($course, $profile),
            ]),
            $visibleCourses,
        );

        return [
            'id' => 'REC-'.str_pad((string) $run->getKey(), 6, '0', STR_PAD_LEFT),
            'generatedAt' => $run->generated_at?->toAtomString(),
            'assessmentResultReference' => 'ASMT-'.str_pad((string) $run->assessment_session_id, 6, '0', STR_PAD_LEFT),
            'catalogueReference' => $run->catalogue_reference,
            'ruleReference' => $run->rule_reference,
            'status' => $run->methodology_status,
            'defaultCount' => $run->default_count,
            'totalEligible' => $run->total_eligible,
            'canViewAll' => $run->total_eligible > $run->default_count,
            'showingAll' => $viewAll,
            'guidanceContentStatus' => 'proposed',
            'profile' => $profile,
            'courses' => $visibleCourses,
        ];
    }

    /**
     * Build an explanation from recorded assessment values and the versioned
     * programme catalogue only. No additional interpretation or threshold is
     * introduced here.
     *
     * @param  array<string, mixed>  $course
     * @param  array<string, mixed>  $profile
     * @return array<string, mixed>
     */
    private function explanationPayload(array $course, array $profile): array
    {
        $dimensions = collect($profile['dimensions'] ?? [])->keyBy('code');
        $programmeAreas = array_values(array_filter(
            $course['interestAreas'] ?? [],
            static fn (mixed $area): bool => is_string($area) && $area !== '',
        ));
        $recordedProgrammeAreas = collect($programmeAreas)
            ->map(function (string $code) use ($dimensions): ?array {
                $dimension = $dimensions->get($code);

                return is_array($dimension) ? [
                    'code' => $code,
                    'label' => $dimension['label'],
                    'score' => $dimension['value'],
                ] : null;
            })
            ->filter()
            ->values()
            ->all();
        $topCodes = collect(explode('-', (string) ($profile['topCode'] ?? '')))
            ->filter();

        return [
            'assessmentReference' => $profile['sessionReference'] ?? null,
            'recordedProfileCode' => $profile['topCode'] ?? '',
            'programmeInterestAreas' => $programmeAreas,
            'sharedTopAreas' => collect($recordedProgrammeAreas)
                ->filter(fn (array $area): bool => $topCodes->contains($area['code']))
                ->values()
                ->all(),
            'recordedProgrammeAreas' => $recordedProgrammeAreas,
            'learningAreas' => array_values(array_filter(
                $course['learningAreas'] ?? [],
                static fn (mixed $area): bool => is_string($area) && $area !== '',
            )),
        ];
    }

    /**
     * @param  array<int, array{area: string, score: int|null}>  $entries
     * @return array<string, mixed>
     */
    private function profilePayload(AssessmentSession $session, array $entries): array
    {
        $codes = [
            'Realistic' => 'R',
            'Investigative' => 'I',
            'Artistic' => 'A',
            'Social' => 'S',
            'Enterprising' => 'E',
            'Conventional' => 'C',
        ];

        $dimensions = array_values(array_map(
            static fn (array $entry, int $index): array => [
                'code' => $codes[$entry['area']] ?? '',
                'label' => $entry['area'],
                'value' => (int) ($entry['score'] ?? 0),
                'order' => $index,
            ],
            $entries,
            array_keys($entries),
        ));

        $leading = $dimensions;
        usort($leading, static fn (array $left, array $right): int => ($right['value'] <=> $left['value']) ?: ($left['order'] <=> $right['order'])
        );
        $leading = array_slice($leading, 0, 2);

        return [
            'sessionReference' => 'ASMT-'.str_pad((string) $session->getKey(), 6, '0', STR_PAD_LEFT),
            'availableAt' => $session->result_available_at?->toAtomString(),
            'topCode' => implode('-', array_column($leading, 'code')),
            'topLabels' => array_column($leading, 'label'),
            'dimensions' => array_map(static fn (array $dimension): array => [
                'code' => $dimension['code'],
                'label' => $dimension['label'],
                'value' => $dimension['value'],
            ], $dimensions),
        ];
    }

    private function notAvailable(string $reason): JsonResponse
    {
        return response()->json(['data' => [
            'status' => 'not_available',
            'reason' => $reason,
            'recommendation' => null,
        ]]);
    }
}
