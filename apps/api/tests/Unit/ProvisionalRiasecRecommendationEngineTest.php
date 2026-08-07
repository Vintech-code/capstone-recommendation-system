<?php

namespace Tests\Unit;

use App\Services\Recommendation\ProvisionalRiasecRecommendationEngine;
use DomainException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ProvisionalRiasecRecommendationEngineTest extends TestCase
{
    #[Test]
    public function it_normalizes_scores_matches_profiles_and_applies_deterministic_ties(): void
    {
        $result = (new ProvisionalRiasecRecommendationEngine)->recommend(
            $this->scores(),
            $this->catalogue(),
        );

        $this->assertSame(0.0, $result['normalized_scores']['R']);
        $this->assertSame(100.0, $result['normalized_scores']['I']);
        $this->assertSame(50.0, $result['normalized_scores']['A']);
        $this->assertSame(['alpha', 'zulu', 'social'], array_column($result['ranked'], 'id'));
        $this->assertSame([75.0, 75.0, 25.0], array_column($result['ranked'], 'match'));
        $this->assertSame([1, 2, 3], array_column($result['ranked'], 'rank'));
        $this->assertSame('missing', $result['exclusions'][0]['programme_id']);
        $this->assertSame('PROFILE_UNAVAILABLE', $result['exclusions'][0]['reason']);
    }

    #[Test]
    public function it_rejects_scores_outside_the_configured_instrument_range(): void
    {
        $scores = $this->scores();
        $scores[0]['score'] = 4;

        $this->expectException(DomainException::class);
        (new ProvisionalRiasecRecommendationEngine)->recommend($scores, $this->catalogue());
    }

    /** @return array<int, array{area: string, score: int}> */
    private function scores(): array
    {
        return [
            ['area' => 'Realistic', 'score' => 5],
            ['area' => 'Investigative', 'score' => 25],
            ['area' => 'Artistic', 'score' => 15],
            ['area' => 'Social', 'score' => 10],
            ['area' => 'Enterprising', 'score' => 20],
            ['area' => 'Conventional', 'score' => 15],
        ];
    }

    /** @return array<string, mixed> */
    private function catalogue(): array
    {
        return [
            'matching_policy' => [
                'method' => 'unweighted_riasec_profile_matching',
                'formula' => ['name' => 'equal_membership_profile_mean'],
                'normalization' => ['instrument_min' => 5, 'instrument_max' => 25],
            ],
            'programmes' => [
                ['id' => 'zulu', 'short_label' => 'Z', 'display_name' => 'Zulu Programme', 'riasec_profile' => ['I', 'A']],
                ['id' => 'alpha', 'short_label' => 'A', 'display_name' => 'Alpha Programme', 'riasec_profile' => ['I', 'C']],
                ['id' => 'social', 'short_label' => 'S', 'display_name' => 'Social Programme', 'riasec_profile' => ['S']],
                ['id' => 'missing', 'short_label' => 'M', 'display_name' => 'Missing Profile', 'riasec_profile' => []],
            ],
        ];
    }
}
