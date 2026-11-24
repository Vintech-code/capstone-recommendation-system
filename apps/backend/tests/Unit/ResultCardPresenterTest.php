<?php

namespace Tests\Unit;

use App\Services\Assessment\ResultCardPresenter;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ResultCardPresenterTest extends TestCase
{
    #[Test]
    public function it_assigns_shared_competition_ranks_to_equal_riasec_scores(): void
    {
        $presenter = new ResultCardPresenter;
        $ranked = $presenter->rankDimensions([
            ['code' => 'R', 'label' => 'Realistic', 'value' => 6],
            ['code' => 'I', 'label' => 'Investigative', 'value' => 6],
            ['code' => 'A', 'label' => 'Artistic', 'value' => 5],
            ['code' => 'S', 'label' => 'Social', 'value' => 4],
        ]);

        $this->assertSame([1, 1, 3, 4], array_column($ranked, 'rank'));
        $this->assertSame([true, true, false, false], array_column($ranked, 'isTied'));
        $this->assertSame(
            ['code' => 'RAS', 'formatted' => 'R-A-S'],
            $presenter->topCode($ranked),
        );
    }
}
