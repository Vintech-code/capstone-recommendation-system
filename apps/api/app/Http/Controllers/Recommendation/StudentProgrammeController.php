<?php

namespace App\Http\Controllers\Recommendation;

use App\Http\Controllers\Controller;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Http\JsonResponse;

class StudentProgrammeController extends Controller
{
    public function index(TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $catalogue = $catalogues->current();

        return response()->json([
            'data' => [
                'academicYear' => $catalogue['academic_year'],
                'catalogueVersion' => $catalogue['catalogue_version'],
                'programmes' => array_map([$this, 'programmePayload'], $catalogue['programmes'] ?? []),
            ],
        ]);
    }

    public function show(string $programme, TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $catalogue = $catalogues->current();
        $record = collect($catalogue['programmes'] ?? [])->firstWhere('id', $programme);

        abort_unless(is_array($record), 404, 'Programme not found.');

        return response()->json(['data' => $this->programmePayload($record)]);
    }

    /** @param array<string, mixed> $programme */
    private function programmePayload(array $programme): array
    {
        return [
            'id' => $programme['id'],
            'name' => $programme['display_name'],
            'code' => $programme['short_label'],
            'majors' => $programme['majors'] ?? [],
            'riasecProfile' => $programme['riasec_profile'] ?? [],
            'description' => $programme['description'] ?? '',
            'learningAreas' => $programme['learning_areas'] ?? [],
            'learningAreaDescriptions' => $programme['learning_area_descriptions'] ?? [],
            'learningAreaTopics' => $programme['learning_area_topics'] ?? [],
            'careerDirections' => $programme['career_directions'] ?? [],
            'recommendedStrands' => $programme['recommended_strands'] ?? [],
            'strandGuidance' => $programme['strand_guidance'] ?? '',
            'requirements' => $programme['requirements'] ?? [],
            'readinessPrompt' => $programme['readiness_prompt'] ?? '',
            'contentVersion' => $programme['content_version'] ?? null,
            'degreeType' => $programme['degree_type'] ?? '',
            'duration' => $programme['duration'] ?? null,
            'salary' => $programme['salary'] ?? null,
            'jobGrowth' => $programme['job_growth'] ?? null,
            'outlookVersion' => $programme['outlook_version'] ?? null,
            'coverImageUrl' => $programme['cover_image_url'] ?? null,
            'logoImageUrl' => $programme['logo_image_url'] ?? null,
            'coverImagePosition' => $programme['cover_image_position'] ?? null,
            'logoImagePosition' => $programme['logo_image_position'] ?? null,
        ];
    }
}
