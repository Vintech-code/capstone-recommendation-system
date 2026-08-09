<?php

namespace App\Services\Recommendation;

use DomainException;

final class ProvisionalRiasecRecommendationEngine
{
    private const AREA_CODES = [
        'realistic' => 'R',
        'investigative' => 'I',
        'artistic' => 'A',
        'social' => 'S',
        'enterprising' => 'E',
        'conventional' => 'C',
    ];

    /**
     * @param  array<int, array<string, mixed>>  $resultEntries
     * @param  array<string, mixed>  $catalogue
     * @return array{method: string, normalized_scores: array<string, float>, ranked: array<int, array<string, mixed>>, exclusions: array<int, array<string, string>>}
     */
    public function recommend(array $resultEntries, array $catalogue): array
    {
        $policy = $catalogue['matching_policy'] ?? null;
        if (! is_array($policy) || ($policy['method'] ?? null) !== 'unweighted_riasec_profile_matching') {
            throw new DomainException('The configured recommendation method is unavailable.');
        }

        $normalization = $policy['normalization'] ?? null;
        $minimum = is_array($normalization) ? $normalization['instrument_min'] ?? null : null;
        $maximum = is_array($normalization) ? $normalization['instrument_max'] ?? null : null;
        if (! is_numeric($minimum) || ! is_numeric($maximum) || (float) $maximum <= (float) $minimum) {
            throw new DomainException('The configured instrument range is invalid.');
        }

        $scores = $this->scoreVector($resultEntries);
        $normalized = [];
        foreach (self::AREA_CODES as $code) {
            $score = $scores[$code] ?? null;
            if (! is_numeric($score) || ! is_finite((float) $score) || (float) $score < (float) $minimum || (float) $score > (float) $maximum) {
                throw new DomainException("The {$code} score is outside the configured instrument range.");
            }

            $normalized[$code] = 100 * ((float) $score - (float) $minimum) / ((float) $maximum - (float) $minimum);
        }

        $ranked = [];
        $exclusions = [];
        foreach ($catalogue['programmes'] ?? [] as $programme) {
            if (! is_array($programme)) {
                continue;
            }

            $profile = array_values(array_unique(array_map(
                static fn (mixed $code): string => strtoupper(trim((string) $code)),
                is_array($programme['riasec_profile'] ?? null) ? $programme['riasec_profile'] : [],
            )));
            $validProfile = count($profile) >= 1
                && count($profile) <= 3
                && count(array_diff($profile, array_values(self::AREA_CODES))) === 0;

            if (! $validProfile) {
                $exclusions[] = [
                    'programme_id' => (string) ($programme['id'] ?? ''),
                    'reason' => 'PROFILE_UNAVAILABLE',
                ];

                continue;
            }

            $match = array_sum(array_map(
                static fn (string $code): float => $normalized[$code],
                $profile,
            )) / count($profile);

            $ranked[] = [
                'id' => (string) ($programme['id'] ?? ''),
                'code' => (string) ($programme['short_label'] ?? ''),
                'name' => (string) ($programme['display_name'] ?? ''),
                'profile' => $profile,
                'description' => (string) ($programme['description'] ?? ''),
                'learning_areas' => array_values($programme['learning_areas'] ?? []),
                'learning_area_descriptions' => $programme['learning_area_descriptions'] ?? [],
                'career_directions' => array_values($programme['career_directions'] ?? []),
                'requirements' => array_values($programme['requirements'] ?? []),
                'readiness_prompt' => (string) ($programme['readiness_prompt'] ?? ''),
                'content_status' => (string) ($programme['content_status'] ?? 'proposed'),
                'content_version' => (string) ($programme['content_version'] ?? ''),
                'degree_type' => (string) ($programme['degree_type'] ?? ''),
                'duration' => $programme['duration'] ?? null,
                'salary' => $programme['salary'] ?? null,
                'job_growth' => $programme['job_growth'] ?? null,
                'outlook_version' => $programme['outlook_version'] ?? null,
                'cover_image_url' => $programme['cover_image_url'] ?? null,
                'logo_image_url' => $programme['logo_image_url'] ?? null,
                'raw_match' => $match,
                'match' => round($match, 2),
            ];
        }

        usort($ranked, static function (array $left, array $right): int {
            $scoreComparison = $right['raw_match'] <=> $left['raw_match'];
            if ($scoreComparison !== 0) {
                return $scoreComparison;
            }

            $nameComparison = strcasecmp($left['name'], $right['name']);

            return $nameComparison !== 0 ? $nameComparison : strcmp($left['id'], $right['id']);
        });

        foreach ($ranked as $index => &$programme) {
            $programme['rank'] = $index + 1;
        }
        unset($programme);

        return [
            'method' => (string) ($policy['formula']['name'] ?? 'equal_membership_profile_mean'),
            'normalized_scores' => $normalized,
            'ranked' => $ranked,
            'exclusions' => $exclusions,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $entries
     * @return array<string, float>
     */
    private function scoreVector(array $entries): array
    {
        $scores = [];
        foreach ($entries as $entry) {
            $area = strtolower(trim((string) ($entry['area'] ?? $entry['title'] ?? '')));
            $code = self::AREA_CODES[$area] ?? null;
            if ($code === null || array_key_exists($code, $scores)) {
                throw new DomainException('The assessment result does not contain six unique RIASEC areas.');
            }

            $scores[$code] = (float) ($entry['score'] ?? NAN);
        }

        if (count($scores) !== count(self::AREA_CODES)) {
            throw new DomainException('The assessment result does not contain all six RIASEC areas.');
        }

        return $scores;
    }
}
