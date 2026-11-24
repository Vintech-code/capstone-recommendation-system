<?php

namespace Tests\Unit;

use App\Services\Assessment\RiasecProfileVariantGenerator;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class RiasecProfileVariantGeneratorTest extends TestCase
{
    #[Test]
    public function it_expands_two_tied_primary_areas_into_the_confirmed_four_variants(): void
    {
        $result = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 6, 'I' => 6, 'A' => 5, 'S' => 4, 'E' => 3, 'C' => 1,
        ]));

        $this->assertSame(['R', 'I', 'A', 'S'], array_column($result['leadingDimensions'], 'code'));
        $this->assertSame(
            ['R-A-S', 'R-S-A', 'I-A-S', 'I-S-A'],
            array_column($result['variants'], 'code'),
        );
    }

    #[Test]
    public function it_expands_five_and_six_leading_codes_without_creating_long_codes(): void
    {
        $five = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 6, 'I' => 6, 'A' => 5, 'S' => 4, 'E' => 4, 'C' => 1,
        ]));
        $six = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 6, 'I' => 6, 'A' => 5, 'S' => 5, 'E' => 4, 'C' => 4,
        ]));

        $this->assertCount(12, $five['variants']);
        $this->assertCount(24, $six['variants']);
        $this->assertSame([3], array_values(array_unique(array_map(
            static fn (array $variant): int => count($variant['codes']),
            [...$five['variants'], ...$six['variants']],
        ))));
    }

    #[Test]
    public function it_generates_all_ordered_three_code_results_when_the_highest_score_has_five_or_six_ties(): void
    {
        $five = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 7, 'I' => 7, 'A' => 6, 'S' => 7, 'E' => 7, 'C' => 7,
        ]));
        $six = (new RiasecProfileVariantGenerator)->generate($this->dimensions([
            'R' => 7, 'I' => 7, 'A' => 7, 'S' => 7, 'E' => 7, 'C' => 7,
        ]));

        $this->assertCount(60, $five['variants']);
        $this->assertCount(120, $six['variants']);
        $this->assertSame('R-I-S', $five['variants'][0]['code']);
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
