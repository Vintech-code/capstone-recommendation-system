<?php

namespace App\Services\Onet;

use App\Exceptions\OnetServiceException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OnetInterestProfilerClient
{
    public const INSTRUMENT_CODE = 'onet-mini-ip-30';

    public const QUESTION_COUNT = 30;

    private const RESULT_AREAS = [
        'Realistic',
        'Investigative',
        'Artistic',
        'Social',
        'Enterprising',
        'Conventional',
    ];

    /**
     * @return array{
     *     instrument: array{code: string, name: string, question_count: int, api_version: string},
     *     answer_options: array<int, array{value: int, name: string}>,
     *     questions: array<int, array{index: int, text: string}>,
     *     attribution: array{text: string, url: string}
     * }
     */
    public function questions(): array
    {
        return Cache::remember(
            'onet:interest-profiler:questions:v2:'.self::QUESTION_COUNT,
            max(0, (int) config('services.onet.question_cache_seconds', 3600)),
            function (): array {
                $payload = $this->get('/mnm/interestprofiler/questions_30', [
                    'start' => 1,
                    'end' => self::QUESTION_COUNT,
                ]);

                $questions = collect($payload['question'] ?? [])->map(fn (mixed $question): array => [
                    'index' => (int) ($question['index'] ?? 0),
                    'text' => (string) ($question['text'] ?? ''),
                ])->values()->all();

                $answerOptions = collect($payload['answer_option'] ?? [])->map(fn (mixed $option): array => [
                    'value' => (int) ($option['value'] ?? 0),
                    'name' => (string) ($option['name'] ?? ''),
                ])->values()->all();

                $this->assertQuestionPayload($payload, $questions, $answerOptions);

                return [
                    'instrument' => [
                        'code' => self::INSTRUMENT_CODE,
                        'name' => 'O*NET Interest Profiler Mini-IP',
                        'question_count' => self::QUESTION_COUNT,
                        'api_version' => '2.0',
                    ],
                    'answer_options' => $answerOptions,
                    'questions' => $questions,
                    'attribution' => [
                        'text' => 'This application incorporates information from O*NET Web Services by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). O*NET is a trademark of USDOL/ETA.',
                        'url' => 'https://services.onetcenter.org/',
                    ],
                ];
            },
        );
    }

    /**
     * @param  array<int, int>  $answers
     * @return array{instrument_code: string, answer_count: int, result: array<int, mixed>}
     */
    public function results(array $answers): array
    {
        $payload = $this->get('/mnm/interestprofiler/results', [
            'answers' => implode('', $answers),
        ]);

        $results = self::normalizeResultEntries(
            array_values($payload['result'] ?? []),
        );

        if (
            count($results) !== 6
            || array_column($results, 'area') !== self::RESULT_AREAS
            || in_array(null, array_column($results, 'score'), true)
        ) {
            throw $this->invalidResponse();
        }

        return [
            'instrument_code' => self::INSTRUMENT_CODE,
            'answer_count' => count($answers),
            'result' => $results,
        ];
    }

    /**
     * Convert both the live O*NET `title` shape and the stable internal
     * `area` shape into the minimal result contract used by the application.
     *
     * @param  array<int, mixed>  $results
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

    /**
     * @param  array<string, int|string>  $query
     * @return array<string, mixed>
     */
    private function get(string $path, array $query): array
    {
        try {
            $response = $this->request()->get($path, $query);

            if ($response->status() === 429) {
                Log::notice('O*NET request was rate limited.', [
                    'operation' => $path,
                    'status' => 429,
                    'error_code' => 'ONET_RATE_LIMITED',
                ]);
                throw new OnetServiceException(
                    'The assessment provider is temporarily busy. Please try again shortly.',
                    'ONET_RATE_LIMITED',
                    503,
                    60,
                );
            }

            $response->throw();
            $payload = $response->json();

            if (! is_array($payload)) {
                throw $this->invalidResponse();
            }

            return $payload;
        } catch (ConnectionException|RequestException $exception) {
            Log::warning('O*NET request failed.', [
                'operation' => $path,
                'provider_status' => $exception instanceof RequestException
                    ? $exception->response->status()
                    : null,
                'exception_type' => $exception::class,
                'error_code' => 'ONET_SERVICE_UNAVAILABLE',
            ]);

            throw new OnetServiceException(
                'The assessment provider is temporarily unavailable. Please try again later.',
                'ONET_SERVICE_UNAVAILABLE',
                503,
                30,
            );
        }
    }

    private function request(): PendingRequest
    {
        $apiKey = config('services.onet.api_key');

        if (! is_string($apiKey) || trim($apiKey) === '') {
            throw new OnetServiceException(
                'The assessment provider has not been configured.',
                'ONET_NOT_CONFIGURED',
                503,
            );
        }

        return Http::baseUrl((string) config('services.onet.base_url'))
            ->acceptJson()
            ->withHeaders(['X-API-Key' => $apiKey])
            ->timeout((int) config('services.onet.timeout_seconds'))
            ->retry(2, 200, throw: false);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<int, array{index: int, text: string}>  $questions
     * @param  array<int, array{value: int, name: string}>  $answerOptions
     */
    private function assertQuestionPayload(array $payload, array $questions, array $answerOptions): void
    {
        $indexes = array_column($questions, 'index');
        $values = array_column($answerOptions, 'value');

        if (
            (int) ($payload['total'] ?? 0) !== self::QUESTION_COUNT
            || count($questions) !== self::QUESTION_COUNT
            || $indexes !== range(1, self::QUESTION_COUNT)
            || in_array('', array_column($questions, 'text'), true)
            || $values !== range(1, 5)
            || in_array('', array_column($answerOptions, 'name'), true)
        ) {
            throw $this->invalidResponse();
        }
    }

    private function invalidResponse(): OnetServiceException
    {
        return new OnetServiceException(
            'The assessment provider returned an unexpected response.',
            'ONET_INVALID_RESPONSE',
            502,
        );
    }
}
