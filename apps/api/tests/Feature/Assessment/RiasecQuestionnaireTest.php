<?php

namespace Tests\Feature\Assessment;

use App\Models\EntranceExaminationResult;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use App\Services\Assessment\EntranceExaminationPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RiasecQuestionnaireTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_loads_the_database_questionnaire_without_an_external_request(): void
    {
        Http::fake();

        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->getJson('/api/v1/student/assessments/riasec/questions')
            ->assertOk()
            ->assertJsonPath('data.instrument.code', 'tcc-riasec-42-v1')
            ->assertJsonPath('data.instrument.content_version', 'researcher-questionnaire-v1')
            ->assertJsonPath('data.instrument.status', 'proposed')
            ->assertJsonCount(42, 'data.questions')
            ->assertJsonCount(2, 'data.answer_options')
            ->assertJsonPath('data.questions.0.source_number', 2)
            ->assertJsonPath('data.questions.41.source_number', 45);

        $this->assertDatabaseMissing('assessment_questions', ['source_number' => 1]);
        $this->assertDatabaseMissing('assessment_questions', ['source_number' => 7]);
        $this->assertDatabaseMissing('assessment_questions', ['source_number' => 14]);
        Http::assertNothingSent();
    }

    public function test_results_use_the_database_category_mapping_and_binary_count_rule(): void
    {
        $answers = array_fill(0, 42, 2);
        $answers[0] = 1; // source item 2, Investigative
        $answers[18] = 1; // source item 22, Realistic
        $answers[27] = 1; // source item 31, Realistic

        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->postJson('/api/v1/student/assessments/riasec/results', ['answers' => $answers])
            ->assertOk()
            ->assertJsonPath('data.instrument_code', 'tcc-riasec-42-v1')
            ->assertJsonPath('data.scoring_source', 'researcher-questionnaire-v1')
            ->assertJsonPath('data.result.0.area', 'Realistic')
            ->assertJsonPath('data.result.0.score', 2)
            ->assertJsonPath('data.result.1.score', 1);
    }

    public function test_results_require_all_forty_two_binary_answers(): void
    {
        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->postJson('/api/v1/student/assessments/riasec/results', ['answers' => array_fill(0, 41, 1)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('answers');

        $answers = array_fill(0, 42, 1);
        $answers[10] = 3;
        $this->postJson('/api/v1/student/assessments/riasec/results', ['answers' => $answers])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('answers.10');
    }

    public function test_questionnaire_endpoints_enforce_student_access(): void
    {
        $this->getJson('/api/v1/student/assessments/riasec/questions')->assertUnauthorized();

        $this->actingAs($this->userWithRole(RoleSlug::Admin))
            ->getJson('/api/v1/student/assessments/riasec/questions')
            ->assertForbidden();
    }

    public function test_completed_local_questionnaire_can_produce_programme_recommendations(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);
        $session = $this->actingAs($student)
            ->postJson('/api/v1/student/assessments/riasec/sessions')
            ->assertCreated()
            ->json('data');

        $this->patchJson("/api/v1/student/assessments/riasec/sessions/{$session['id']}", [
            'answers' => array_combine(range(1, 42), array_fill(0, 42, 1)),
            'current_question' => 42,
        ])->assertOk();

        $this->postJson("/api/v1/student/assessments/riasec/sessions/{$session['id']}/submit")
            ->assertOk()
            ->assertJsonPath('data.status', 'result_available');

        $this->getJson('/api/v1/student/recommendations/latest')
            ->assertOk()
            ->assertJsonPath('data.status', 'available')
            ->assertJsonPath('data.recommendation.totalEligible', 6)
            ->assertJsonPath('data.recommendation.entranceExamination.score', 2.5)
            ->assertJsonPath('data.recommendation.entranceExamination.eligibilityGroup', 'board')
            ->assertJsonPath('data.recommendation.courses.0.eligibilityGroup', 'board')
            ->assertJsonPath('data.recommendation.profile.dimensions.0.value', 4)
            ->assertJsonPath('data.recommendation.profile.dimensions.0.maximum', 4)
            ->assertJsonPath('data.recommendation.profile.dimensions.1.maximum', 8)
            ->assertJsonPath('data.recommendation.profile.guidance.status', 'proposed')
            ->assertJsonPath('data.recommendation.profile.guidance.explanations.R', fn (string $value): bool => $value !== '');
    }

    private function userWithRole(RoleSlug $roleSlug): User
    {
        $role = Role::query()->create(['slug' => $roleSlug->value, 'name' => $roleSlug->value]);
        $user = User::factory()->create();
        $user->roles()->attach($role);
        if ($roleSlug === RoleSlug::Student) {
            EntranceExaminationResult::query()->create([
                'user_id' => $user->getKey(),
                'score' => 2.5,
                'eligibility_group' => EntranceExaminationPolicy::BOARD,
                'rule_reference' => EntranceExaminationPolicy::RULE_REFERENCE,
                'declared_at' => now(),
            ]);
        }

        return $user;
    }
}
