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
        $bundledCatalogue = json_decode(
            file_get_contents(resource_path('data/tcc-programme-catalogue-v1.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );
        $catalogue = $bundledCatalogue;
        $publishedCatalogue = Schema::hasTable('configuration_versions') ? ConfigurationVersion::query()
            ->where('kind', 'catalogue')
            ->where('status', 'published')
            ->latest('version')
            ->value('payload') : null;
        if (is_array($publishedCatalogue)) {
            $catalogue = $this->applyPublishedEnrichment($bundledCatalogue, $publishedCatalogue);
        }
        $content = $this->guidance->current();
        $outlook = $this->outlook->current();
        $programmeContent = $content['programmes'] ?? [];
        $programmeOutlook = $outlook['programmes'] ?? [];
        $commonRequirements = $content['common_requirements'] ?? [];
        $catalogue['guidance_content_status'] = $content['policy_status'] ?? 'proposed';
        $catalogue['guidance_content_version'] = $content['policy_version'] ?? 'unknown';
        $catalogue['guidance_content_notice'] = $content['student_notice'] ?? null;

        $catalogue['programmes'] = array_map(static function (array $programme) use ($programmeContent, $programmeOutlook, $commonRequirements, $content, $outlook): array {
            $details = $programmeContent[$programme['id']] ?? [];
            $market = $programmeOutlook[$programme['id']] ?? [];

            $editable = array_intersect_key($programme, array_flip([
                'career_opportunities', 'recommended_strands', 'strand_guidance',
                'cover_image_url', 'logo_image_url',
                'cover_image_position', 'logo_image_position',
            ]));

            $merged = array_merge($programme, $details, $editable, [
                'requirements' => $commonRequirements,
                'content_status' => $details['content_status'] ?? $content['policy_status'] ?? 'proposed',
                'content_source' => $details['content_source'] ?? null,
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

    /** @param array<string, mixed> $bundled @param array<string, mixed> $published @return array<string, mixed> */
    private function applyPublishedEnrichment(array $bundled, array $published): array
    {
        $publishedProgrammes = collect($published['programmes'] ?? [])->keyBy('id');
        $editableFields = array_flip([
            'career_opportunities',
            'recommended_strands',
            'strand_guidance',
            'cover_image_url',
            'logo_image_url',
            'cover_image_position',
            'logo_image_position',
        ]);

        $bundled['programmes'] = array_map(static function (array $programme) use ($publishedProgrammes, $editableFields): array {
            $publishedProgramme = $publishedProgrammes->get($programme['id']);
            if (! is_array($publishedProgramme)) {
                return $programme;
            }

            return array_merge($programme, array_intersect_key($publishedProgramme, $editableFields));
        }, $bundled['programmes'] ?? []);

        return $bundled;
    }
}
