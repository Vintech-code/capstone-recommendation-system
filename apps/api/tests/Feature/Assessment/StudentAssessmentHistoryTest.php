<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentSession;
use App\Models\EntranceExaminationResult;
use App\Models\RecommendationRun;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use App\Services\Assessment\EntranceExaminationPolicy;
use App\Services\Assessment\RiasecQuestionnaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentAssessmentHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_retrieves_history_newest_first_with_snapshots(): void
    {
        $student = $this->student();

        // Attempt 1: Completed
        $firstSession = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => RiasecQuestionnaire::INSTRUMENT_CODE,
            'attempt_number' => 1,
            'is_current' => false,
            'status' => 'result_available',
            'answers' => array_combine(range(1, 42), array_fill(0, 42, 1)),
            'current_question' => 42,
            'started_at' => now()->subDays(10),
            'submitted_at' => now()->subDays(10),
            'result_available_at' => now()->subDays(10),
            'result_payload' => [
                'instrument_code' => RiasecQuestionnaire::INSTRUMENT_CODE,
                'result' => [
                    ['area' => 'Realistic', 'score' => 7],
                    ['area' => 'Investigative', 'score' => 6],
                    ['area' => 'Artistic', 'score' => 5],
                    ['area' => 'Social', 'score' => 4],
                    ['area' => 'Enterprising', 'score' => 3],
                    ['area' => 'Conventional', 'score' => 2],
                ],
            ],
        ]);

        RecommendationRun::query()->create([
            'user_id' => $student->getKey(),
            'assessment_session_id' => $firstSession->getKey(),
            'catalogue_reference' => 'TCC-CATALOGUE-2026-01',
            'rule_reference' => 'RULE-2026-01',
            'entrance_examination_snapshot' => ['score' => 2.5, 'eligibilityGroup' => 'board'],
            'methodology_status' => 'proposed',
            'total_eligible' => 11,
            'ranked_courses' => [['code' => 'BSCS', 'name' => 'Computer Science', 'fit' => 'High']],
            'generated_at' => now()->subDays(10),
        ]);

        // Attempt 2: In progress
        $secondSession = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'previous_session_id' => $firstSession->getKey(),
            'instrument_code' => RiasecQuestionnaire::INSTRUMENT_CODE,
            'attempt_number' => 2,
            'is_current' => true,
            'status' => 'in_progress',
            'retake_reason' => 'Changed interest focus',
            'answers' => ['1' => 1, '2' => 2],
            'current_question' => 3,
            'started_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($student)
            ->getJson('/api/v1/student/assessments/riasec/history')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        // Newest first
        $this->assertSame(2, $response->json('data.0.attempt_number'));
        $this->assertSame('in_progress', $response->json('data.0.status'));
        $this->assertTrue($response->json('data.0.is_current'));
        $this->assertSame('Changed interest focus', $response->json('data.0.retake_reason'));

        $this->assertSame(1, $response->json('data.1.attempt_number'));
        $this->assertSame('result_available', $response->json('data.1.status'));
        $this->assertFalse($response->json('data.1.is_current'));
        $this->assertNotNull($response->json('data.1.recommendation_summary'));
        $this->assertSame(11, $response->json('data.1.recommendation_summary.total_eligible'));
        $this->assertSame(1, $response->json('data.1.recommendation_summary.ranked_count'));
    }

    public function test_retake_is_blocked_when_minimum_days_waiting_period_not_elapsed(): void
    {
        config()->set('assessment.retake.minimum_days_between_completed_attempts', 14);
        $student = $this->student();

        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => RiasecQuestionnaire::INSTRUMENT_CODE,
            'attempt_number' => 1,
            'is_current' => true,
            'status' => 'result_available',
            'answers' => array_combine(range(1, 42), array_fill(0, 42, 1)),
            'current_question' => 42,
            'started_at' => now()->subDays(2),
            'submitted_at' => now()->subDays(2),
            'result_available_at' => now()->subDays(2),
            'retake_available_at' => now()->addDays(12),
        ]);

        $this->actingAs($student)
            ->postJson('/api/v1/student/assessments/riasec/sessions')
            ->assertStatus(422)
            ->assertJsonPath('message', fn (string $msg): bool => str_contains($msg, 'waiting period of 14 day(s) is required'));
    }

    public function test_student_can_generate_and_share_result_token(): void
    {
        $student = $this->student();
        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => RiasecQuestionnaire::INSTRUMENT_CODE,
            'attempt_number' => 1,
            'is_current' => true,
            'status' => 'result_available',
            'answers' => array_combine(range(1, 42), array_fill(0, 42, 1)),
            'current_question' => 42,
            'started_at' => now()->subDays(3),
            'submitted_at' => now()->subDays(3),
            'result_available_at' => now()->subDays(3),
            'result_payload' => [
                'instrument_code' => RiasecQuestionnaire::INSTRUMENT_CODE,
                'result' => [
                    ['area' => 'Realistic', 'score' => 7],
                    ['area' => 'Investigative', 'score' => 6],
                    ['area' => 'Artistic', 'score' => 5],
                    ['area' => 'Social', 'score' => 4],
                    ['area' => 'Enterprising', 'score' => 3],
                    ['area' => 'Conventional', 'score' => 2],
                ],
            ],
        ]);

        $shareResponse = $this->actingAs($student)
            ->postJson("/api/v1/student/assessments/riasec/sessions/{$session->getKey()}/share")
            ->assertOk()
            ->json('data');

        $this->assertNotEmpty($shareResponse['shareToken']);
        $this->assertSame(64, strlen($shareResponse['shareToken']));
        $this->assertStringContainsString($shareResponse['shareToken'], $shareResponse['shareUrl']);

        // Public shared endpoint access without auth
        $this->getJson("/api/v1/shared/results/{$shareResponse['shareToken']}")
            ->assertOk()
            ->assertJsonPath('data.reference', 'ASMT-'.str_pad((string) $session->getKey(), 6, '0', STR_PAD_LEFT))
            ->assertJsonPath('data.studentName', $student->name)
            ->assertJsonPath('data.attemptNumber', 1)
            ->assertJsonPath('data.topCode', 'RIA')
            ->assertJsonPath('data.formattedTopCode', 'R-I-A')
            ->assertJsonCount(6, 'data.dimensions')
            ->assertJsonCount(3, 'data.topDimensions')
            ->assertJsonMissing(['answers' => []]);

        // Student's private card endpoint
        $this->actingAs($student)
            ->getJson("/api/v1/student/assessments/riasec/sessions/{$session->getKey()}/card")
            ->assertOk()
            ->assertJsonPath('data.topCode', 'RIA');
    }

    public function test_another_student_cannot_access_private_result_card(): void
    {
        $owner = $this->student();
        $other = $this->student();

        $session = AssessmentSession::query()->create([
            'user_id' => $owner->getKey(),
            'instrument_code' => RiasecQuestionnaire::INSTRUMENT_CODE,
            'attempt_number' => 1,
            'is_current' => true,
            'status' => 'result_available',
            'answers' => array_combine(range(1, 42), array_fill(0, 42, 1)),
            'current_question' => 42,
            'started_at' => now(),
            'submitted_at' => now(),
            'result_available_at' => now(),
            'result_payload' => [
                'result' => [
                    ['area' => 'Realistic', 'score' => 7],
                    ['area' => 'Investigative', 'score' => 6],
                    ['area' => 'Artistic', 'score' => 5],
                    ['area' => 'Social', 'score' => 4],
                    ['area' => 'Enterprising', 'score' => 3],
                    ['area' => 'Conventional', 'score' => 2],
                ],
            ],
        ]);

        $this->actingAs($other)
            ->getJson("/api/v1/student/assessments/riasec/sessions/{$session->getKey()}/card")
            ->assertNotFound();

        $this->actingAs($other)
            ->postJson("/api/v1/student/assessments/riasec/sessions/{$session->getKey()}/share")
            ->assertNotFound();
    }

    public function test_admin_can_view_student_assessment_history_and_result_card(): void
    {
        $admin = $this->admin();
        $student = $this->student();

        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => RiasecQuestionnaire::INSTRUMENT_CODE,
            'attempt_number' => 1,
            'is_current' => true,
            'status' => 'result_available',
            'answers' => array_combine(range(1, 42), array_fill(0, 42, 1)),
            'current_question' => 42,
            'started_at' => now()->subDay(),
            'submitted_at' => now()->subDay(),
            'result_available_at' => now()->subDay(),
            'result_payload' => [
                'result' => [
                    ['area' => 'Realistic', 'score' => 7],
                    ['area' => 'Investigative', 'score' => 6],
                    ['area' => 'Artistic', 'score' => 5],
                    ['area' => 'Social', 'score' => 4],
                    ['area' => 'Enterprising', 'score' => 3],
                    ['area' => 'Conventional', 'score' => 2],
                ],
            ],
        ]);

        // Student list includes completed and retake counts
        $this->actingAs($admin)
            ->getJson('/api/v1/admin/students')
            ->assertOk()
            ->assertJsonPath('data.items.0.attemptCount', 1)
            ->assertJsonPath('data.items.0.completedAssessmentCount', 1)
            ->assertJsonPath('data.items.0.retakeCount', 0);

        // Student detail includes assessment summary
        $this->actingAs($admin)
            ->getJson("/api/v1/admin/students/{$student->getKey()}")
            ->assertOk()
            ->assertJsonPath('data.assessmentSummary.totalAttempts', 1)
            ->assertJsonPath('data.assessmentSummary.completedAttempts', 1)
            ->assertJsonPath('data.assessmentSummary.retakeCount', 0);

        // Admin can view read-only result card
        $this->actingAs($admin)
            ->getJson("/api/v1/admin/students/{$student->getKey()}/attempts/{$session->getKey()}/card")
            ->assertOk()
            ->assertJsonPath('data.reference', 'ASMT-'.str_pad((string) $session->getKey(), 6, '0', STR_PAD_LEFT))
            ->assertJsonPath('data.topCode', 'RIA');
    }

    private function student(): User
    {
        $role = Role::query()->firstOrCreate(
            ['slug' => RoleSlug::Student->value],
            ['name' => 'Student Applicant'],
        );
        $student = User::factory()->create();
        $student->roles()->attach($role);
        EntranceExaminationResult::query()->create([
            'user_id' => $student->getKey(),
            'score' => 2.5,
            'eligibility_group' => EntranceExaminationPolicy::BOARD,
            'rule_reference' => EntranceExaminationPolicy::RULE_REFERENCE,
            'declared_at' => now(),
        ]);

        return $student;
    }

    private function admin(): User
    {
        $role = Role::query()->firstOrCreate(
            ['slug' => RoleSlug::Admin->value],
            ['name' => 'Administrator'],
        );
        $admin = User::factory()->create();
        $admin->roles()->attach($role);

        return $admin;
    }
}
