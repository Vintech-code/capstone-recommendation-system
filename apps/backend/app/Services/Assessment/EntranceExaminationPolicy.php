<?php

namespace App\Services\Assessment;

use App\Models\EntranceExaminationResult;
use App\Models\User;
use DomainException;

final class EntranceExaminationPolicy
{
    public const RULE_REFERENCE = 'SELF-DECLARED-TCC-ENTRANCE-2026-01';

    public const BOARD = 'board';

    public const NON_BOARD = 'non_board';

    public function classify(float $score): string
    {
        if ($score < 1.0 || $score > 5.0 || abs($score - round($score, 1)) > 0.00001) {
            throw new DomainException('The entrance examination result must be from 1.0 to 5.0 with at most one decimal place.');
        }

        return $score <= 2.5 ? self::BOARD : self::NON_BOARD;
    }

    public function currentResult(User $student): ?EntranceExaminationResult
    {
        return EntranceExaminationResult::query()
            ->whereBelongsTo($student)
            ->whereNull('superseded_at')
            ->latest('declared_at')
            ->latest('id')
            ->first();
    }

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'ruleReference' => self::RULE_REFERENCE,
            'minimum' => 1.0,
            'maximum' => 5.0,
            'decimalPlaces' => 1,
            'boardRange' => ['minimum' => 1.0, 'maximum' => 2.5],
            'nonBoardRange' => ['minimum' => 2.6, 'maximum' => 5.0],
            'source' => 'student_self_declared',
        ];
    }
}
