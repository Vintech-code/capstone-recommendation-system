<?php

namespace App\Services\Recommendation;

class TccProgrammeCatalogueRepository
{
    public function __construct(private ProposedGuidanceContentRepository $guidance) {}

    /** @return array<string, mixed> */
    public function current(): array
    {
        $catalogue = json_decode(
            file_get_contents(resource_path('data/tcc-programme-catalogue-v1.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );
        $content = $this->guidance->current();
        $programmeContent = $content['programmes'] ?? [];
        $commonRequirements = $content['common_requirements'] ?? [];

        $catalogue['programmes'] = array_map(static function (array $programme) use ($programmeContent, $commonRequirements, $content): array {
            $details = $programmeContent[$programme['id']] ?? [];

            return array_merge($programme, $details, [
                'requirements' => $commonRequirements,
                'content_status' => $content['policy_status'] ?? 'proposed',
                'content_version' => $content['policy_version'] ?? 'unknown',
            ]);
        }, $catalogue['programmes'] ?? []);

        return $catalogue;
    }
}
