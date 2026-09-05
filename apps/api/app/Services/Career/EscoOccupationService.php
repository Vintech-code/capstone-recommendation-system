<?php

namespace App\Services\Career;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class EscoOccupationService
{
    public const OCCUPATION_URI_PREFIX = 'http://data.europa.eu/esco/occupation/';

    /** @return array<int, array<string, mixed>> */
    public function search(string $query): array
    {
        $language = (string) config('services.esco.language', 'en');
        $version = (string) config('services.esco.version', 'v1.2.0');
        $cacheKey = 'esco:occupation-search:'.sha1($version.'|'.$language.'|'.mb_strtolower($query));

        return Cache::remember($cacheKey, now()->addHour(), function () use ($query, $language, $version): array {
            try {
                $response = Http::acceptJson()
                    ->timeout((int) config('services.esco.timeout', 12))
                    ->retry(2, 200)
                    ->get($this->baseUrl().'/search', [
                        'text' => $query,
                        'type' => 'occupation',
                        'language' => $language,
                        'limit' => 8,
                        'offset' => 0,
                        'selectedVersion' => $version,
                    ])
                    ->throw();
            } catch (ConnectionException $exception) {
                throw new RuntimeException('ESCO could not be reached. Try the search again.', previous: $exception);
            } catch (\Throwable $exception) {
                throw new RuntimeException('ESCO did not return a usable occupation search response.', previous: $exception);
            }

            return collect($response->json('_embedded.results', []))
                ->filter(fn (mixed $result): bool => is_array($result) && $this->validOccupationUri($result['uri'] ?? null))
                ->map(fn (array $result): array => [
                    'uri' => $result['uri'],
                    'title' => (string) ($result['title'] ?? $result['searchHit'] ?? ''),
                    'escoCode' => isset($result['code']) ? (string) $result['code'] : null,
                    'iscoCode' => $this->iscoCode($result),
                ])
                ->filter(fn (array $result): bool => $result['title'] !== '')
                ->values()
                ->all();
        });
    }

    /** @return array<string, mixed> */
    public function occupation(string $uri): array
    {
        if (! $this->validOccupationUri($uri)) {
            throw new RuntimeException('The selected ESCO occupation reference is invalid.');
        }

        $language = (string) config('services.esco.language', 'en');
        $version = (string) config('services.esco.version', 'v1.2.0');

        return Cache::remember('esco:occupation:'.sha1($version.'|'.$language.'|'.$uri), now()->addDay(), function () use ($uri, $language, $version): array {
            try {
                $response = Http::acceptJson()
                    ->timeout((int) config('services.esco.timeout', 12))
                    ->retry(2, 200)
                    ->get($this->baseUrl().'/resource/occupation', [
                        'uri' => $uri,
                        'language' => $language,
                        'selectedVersion' => $version,
                    ])
                    ->throw();
            } catch (ConnectionException $exception) {
                throw new RuntimeException('ESCO could not be reached. Try selecting the occupation again.', previous: $exception);
            } catch (\Throwable $exception) {
                throw new RuntimeException('ESCO did not return usable occupation details.', previous: $exception);
            }

            $payload = $response->json();
            if (! is_array($payload) || ! $this->validOccupationUri($payload['uri'] ?? null)) {
                throw new RuntimeException('ESCO did not return usable occupation details.');
            }

            return [
                'label' => (string) ($payload['title'] ?? ''),
                'description' => (string) data_get($payload, "description.{$language}.literal", ''),
                'escoUri' => (string) $payload['uri'],
                'escoCode' => isset($payload['code']) ? (string) $payload['code'] : null,
                'iscoCode' => $this->iscoCode($payload),
                'skills' => collect(data_get($payload, '_links.hasEssentialSkill', []))
                    ->pluck('title')->filter()->unique()->take(6)->values()->all(),
                'source' => 'esco',
                'sourceLanguage' => $language,
                'sourceVersion' => $version,
                'retrievedAt' => now()->toAtomString(),
                'reviewStatus' => 'proposed',
            ];
        });
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('services.esco.base_url'), '/');
    }

    private function validOccupationUri(mixed $uri): bool
    {
        return is_string($uri) && str_starts_with($uri, self::OCCUPATION_URI_PREFIX);
    }

    /** @param array<string, mixed> $payload */
    private function iscoCode(array $payload): ?string
    {
        $linkedCode = data_get($payload, '_links.broaderIscoGroup.0.code');
        if (is_scalar($linkedCode)) {
            return (string) $linkedCode;
        }

        $group = collect($payload['broaderIscoGroup'] ?? [])->first();
        if (is_string($group) && preg_match('#/C([0-9]+)$#', $group, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
