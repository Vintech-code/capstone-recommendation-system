<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentSession;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EntranceExaminationResultTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_must_declare_a_result_before_loading_or_starting_the_assessment(): void
    {
        $student = $this->student();

        $this->actingAs($student)
            ->getJson('/api/v1/student/entrance-examination')
            ->assertOk()
            ->assertJsonPath('data.status', 'required')
            ->assertJsonPath('data.policy.boardRange.maximum', 2.5)
            ->assertJsonPath('data.policy.nonBoardRange.minimum', 2.6);

        $this->getJson('/api/v1/student/assessments/riasec/questions')->assertConflict();
        $this->postJson('/api/v1/student/assessments/riasec/sessions')->assertConflict();
    }

    public function test_student_self_declares_board_and_non_board_results_at_the_approved_boundary(): void
    {
        $boardStudent = $this->student();
        $this->actingAs($boardStudent)
            ->postJson('/api/v1/student/entrance-examination', ['score' => 2.5])
            ->assertCreated()
            ->assertJsonPath('data.result.eligibilityGroup', 'board')
            ->assertJsonPath('data.result.source', 'student_self_declared');

        $this->postJson('/api/v1/student/assessments/riasec/sessions')
            ->assertCreated()
            ->assertJsonPath('data.entrance_examination_result_id', 1);

        $nonBoardStudent = $this->student();
        $this->actingAs($nonBoardStudent)
            ->postJson('/api/v1/student/entrance-examination', ['score' => 2.6])
            ->assertCreated()
            ->assertJsonPath('data.result.eligibilityGroup', 'non_board');
    }

    public function test_result_requires_one_decimal_place_precision_and_the_approved_range(): void
    {
        $this->actingAs($this->student());

        foreach ([0.9, 5.1, 2.55] as $invalid) {
            $this->postJson('/api/v1/student/entrance-examination', ['score' => $invalid])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('score');
        }
    }

    public function test_attached_declaration_is_immutable(): void
    {
        $student = $this->student();
        $this->actingAs($student)
            ->postJson('/api/v1/student/entrance-examination', ['score' => 2.5])
            ->assertCreated();
        $this->postJson('/api/v1/student/assessments/riasec/sessions')->assertCreated();

        $this->postJson('/api/v1/student/entrance-examination', ['score' => 3.0])
            ->assertConflict();
    }

    public function test_existing_in_progress_session_is_attached_when_the_student_declares(): void
    {
        $student = $this->student();
        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'tcc-riasec-42-v1',
            'status' => 'in_progress',
            'answers' => [],
            'current_question' => 1,
            'is_current' => true,
            'started_at' => now(),
        ]);

        $this->actingAs($student)
            ->postJson('/api/v1/student/entrance-examination', ['score' => 2.0])
            ->assertCreated();

        $this->assertNotNull($session->fresh()->entrance_examination_result_id);
    }

    private function student(): User
    {
        $role = Role::query()->firstOrCreate(
            ['slug' => RoleSlug::Student->value],
            ['name' => 'Student Applicant'],
        );
        $student = User::factory()->create();
        $student->roles()->attach($role);

        return $student;
    }
}
