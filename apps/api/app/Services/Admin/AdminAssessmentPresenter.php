<?php

namespace App\Services\Admin;

use App\Models\AssessmentSession;

final class AdminAssessmentPresenter
{
    /** @return array<string, mixed> */
    public function summary(AssessmentSession $session): array
    {
        $declaration = $session->entranceExaminationResult;
        $recommendation = $session->recommendationRun;

        return [
            'id' => $session->getKey(),
            'reference' => $this->reference($session),
            'studentId' => $session->user_id,
            'studentName' => $session->user?->name,
            'studentEmail' => $session->user?->email,
            'attemptNumber' => $session->attempt_number,
            'attemptCount' => (int) ($session->user?->assessment_sessions_count ?? $session->attempt_number),
            'retakeReason' => $session->retake_reason,
            'instrumentCode' => $session->instrument_code,
            'status' => $session->status,
            'answerCount' => count($session->answers ?? []),
            'questionCount' => (int) ($session->result_payload['answer_count'] ?? count($session->answers ?? [])),
            'topCode' => $this->topCode($session),
            'startedAt' => $session->started_at?->toAtomString(),
            'savedAt' => $session->saved_at?->toAtomString(),
            'submittedAt' => $session->submitted_at?->toAtomString(),
            'resultAvailableAt' => $session->result_available_at?->toAtomString(),
            'processingErrorCode' => $session->processing_error_code,
            'processingFailedAt' => $session->processing_failed_at?->toAtomString(),
            'entranceExamination' => $declaration ? [
                'resultId' => $declaration->getKey(),
                'score' => (float) $declaration->score,
                'eligibilityGroup' => $declaration->eligibility_group,
                'ruleReference' => $declaration->rule_reference,
                'source' => 'student_self_declared',
                'declaredAt' => $declaration->declared_at?->toAtomString(),
            ] : null,
            'recommendationSnapshot' => $recommendation ? [
                'catalogueReference' => $recommendation->catalogue_reference,
                'ruleReference' => $recommendation->rule_reference,
                'methodologyStatus' => $recommendation->methodology_status,
                'generatedAt' => $recommendation->generated_at?->toAtomString(),
                'totalEligible' => $recommendation->total_eligible,
            ] : null,
        ];
    }

    public function reference(AssessmentSession $session): string
    {
        return 'ASMT-'.str_pad((string) $session->getKey(), 6, '0', STR_PAD_LEFT);
    }

    /** @return array<int, array{code: string, label: string, value: int}> */
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
        $codes = ['Realistic' => 'R', 'Investigative' => 'I', 'Artistic' => 'A', 'Social' => 'S', 'Enterprising' => 'E', 'Conventional' => 'C'];
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

    public function topCode(AssessmentSession $session): ?string
    {
        $dimensions = $this->dimensions($session);
        if ($dimensions === []) {
            return null;
        }

        foreach ($dimensions as $index => &$entry) {
            $entry['_order'] = $index;
        }
        unset($entry);
        usort(
            $dimensions,
            static fn (array $left, array $right): int => ($right['value'] <=> $left['value'])
                ?: ($left['_order'] <=> $right['_order']),
        );

        return implode('-', array_column(array_slice($dimensions, 0, 3), 'code'));
    }
}
