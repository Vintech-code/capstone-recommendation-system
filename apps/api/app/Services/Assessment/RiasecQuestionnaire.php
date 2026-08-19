<?php

namespace App\Services\Assessment;

use App\Models\AssessmentInstrument;
use RuntimeException;

final class RiasecQuestionnaire
{
    public const INSTRUMENT_CODE = 'tcc-riasec-42-v1';

    public const LEGACY_INSTRUMENT_CODE = 'onet-mini-ip-30';

    public const QUESTION_COUNT = 42;

    public const RESULT_AREAS = [
        'Realistic',
        'Investigative',
        'Artistic',
        'Social',
        'Enterprising',
        'Conventional',
    ];

    private const AREA_LABELS = [
        'R' => 'Realistic',
        'I' => 'Investigative',
        'A' => 'Artistic',
        'S' => 'Social',
        'E' => 'Enterprising',
        'C' => 'Conventional',
    ];

    /** @return array<string, mixed> */
    public function questions(): array
    {
        $instrument = $this->instrument();

        return [
            'instrument' => [
                'code' => $instrument->code,
                'name' => $instrument->name,
                'question_count' => $instrument->questions->count(),
                'content_version' => $instrument->version,
                'status' => $instrument->status,
                'instructions' => $instrument->instructions,
            ],
            'answer_options' => [
                ['value' => 1, 'name' => 'Agree'],
                ['value' => 2, 'name' => 'Do not agree'],
            ],
            'questions' => $instrument->questions->map(static fn ($question): array => [
                'index' => $question->position,
                'source_number' => $question->source_number,
                'text' => $question->prompt,
            ])->all(),
        ];
    }

    /**
     * Score the researcher-provided checkbox instrument by counting agreed
     * statements in each category. The source category mapping is stored with
     * the versioned questions and is never accepted from the client.
     *
     * @param  array<int, int>  $answers
     * @return array{instrument_code: string, answer_count: int, scoring_source: string, result: array<int, array{area: string, score: int}>}
     */
    public function results(array $answers): array
    {
        if (count($answers) !== self::QUESTION_COUNT
            || collect($answers)->contains(fn (mixed $answer): bool => ! is_int($answer) || ! in_array($answer, [1, 2], true))) {
            throw new RuntimeException('The TCC RIASEC questionnaire requires 42 answers using the provided choices.');
        }

        $scores = array_fill_keys(self::RESULT_AREAS, 0);
        foreach ($this->instrument()->questions as $offset => $question) {
            if ($answers[$offset] === 1) {
                $scores[self::AREA_LABELS[$question->riasec_code]]++;
            }
        }

        return [
            'instrument_code' => self::INSTRUMENT_CODE,
            'answer_count' => count($answers),
            'scoring_source' => 'researcher-questionnaire-v1',
            'result' => collect(self::RESULT_AREAS)
                ->map(fn (string $area): array => ['area' => $area, 'score' => $scores[$area]])
                ->all(),
        ];
    }

    /** @param array<int, mixed> $results
     * @return array<int, array{area: string, score: int|null}>
     */
    public static function normalizeResultEntries(array $results): array
    {
        return collect($results)->map(function (mixed $result): array {
            if (! is_array($result)) {
                return ['area' => '', 'score' => null];
            }
            $score = $result['score'] ?? null;

            return [
                'area' => (string) ($result['area'] ?? $result['title'] ?? ''),
                'score' => is_numeric($score) ? (int) $score : null,
            ];
        })->values()->all();
    }

    private function instrument(): AssessmentInstrument
    {
        $instrument = AssessmentInstrument::query()
            ->where('code', self::INSTRUMENT_CODE)
            ->where('is_active', true)
            ->with('questions')
            ->first();

        if ($instrument === null || $instrument->questions->count() !== self::QUESTION_COUNT) {
            throw new RuntimeException('The active TCC RIASEC questionnaire is not configured correctly.');
        }

        return $instrument;
    }
}
