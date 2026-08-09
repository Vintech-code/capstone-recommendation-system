<?php

namespace App\Services\Onet;

use RuntimeException;

class OfficialMiniIpInstrument
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $contents = file_get_contents(resource_path('data/onet-mini-ip-30-v1.json'));
        $definition = is_string($contents) ? json_decode($contents, true) : null;

        if (! is_array($definition)) {
            throw new RuntimeException('The bundled O*NET Mini-IP definition could not be loaded.');
        }

        $questions = $definition['questions'] ?? [];
        $answerOptions = $definition['answer_options'] ?? [];

        if (
            ! is_array($questions)
            || ! is_array($answerOptions)
            || count($questions) !== OnetInterestProfilerClient::QUESTION_COUNT
            || array_column($questions, 'index') !== range(1, OnetInterestProfilerClient::QUESTION_COUNT)
            || array_column($answerOptions, 'value') !== range(1, 5)
        ) {
            throw new RuntimeException('The bundled O*NET Mini-IP definition is invalid.');
        }

        return $definition;
    }

    /**
     * @return array<string, mixed>
     */
    public function questionsPayload(): array
    {
        $definition = $this->definition();

        return [
            'instrument' => [
                'code' => OnetInterestProfilerClient::INSTRUMENT_CODE,
                'name' => 'O*NET Interest Profiler Mini-IP',
                'question_count' => OnetInterestProfilerClient::QUESTION_COUNT,
                'api_version' => '2.0',
                'content_version' => $definition['version'],
            ],
            'answer_options' => $definition['answer_options'],
            'questions' => array_map(static fn (array $question): array => [
                'index' => $question['index'],
                'text' => $question['text'],
            ], $definition['questions']),
            'attribution' => OnetInterestProfilerClient::attribution(),
        ];
    }

    /**
     * Score the computerized Mini-IP using the published 0-4 scale. The API
     * exposes answers as 1-5, so one is subtracted before each area is summed.
     *
     * @param  array<int, int>  $answers
     * @return array<int, array{area: string, score: int}>
     */
    public function score(array $answers): array
    {
        if (
            count($answers) !== OnetInterestProfilerClient::QUESTION_COUNT
            || collect($answers)->contains(fn (mixed $answer): bool => ! is_int($answer) || $answer < 1 || $answer > 5)
        ) {
            throw new RuntimeException('The O*NET Mini-IP requires 30 answers with values from 1 to 5.');
        }

        $scores = array_fill_keys(OnetInterestProfilerClient::RESULT_AREAS, 0);

        foreach ($this->definition()['questions'] as $offset => $question) {
            $scores[$question['area']] += $answers[$offset] - 1;
        }

        return collect(OnetInterestProfilerClient::RESULT_AREAS)
            ->map(fn (string $area): array => ['area' => $area, 'score' => $scores[$area]])
            ->all();
    }
}
