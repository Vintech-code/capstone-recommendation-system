<?php

namespace App\Services\Recommendation;

use App\Models\ConfigurationVersion;
use Illuminate\Support\Facades\Schema;

class TccProgrammeCatalogueRepository
{
    public function __construct(
        private ProposedGuidanceContentRepository $guidance,
        private PhilippineProgrammeOutlookRepository $outlook,
    ) {}

    /** @return array<string, mixed> */
    public function current(): array
    {
        $catalogue = json_decode(
            file_get_contents(resource_path('data/tcc-programme-catalogue-v1.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );
        $publishedCatalogue = Schema::hasTable('configuration_versions') ? ConfigurationVersion::query()
            ->where('kind', 'catalogue')
            ->where('status', 'published')
            ->latest('version')
            ->value('payload') : null;
        if (is_array($publishedCatalogue)) {
            $catalogue = $publishedCatalogue;
        }
        $publishedMethodology = Schema::hasTable('configuration_versions') ? ConfigurationVersion::query()
            ->where('kind', 'methodology')
            ->where('status', 'published')
            ->latest('version')
            ->value('payload') : null;
        if (is_array($publishedMethodology)) {
            $catalogue['matching_policy'] = $publishedMethodology;
        }
        $content = $this->guidance->current();
        $outlook = $this->outlook->current();
        $programmeContent = $content['programmes'] ?? [];
        $programmeOutlook = $outlook['programmes'] ?? [];
        $commonRequirements = $content['common_requirements'] ?? [];

        $catalogue['programmes'] = array_map(static function (array $programme) use ($programmeContent, $programmeOutlook, $commonRequirements, $content, $outlook): array {
            $details = $programmeContent[$programme['id']] ?? [];
            $market = $programmeOutlook[$programme['id']] ?? [];

            $editable = array_intersect_key($programme, array_flip([
                'display_name', 'short_label', 'majors', 'riasec_profile', 'description',
                'learning_areas', 'learning_area_descriptions', 'learning_area_topics',
                'career_directions', 'career_opportunities', 'recommended_strands', 'strand_guidance',
                'requirements', 'readiness_prompt', 'cover_image_url', 'logo_image_url',
                'cover_image_position', 'logo_image_position',
            ]));

            $merged = array_merge($programme, $details, $editable, [
                'requirements' => $commonRequirements,
                'content_status' => $content['policy_status'] ?? 'proposed',
                'content_version' => $content['policy_version'] ?? 'unknown',
                'degree_type' => $market['degree_type'] ?? $outlook['defaults']['degree_type'] ?? '',
                'duration' => $market['duration'] ?? null,
                'salary' => $market['salary'] ?? $outlook['defaults']['salary'] ?? null,
                'job_growth' => $market['job_growth'] ?? $outlook['defaults']['job_growth'] ?? null,
                'outlook_version' => $outlook['policy_version'] ?? 'unknown',
            ]);

            foreach (['cover_image_url', 'logo_image_url'] as $field) {
                if (is_string($merged[$field] ?? null) && preg_match('#^https?://localhost(?::\d+)?(/storage/.+)$#', $merged[$field], $matches)) {
                    $merged[$field] = $matches[1];
                }
            }

            return $merged;
        }, $catalogue['programmes'] ?? []);

        return $catalogue;
    }
}
