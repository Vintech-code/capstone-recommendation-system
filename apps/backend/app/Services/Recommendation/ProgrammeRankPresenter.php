<?php

namespace App\Services\Recommendation;

final class ProgrammeRankPresenter
{
    /**
     * Present stored programme rank groups as dense positions without changing
     * the immutable recommendation snapshot.
     *
     * @param  array<int, array<string, mixed>>  $courses
     * @return array<int, array<string, mixed>>
     */
    public function dense(array $courses): array
    {
        $previousStoredRank = null;
        $displayRank = 0;

        return array_map(static function (array $course) use (&$previousStoredRank, &$displayRank): array {
            $storedRank = $course['rank'] ?? null;
            if ($previousStoredRank === null || $storedRank !== $previousStoredRank) {
                $displayRank++;
                $previousStoredRank = $storedRank;
            }

            $course['rank'] = $displayRank;

            return $course;
        }, $courses);
    }
}
