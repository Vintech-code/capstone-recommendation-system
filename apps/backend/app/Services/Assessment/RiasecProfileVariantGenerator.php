<?php

namespace App\Services\Assessment;

final class RiasecProfileVariantGenerator
{
    public const VERSION = 'PROPOSED-RIASEC-TIED-TIERS-2026-11-26';

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

        $tiers = [];
        foreach ($normalized as $dimension) {
            $tiers[$dimension['value']][] = $dimension;
        }

        $scoreTiers = array_values($tiers);
        $leadingTiers = [$scoreTiers[0]];
        if (count($scoreTiers[0]) < 3) {
            $leadingTiers[] = $scoreTiers[1];
        }

        $leadingCount = array_sum(array_map('count', $leadingTiers));
        $tertiaryAlternatives = [];
        if ($leadingCount < 3) {
            $tertiaryAlternatives = $scoreTiers[2];
        }

        $leading = array_merge(...$leadingTiers, ...($tertiaryAlternatives === [] ? [] : [$tertiaryAlternatives]));
        $codeSets = [[]];
        foreach ($leadingTiers as $tier) {
            $next = [];
            foreach ($codeSets as $prefix) {
                foreach ($this->permutations($tier) as $permutation) {
                    $next[] = [...$prefix, ...$permutation];
                }
            }
            $codeSets = $next;
        }
        if ($tertiaryAlternatives !== []) {
            $codeSets = array_map(
                static fn (array $dimension): array => [...$codeSets[0], $dimension],
                $tertiaryAlternatives,
            );
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
    private function permutations(array $dimensions): array
    {
        if (count($dimensions) <= 1) {
            return [$dimensions];
        }

        $permutations = [];
        foreach ($dimensions as $index => $dimension) {
            $remaining = $dimensions;
            array_splice($remaining, $index, 1);
            foreach ($this->permutations($remaining) as $suffix) {
                $permutations[] = [$dimension, ...$suffix];
            }
        }

        return $permutations;
    }
}
