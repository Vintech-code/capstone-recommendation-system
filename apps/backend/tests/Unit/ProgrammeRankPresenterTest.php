<?php

namespace Tests\Unit;

use App\Services\Recommendation\ProgrammeRankPresenter;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ProgrammeRankPresenterTest extends TestCase
{
    #[Test]
    public function it_presents_legacy_competition_rank_groups_as_dense_positions(): void
    {
        $courses = [
            ['id' => 'first', 'rank' => 1],
            ['id' => 'second', 'rank' => 2],
            ['id' => 'third-a', 'rank' => 3],
            ['id' => 'third-b', 'rank' => 3],
            ['id' => 'fourth', 'rank' => 5],
        ];

        $presented = (new ProgrammeRankPresenter)->dense($courses);

        $this->assertSame([1, 2, 3, 3, 4], array_column($presented, 'rank'));
        $this->assertSame([1, 2, 3, 3, 5], array_column($courses, 'rank'));
    }
}
