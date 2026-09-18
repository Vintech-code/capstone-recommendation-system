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
            ->assertJsonPath('data.instrument.code', 'tcc-uhcc-riasec-42-v1')
            ->assertJsonPath('data.instrument.content_version', 'riasec-assessment-asset-v1')
            ->assertJsonPath('data.instrument.status', 'proposed')
            ->assertJsonPath('data.instrument.source.url', 'https://careerexplorer.hawaii.edu/assessments/riasec_multiLang.php')
            ->assertJsonPath('data.instrument.source.asset_reference', 'apps/web/src/assets/questionnaires/riasec-assessment.png')
            ->assertJsonPath('data.instrument.scoring.maximum_per_area', 7)
            ->assertJsonCount(42, 'data.questions')
            ->assertJsonCount(2, 'data.answer_options')
            ->assertJsonPath('data.questions.0.source_number', 1)
            ->assertJsonPath('data.questions.0.text', 'I like to work on cars')
            ->assertJsonPath('data.questions.41.source_number', 42)
            ->assertJsonPath('data.questions.41.text', 'I like to give speeches');

        $this->assertDatabaseHas('assessment_questions', ['source_number' => 1, 'riasec_code' => 'R']);
        $this->assertDatabaseHas('assessment_questions', ['source_number' => 7, 'riasec_code' => 'R']);
        $this->assertDatabaseHas('assessment_questions', ['source_number' => 14, 'riasec_code' => 'R']);
        Http::assertNothingSent();
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

        $response = $this->getJson('/api/v1/student/recommendations/latest')
            ->assertOk()
            ->assertJsonPath('data.status', 'available')
            ->assertJsonPath('data.recommendation.totalEligible', 6)
            ->assertJsonPath('data.recommendation.entranceExamination.score', 2.5)
            ->assertJsonPath('data.recommendation.entranceExamination.eligibilityGroup', 'board')
            ->assertJsonPath('data.recommendation.profile.dimensions.0.value', 7)
            ->assertJsonPath('data.recommendation.profile.dimensions.0.maximum', 7)
            ->assertJsonPath('data.recommendation.profile.dimensions.1.maximum', 7)
            ->assertJsonPath('data.recommendation.profile.guidance.status', 'mixed_cmo_sourced_and_proposed')
            ->assertJsonPath('data.recommendation.profile.guidance.explanations.R', fn (string $value): bool => $value !== '');

        $this->assertEqualsCanonicalizing(
            ['board', 'non_board'],
            collect($response->json('data.recommendation.courses'))
                ->pluck('eligibilityGroup')
                ->unique()
                ->values()
                ->all(),
            'The entrance group is guidance and must not filter the RIASEC ranking.',
        );
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
