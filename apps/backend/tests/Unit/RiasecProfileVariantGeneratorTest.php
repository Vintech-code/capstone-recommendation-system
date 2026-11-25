<?php

namespace Tests\Unit;

use App\Services\Assessment\RiasecProfileVariantGenerator;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class RiasecProfileVariantGeneratorTest extends TestCase
{
    #[Test]
    public function it_rumbles_two_tied_primary_areas_before_the_next_score_tier(): void
    {
        $result = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 6, 'I' => 6, 'A' => 3, 'S' => 4, 'E' => 5, 'C' => 2,
        ]));

        $this->assertSame(RiasecProfileVariantGenerator::VERSION, $result['version']);
        $this->assertSame(['R', 'I', 'E'], array_column($result['leadingDimensions'], 'code'));
        $this->assertSame(
            ['R-I-E', 'I-R-E'],
            array_column($result['variants'], 'code'),
        );
    }

    #[Test]
    public function it_rumbles_every_code_when_three_or_four_primary_areas_are_tied(): void
    {
        $three = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 6, 'I' => 6, 'A' => 6, 'S' => 4, 'E' => 3, 'C' => 2,
        ]));
        $four = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 6, 'I' => 6, 'A' => 6, 'S' => 6, 'E' => 3, 'C' => 2,
        ]));

        $this->assertSame(
            ['R-I-A', 'R-A-I', 'I-R-A', 'I-A-R', 'A-R-I', 'A-I-R'],
            array_column($three['variants'], 'code'),
        );
        $this->assertCount(24, $four['variants']);
        $this->assertSame([4], array_values(array_unique(array_map(
            static fn (array $variant): int => count($variant['codes']),
            $four['variants'],
        ))));
    }

    #[Test]
    public function it_keeps_the_primary_fixed_and_rumbles_tied_secondary_areas(): void
    {
        $two = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 5, 'I' => 4, 'A' => 4, 'S' => 3, 'E' => 2, 'C' => 1,
        ]));
        $three = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 5, 'I' => 4, 'A' => 4, 'S' => 4, 'E' => 3, 'C' => 2,
        ]));

        $this->assertSame(['R-I-A', 'R-A-I'], array_column($two['variants'], 'code'));
        $this->assertSame(
            ['R-I-A-S', 'R-I-S-A', 'R-A-I-S', 'R-A-S-I', 'R-S-I-A', 'R-S-A-I'],
            array_column($three['variants'], 'code'),
        );
    }

    #[Test]
    public function it_keeps_primary_and_secondary_fixed_and_rumbles_tied_tertiary_areas(): void
    {
        $result = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 5, 'I' => 4, 'A' => 3, 'S' => 3, 'E' => 2, 'C' => 1,
        ]));

        $this->assertSame(['R-I-A', 'R-I-S'], array_column($result['variants'], 'code'));
    }

    #[Test]
    public function it_preserves_every_complete_tied_tier_needed_to_reach_three_codes(): void
    {
        $result = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 6, 'I' => 6, 'A' => 5, 'S' => 5, 'E' => 4, 'C' => 3,
        ]));

        $this->assertSame(['R', 'I', 'A', 'S'], array_column($result['leadingDimensions'], 'code'));
        $this->assertSame(
            ['R-I-A-S', 'R-I-S-A', 'I-R-A-S', 'I-R-S-A'],
            array_column($result['variants'], 'code'),
        );
    }

    #[Test]
    public function it_rumbles_all_six_primary_areas_without_truncating_the_code(): void
    {
        $result = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 6, 'I' => 6, 'A' => 6, 'S' => 6, 'E' => 6, 'C' => 6,
        ]));

        $this->assertCount(720, $result['variants']);
        $this->assertSame('R-I-A-S-E-C', $result['variants'][0]['code']);
        $this->assertSame([6], array_values(array_unique(array_map(
            static fn (array $variant): int => count($variant['codes']),
            $result['variants'],
        ))));
    }

    #[Test]
    public function it_keeps_one_ordered_result_when_there_is_no_primary_tie(): void
    {
        $result = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 2, 'I' => 7, 'A' => 3, 'S' => 4, 'E' => 6, 'C' => 5,
        ]));

        $this->assertSame(['I-E-C'], array_column($result['variants'], 'code'));
    }

    /** @param array<string, int> $scores
     * @return array<int, array{code: string, label: string, value: int}>
     */
    private function dimensions(array $scores): array
    {
        $labels = ['R' => 'Realistic', 'I' => 'Investigative', 'A' => 'Artistic', 'S' => 'Social', 'E' => 'Enterprising', 'C' => 'Conventional'];

        return array_map(
            static fn (string $code, int $value): array => ['code' => $code, 'label' => $labels[$code], 'value' => $value],
            array_keys($scores),
            array_values($scores),
        );
    }
}
