<?php

namespace App\Services\Assessment;

use App\Models\AssessmentSession;

final class ResultCardPresenter
{
    /** @return array<string, mixed> */
    public function present(AssessmentSession $session): array
    {
        $session->loadMissing(['user:id,name,email', 'entranceExaminationResult']);

        $dimensions = $this->dimensions($session);
        $topCodeInfo = $this->topCode($dimensions);
        $topDimensions = array_slice($this->sortDimensions($dimensions), 0, 3);

        $scoringVersion = $session->result_payload['instrument']['content_version']
            ?? $session->result_payload['scoring_source']
            ?? 'RIASEC-OQ42-2026-01';

        $guidanceVersion = $session->result_payload['guidance']['version']
            ?? config('assessment.retake.version')
            ?? 'METHODOLOGY-PROPOSED-2026-01';

        return [
            'id' => $session->getKey(),
            'reference' => 'ASMT-'.str_pad((string) $session->getKey(), 6, '0', STR_PAD_LEFT),
            'studentName' => $session->user?->name ?? 'Student Applicant',
            'attemptNumber' => $session->attempt_number,
            'isCurrent' => (bool) $session->is_current,
            'instrumentCode' => $session->instrument_code,
            'status' => $session->status,
            'startedAt' => $session->started_at?->toAtomString(),
            'submittedAt' => $session->submitted_at?->toAtomString(),
            'resultAvailableAt' => $session->result_available_at?->toAtomString(),
            'topCode' => $topCodeInfo['code'],
            'formattedTopCode' => $topCodeInfo['formatted'],
            'topDimensions' => $topDimensions,
            'dimensions' => $dimensions,
            'scoringVersion' => $scoringVersion,
            'guidanceVersion' => $guidanceVersion,
            'disclaimer' => 'This assessment result reflects self-reported interest alignment and researcher-proposed guidance rules. It does not constitute official admission or an institutional guarantee by Tanauan City College.',
            'shareToken' => $session->share_token,
            'sharedAt' => $session->shared_at?->toAtomString(),
        ];
    }

    /** @return array<int, array{code: 'R'|'I'|'A'|'S'|'E'|'C', label: string, value: int}> */
    public function dimensions(AssessmentSession $session): array
    {
        $labels = [
            'r' => 'Realistic',
            'realistic' => 'Realistic',
            'i' => 'Investigative',
            'investigative' => 'Investigative',
            'a' => 'Artistic',
            'artistic' => 'Artistic',
            's' => 'Social',
            'social' => 'Social',
            'e' => 'Enterprising',
            'enterprising' => 'Enterprising',
            'c' => 'Conventional',
            'conventional' => 'Conventional',
        ];
        $codes = [
            'Realistic' => 'R',
            'Investigative' => 'I',
            'Artistic' => 'A',
            'Social' => 'S',
            'Enterprising' => 'E',
            'Conventional' => 'C',
        ];
        $entries = $session->result_payload['result'] ?? [];
        if (! is_array($entries)) {
            return [];
        }

        $dimensions = [];
        foreach ($entries as $key => $entry) {
            if (! is_array($entry)) {
                $entry = ['area' => is_string($key) ? $key : '', 'score' => $entry];
            }
            $areaKey = strtolower(trim((string) ($entry['area'] ?? $entry['title'] ?? $entry['code'] ?? '')));
            $label = $labels[$areaKey] ?? null;
            if ($label === null || isset($dimensions[$codes[$label]])) {
                continue;
            }
            $dimensions[$codes[$label]] = [
                'code' => $codes[$label],
                'label' => $label,
                'value' => (int) ($entry['score'] ?? $entry['value'] ?? 0),
            ];
        }

        return array_values($dimensions);
    }

    /**
     * @param  array<int, array{code: string, label: string, value: int}>  $dimensions
     * @return array<int, array{code: string, label: string, value: int}>
     */
    public function sortDimensions(array $dimensions): array
    {
        if ($dimensions === []) {
            return [];
        }

        $sorted = $dimensions;
        foreach ($sorted as $index => &$entry) {
            $entry['_order'] = $index;
        }
        unset($entry);
        usort(
            $sorted,
            static fn (array $left, array $right): int => ($right['value'] <=> $left['value'])
                ?: ($left['_order'] <=> $right['_order']),
        );

        foreach ($sorted as &$entry) {
            unset($entry['_order']);
        }
        unset($entry);

        return $sorted;
    }

    /**
     * @param  array<int, array{code: string, label: string, value: int}>  $dimensions
     * @return array{code: string, formatted: string}
     */
    public function topCode(array $dimensions): array
    {
        if ($dimensions === []) {
            return ['code' => '', 'formatted' => ''];
        }

        $sorted = $this->sortDimensions($dimensions);
        $top = array_slice($sorted, 0, 3);
        $codes = array_column($top, 'code');

        return [
            'code' => implode('', $codes),
            'formatted' => implode('-', $codes),
        ];
    }
}
