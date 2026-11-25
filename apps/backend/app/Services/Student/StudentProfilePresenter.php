<?php

namespace App\Services\Student;

use App\Models\AssessmentSession;
use App\Models\User;
use App\Services\Assessment\RiasecProfileVariantGenerator;
use App\Services\Assessment\RiasecQuestionnaire;
use Carbon\CarbonImmutable;

final class StudentProfilePresenter
{
    public function __construct(private readonly RiasecProfileVariantGenerator $profileVariantGenerator) {}

    /** @return array<string, mixed> */
    public function present(User $student): array
    {
        $student->loadMissing('studentProfile');
        $assessment = $this->latestAssessment($student);
        $riasec = $assessment ? $this->riasec($assessment) : null;
        $profile = $student->studentProfile;
        $birthDate = $profile?->birth_date;
        $age = $birthDate ? CarbonImmutable::createFromFormat('Y-m-d', $birthDate)?->age : null;

        return [
            'student' => [
                'id' => $student->getKey(),
                'name' => $student->name,
                'firstName' => $student->first_name,
                'lastName' => $student->last_name,
                'email' => $student->email,
                'photoUrl' => $profile?->photo_path
                    ? '/api/v1/profile-photos/'.$student->getKey().'?v='.$profile->updated_at?->getTimestamp()
                    : $student->google_avatar_url,
            ],
            'personalAcademic' => [
                'complete' => $profile !== null
                    && $profile->id_number !== null
                    && $birthDate !== null
                    && $profile->phone !== null
                    && $profile->municipality !== null
                    && ($profile->barangay_id !== null || $profile->province !== null),
                'idNumber' => $profile?->id_number,
                'birthDate' => $birthDate,
                'age' => $age,
                'phone' => $profile?->phone,
                'location' => $profile?->locationSelection(),
                'addressLine' => $profile?->address_line,
                'barangay' => $profile?->barangay,
                'municipality' => $profile?->municipality,
                'province' => $profile?->province,
                'updatedAt' => $profile?->updated_at?->toAtomString(),
            ],
            'riasec' => $riasec,
        ];
    }

    private function latestAssessment(User $student): ?AssessmentSession
    {
        return $student->assessmentSessions()
            ->whereIn('instrument_code', RiasecQuestionnaire::supportedInstrumentCodes())
            ->where('status', 'result_available')
            ->latest('result_available_at')
            ->first();
    }

    /** @return array<string, mixed> */
    private function riasec(AssessmentSession $assessment): array
    {
        $codes = ['Realistic' => 'R', 'Investigative' => 'I', 'Artistic' => 'A', 'Social' => 'S', 'Enterprising' => 'E', 'Conventional' => 'C'];
        $entries = RiasecQuestionnaire::normalizeResultEntries($assessment->result_payload['result'] ?? []);
        $dimensions = array_map(static fn (array $entry, int $index): array => [
            'code' => $codes[$entry['area']] ?? '',
            'label' => $entry['area'],
            'value' => (int) ($entry['score'] ?? 0),
            'order' => $index,
        ], $entries, array_keys($entries));
        $leading = $dimensions;
        usort($leading, static fn (array $left, array $right): int => ($right['value'] <=> $left['value']) ?: ($left['order'] <=> $right['order']));
        $previousValue = null;
        $rank = 0;
        foreach ($leading as $index => &$dimension) {
            if ($previousValue === null || $dimension['value'] !== $previousValue) {
                $rank = $index + 1;
            }
            $dimension['rank'] = $rank;
            $previousValue = $dimension['value'];
        }
        unset($dimension);
        $rankCounts = array_count_values(array_column($leading, 'rank'));
        foreach ($leading as &$dimension) {
            $dimension['isTied'] = ($rankCounts[$dimension['rank']] ?? 0) > 1;
        }
        unset($dimension);
        $rankedByCode = collect($leading)->keyBy('code');
        $profileVariants = $this->profileVariantGenerator->generate($leading);
        $leading = $profileVariants['leadingDimensions'];
        $firstVariant = $profileVariants['variants'][0] ?? ['code' => '', 'codes' => []];
        $byCode = collect($dimensions)->keyBy('code');
        $orderedFirstVariant = array_map(
            static fn (string $code): array => $byCode->get($code),
            $firstVariant['codes'],
        );

        return [
            'sessionReference' => 'ASMT-'.str_pad((string) $assessment->getKey(), 6, '0', STR_PAD_LEFT),
            'availableAt' => $assessment->result_available_at?->toAtomString(),
            'primary' => isset($orderedFirstVariant[0]) ? ['code' => $orderedFirstVariant[0]['code'], 'label' => $orderedFirstVariant[0]['label']] : null,
            'secondary' => isset($orderedFirstVariant[1]) ? ['code' => $orderedFirstVariant[1]['code'], 'label' => $orderedFirstVariant[1]['label']] : null,
            'tertiary' => isset($orderedFirstVariant[2]) ? ['code' => $orderedFirstVariant[2]['code'], 'label' => $orderedFirstVariant[2]['label']] : null,
            'leadingAreas' => array_map(static function (array $dimension) use ($rankedByCode): array {
                $ranked = $rankedByCode->get($dimension['code'], []);

                return [
                    'code' => $dimension['code'],
                    'label' => $dimension['label'],
                    'rank' => (int) ($dimension['rank'] ?? $ranked['rank'] ?? 0),
                    'isTied' => (bool) ($dimension['isTied'] ?? $ranked['isTied'] ?? false),
                ];
            }, $leading),
            'code' => $firstVariant['code'],
            'profileVariantVersion' => $profileVariants['version'],
            'profileVariants' => $profileVariants['variants'],
            'dimensions' => array_map(static fn (array $dimension): array => [
                'code' => $dimension['code'], 'label' => $dimension['label'], 'value' => $dimension['value'],
            ], $dimensions),
        ];
    }
}
