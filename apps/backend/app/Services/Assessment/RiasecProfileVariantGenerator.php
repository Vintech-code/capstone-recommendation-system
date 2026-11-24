<?php

namespace App\Services\Assessment;

final class RiasecProfileVariantGenerator
{
    public const VERSION = 'PROPOSED-RIASEC-PROFILE-VARIANTS-2026-11-24';

    /**
     * @param  array<int, array{code: string, label: string, value: int, order?: int}>  $dimensions
     * @return array{version: string, leadingDimensions: array<int, array<string, mixed>>, variants: array<int, array{code: string, compactCode: string, codes: array<int, string>, labels: array<int, string>}>}
     */
    public function generate(array $dimensions): array
    {
        $normalized = $this->normalize($dimensions);
        if (count($normalized) < 3) {
            return ['version' => self::VERSION, 'leadingDimensions' => $normalized, 'variants' => []];
        }

        $highestValue = $normalized[0]['value'];
        $primary = array_values(array_filter(
            $normalized,
            static fn (array $dimension): bool => $dimension['value'] === $highestValue,
        ));

        if (count($primary) >= 3) {
            $leading = $primary;
            $codeSets = $this->orderedTriples($primary);
        } elseif (count($primary) === 2) {
            $scoreLevels = array_slice(array_values(array_unique(array_column($normalized, 'value'))), 0, 3);
            $leading = array_values(array_filter(
                $normalized,
                static fn (array $dimension): bool => in_array($dimension['value'], $scoreLevels, true),
            ));
            $supporting = array_values(array_filter(
                $leading,
                static fn (array $dimension): bool => $dimension['value'] !== $highestValue,
            ));
            $codeSets = [];
            foreach ($primary as $primaryDimension) {
                for ($left = 0; $left < count($supporting) - 1; $left++) {
                    for ($right = $left + 1; $right < count($supporting); $right++) {
                        $codeSets[] = [$primaryDimension, $supporting[$left], $supporting[$right]];
                        $codeSets[] = [$primaryDimension, $supporting[$right], $supporting[$left]];
                    }
                }
            }
        } else {
            $leading = array_slice($normalized, 0, 3);
            $codeSets = [$leading];
        }

        return [
            'version' => self::VERSION,
            'leadingDimensions' => $leading,
            'variants' => array_map(static function (array $variant): array {
                $codes = array_column($variant, 'code');

                return [
                    'code' => implode('-', $codes),
                    'compactCode' => implode('', $codes),
                    'codes' => $codes,
                    'labels' => array_column($variant, 'label'),
                ];
            }, $codeSets),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $dimensions
     * @return array<int, array{code: string, label: string, value: int, order: int}>
     */
    private function normalize(array $dimensions): array
    {
        $validCodes = ['R', 'I', 'A', 'S', 'E', 'C'];
        $seen = [];
        $normalized = [];
        foreach ($dimensions as $index => $dimension) {
            $code = strtoupper(trim((string) ($dimension['code'] ?? '')));
            if (! in_array($code, $validCodes, true) || isset($seen[$code])) {
                continue;
            }
            $seen[$code] = true;
            $normalized[] = [
                'code' => $code,
                'label' => (string) ($dimension['label'] ?? $code),
                'value' => (int) ($dimension['value'] ?? 0),
                'order' => (int) ($dimension['order'] ?? $index),
            ];
        }

        usort(
            $normalized,
            static fn (array $left, array $right): int => ($right['value'] <=> $left['value'])
                ?: ($left['order'] <=> $right['order']),
        );

        return $normalized;
    }

    /**
     * @param  array<int, array<string, mixed>>  $dimensions
     * @return array<int, array<int, array<string, mixed>>>
     */
    private function orderedTriples(array $dimensions): array
    {
        $variants = [];
        foreach ($dimensions as $firstIndex => $first) {
            foreach ($dimensions as $secondIndex => $second) {
                if ($secondIndex === $firstIndex) {
                    continue;
                }
                foreach ($dimensions as $thirdIndex => $third) {
                    if ($thirdIndex === $firstIndex || $thirdIndex === $secondIndex) {
                        continue;
                    }
                    $variants[] = [$first, $second, $third];
                }
            }
        }

        return $variants;
    }
}
