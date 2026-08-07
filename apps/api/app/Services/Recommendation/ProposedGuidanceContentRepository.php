<?php

namespace App\Services\Recommendation;

final class ProposedGuidanceContentRepository
{
    /** @return array<string, mixed> */
    public function current(): array
    {
        return json_decode(
            file_get_contents(resource_path('data/proposed-guidance-content-v1.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );
    }
}
