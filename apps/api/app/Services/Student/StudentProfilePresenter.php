<?php

namespace App\Services\Student;

use App\Models\AssessmentSession;
use App\Models\User;
use App\Services\Onet\OnetInterestProfilerClient;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;

final class StudentProfilePresenter
{
    public const STRENGTHS = [
        'Problem-solving', 'Logical thinking', 'Creativity', 'Communication', 'Leadership',
        'Organization', 'Teamwork', 'Critical thinking', 'Attention to detail', 'Adaptability',
    ];

    public const GROWTH_AREAS = [
        'Time management', 'Public speaking', 'Mathematics', 'Writing', 'Communication',
        'Teamwork', 'Leadership', 'Organization', 'Critical thinking', 'Technical skills',
    ];

    public const LEARNING_PREFERENCES = [
        'Visual demonstrations', 'Reading', 'Hands-on activities', 'Group activities',
        'Discussions', 'Independent work', 'Step-by-step examples', 'Practice exercises',
    ];

    public function __construct(private readonly TccProgrammeCatalogueRepository $catalogues) {}

    /** @return array<string, mixed> */
    public function present(User $student): array
    {
        $student->loadMissing('studentProfile');
        $assessment = $this->latestAssessment($student);
        $riasec = $assessment ? $this->riasec($assessment) : null;
        $profile = $student->studentProfile;
        $strengths = $profile?->strengths ?? [];
        $growthAreas = $profile?->growth_areas ?? [];
        $learningPreferences = $profile?->learning_preferences ?? [];

        return [
            'student' => [
                'id' => $student->getKey(),
                'name' => $student->name,
                'email' => $student->email,
                'photoUrl' => $profile?->photo_path ? '/api/v1/profile-photos/'.$student->getKey() : null,
            ],
            'questionnaire' => [
                'complete' => $strengths !== [] && $growthAreas !== [] && $learningPreferences !== [],
                'strengths' => array_values($strengths),
                'growthAreas' => array_values($growthAreas),
                'learningPreferences' => array_values($learningPreferences),
                'updatedAt' => $profile?->updated_at?->toAtomString(),
            ],
            'options' => [
                'strengths' => self::STRENGTHS,
                'growthAreas' => self::GROWTH_AREAS,
                'learningPreferences' => self::LEARNING_PREFERENCES,
            ],
            'riasec' => $riasec,
            'careerInterests' => $assessment ? $this->careerInterests($assessment) : [],
            'about' => $this->summary($riasec, $strengths, $learningPreferences),
        ];
    }

    /** @return array<string, mixed>|null */
    public function currentRiasec(User $student): ?array
    {
        $assessment = $this->latestAssessment($student);

        return $assessment ? $this->riasec($assessment) : null;
    }

    private function latestAssessment(User $student): ?AssessmentSession
    {
        return $student->assessmentSessions()
            ->where('instrument_code', OnetInterestProfilerClient::INSTRUMENT_CODE)
            ->where('status', 'result_available')
            ->with('recommendationRun')
            ->latest('attempt_number')
            ->first();
    }

    /** @return array<string, mixed> */
    private function riasec(AssessmentSession $assessment): array
    {
        $codes = ['Realistic' => 'R', 'Investigative' => 'I', 'Artistic' => 'A', 'Social' => 'S', 'Enterprising' => 'E', 'Conventional' => 'C'];
        $entries = OnetInterestProfilerClient::normalizeResultEntries($assessment->result_payload['result'] ?? []);
        $dimensions = array_map(static fn (array $entry, int $index): array => [
            'code' => $codes[$entry['area']] ?? '',
            'label' => $entry['area'],
            'value' => (int) ($entry['score'] ?? 0),
            'order' => $index,
        ], $entries, array_keys($entries));
        $leading = $dimensions;
        usort($leading, static fn (array $left, array $right): int => ($right['value'] <=> $left['value']) ?: ($left['order'] <=> $right['order']));
        $leading = array_slice($leading, 0, 2);

        return [
            'sessionReference' => 'ASMT-'.str_pad((string) $assessment->getKey(), 6, '0', STR_PAD_LEFT),
            'availableAt' => $assessment->result_available_at?->toAtomString(),
            'primary' => isset($leading[0]) ? ['code' => $leading[0]['code'], 'label' => $leading[0]['label']] : null,
            'secondary' => isset($leading[1]) ? ['code' => $leading[1]['code'], 'label' => $leading[1]['label']] : null,
            'code' => implode('-', array_column($leading, 'code')),
            'dimensions' => array_map(static fn (array $dimension): array => [
                'code' => $dimension['code'], 'label' => $dimension['label'], 'value' => $dimension['value'],
            ], $dimensions),
        ];
    }

    /** @return array<int, string> */
    private function careerInterests(AssessmentSession $assessment): array
    {
        $programmeIds = collect($assessment->recommendationRun?->ranked_courses ?? [])
            ->sortBy('rank')
            ->take(3)
            ->pluck('id')
            ->filter()
            ->values();
        if ($programmeIds->isEmpty()) {
            return [];
        }

        try {
            $programmes = collect($this->catalogues->current()['programmes'] ?? [])->keyBy('id');
        } catch (\JsonException) {
            return [];
        }

        return $programmeIds
            ->flatMap(static fn (string $id): array => $programmes->get($id, [])['career_directions'] ?? [])
            ->filter(static fn (mixed $value): bool => is_string($value) && trim($value) !== '')
            ->unique()
            ->take(8)
            ->values()
            ->all();
    }

    /** @param array<string, mixed>|null $riasec
     * @param  array<int, string>  $strengths
     * @param  array<int, string>  $learningPreferences
     */
    private function summary(?array $riasec, array $strengths, array $learningPreferences): string
    {
        $sentences = [];
        if ($riasec && $riasec['primary'] && $riasec['secondary']) {
            $sentences[] = "The latest recorded RIASEC result is {$riasec['code']} ({$riasec['primary']['label']} and {$riasec['secondary']['label']}).";
        }
        if ($strengths !== []) {
            $sentences[] = 'The student selected '.implode(', ', $strengths).' as self-reported strengths.';
        }
        if ($learningPreferences !== []) {
            $sentences[] = 'Recorded learning preferences include '.implode(', ', $learningPreferences).'.';
        }

        return $sentences === []
            ? 'Complete the interest assessment and profile questionnaire to build a factual student profile.'
            : implode(' ', $sentences);
    }
}
