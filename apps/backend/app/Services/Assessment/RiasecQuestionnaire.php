<?php

namespace App\Services\Assessment;

use App\Models\AssessmentInstrument;
use RuntimeException;

final class RiasecQuestionnaire
{
    public const INSTRUMENT_CODE = 'tcc-uhcc-riasec-42-v1';

    public const QUESTION_COUNT = 42;

    public const MAXIMUM_AREA_SCORE = 7;

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
                'source' => [
                    'name' => $instrument->source_name,
                    'asset_reference' => $instrument->source_asset,
                    'url' => $instrument->source_url,
                    'accessed_on' => $instrument->source_accessed_on?->toDateString(),
                ],
                'scoring' => $instrument->scoring_config,
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
     * Score the source-adapted checkbox instrument by counting agreed
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
            'scoring_source' => 'riasec-assessment-asset-v1',
            'scoring' => [
                'method' => 'binary-category-count',
                'minimum_per_area' => 0,
                'maximum_per_area' => self::MAXIMUM_AREA_SCORE,
                'formula' => 'area_score = count(mapped answers equal to Agree)',
            ],
            'result' => collect(self::RESULT_AREAS)
                ->map(fn (string $area): array => ['area' => $area, 'score' => $scores[$area]])
                ->all(),
        ];
    }

    /** @return array<int, string> */
    public static function supportedInstrumentCodes(): array
    {
        return [self::INSTRUMENT_CODE];
    }

    /** @return array{instrument_min: int, instrument_max: int} */
    public static function normalizationFor(string $instrumentCode): array
    {
        if ($instrumentCode !== self::INSTRUMENT_CODE) {
            throw new RuntimeException('The assessment instrument scoring range is unavailable.');
        }

        return ['instrument_min' => 0, 'instrument_max' => self::MAXIMUM_AREA_SCORE];
    }

    public static function questionCountFor(string $instrumentCode): int
    {
        if ($instrumentCode !== self::INSTRUMENT_CODE) {
            throw new RuntimeException('The assessment instrument question count is unavailable.');
        }

        return self::QUESTION_COUNT;
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
