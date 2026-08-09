<?php

namespace Tests\Feature\Student;

use App\Models\AssessmentSession;
use App\Models\RecommendationRun;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_create_and_update_only_their_own_self_report_profile(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);
        $other = $this->userWithRole(RoleSlug::Student);
        StudentProfile::query()->create([
            'user_id' => $other->getKey(),
            'strengths' => ['Leadership'],
            'growth_areas' => ['Writing'],
            'learning_preferences' => ['Reading'],
        ]);

        $payload = [
            'strengths' => ['Problem-solving', 'Logical thinking'],
            'growthAreas' => ['Time management'],
            'learningPreferences' => ['Hands-on activities', 'Independent work'],
        ];

        $this->actingAs($student)
            ->postJson('/api/v1/student/profile', $payload)
            ->assertOk()
            ->assertJsonPath('data.questionnaire.complete', true)
            ->assertJsonPath('data.questionnaire.strengths.0', 'Problem-solving')
            ->assertJsonPath('data.student.id', $student->getKey())
            ->assertJsonPath('data.riasec', null)
            ->assertJsonPath('data.careerInterests', []);

        $this->putJson('/api/v1/student/profile', [
            ...$payload,
            'strengths' => ['Creativity'],
        ])->assertOk()->assertJsonPath('data.questionnaire.strengths.0', 'Creativity');

        $this->getJson('/api/v1/student/profile')
            ->assertOk()
            ->assertJsonPath('data.student.email', $student->email)
            ->assertJsonPath('data.questionnaire.strengths', ['Creativity']);

        $this->assertDatabaseHas('student_profiles', ['user_id' => $student->getKey()]);
        $this->assertDatabaseHas('student_profiles', ['user_id' => $other->getKey()]);
        $this->assertSame(['Leadership'], $other->studentProfile()->firstOrFail()->strengths);
    }

    public function test_profile_submission_rejects_unapproved_or_malformed_values(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);

        $this->actingAs($student)
            ->putJson('/api/v1/student/profile', [
                'strengths' => ['Clinically gifted'],
                'growthAreas' => 'Time management',
                'learningPreferences' => ['Mind reader'],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['strengths.0', 'growthAreas', 'learningPreferences.0']);

        $this->assertDatabaseCount('student_profiles', 0);
    }

    public function test_profile_empty_state_and_current_riasec_result_are_truthful(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);

        $this->actingAs($student)
            ->getJson('/api/v1/student/profile')
            ->assertOk()
            ->assertJsonPath('data.questionnaire.complete', false)
            ->assertJsonPath('data.questionnaire.strengths', [])
            ->assertJsonPath('data.riasec', null);

        $this->getJson('/api/v1/student/profile/riasec-result')
            ->assertOk()
            ->assertJsonPath('data.status', 'not_available')
            ->assertJsonPath('data.result', null);

        $session = $this->completedAssessment($student);

        $this->getJson('/api/v1/student/profile/riasec-result')
            ->assertOk()
            ->assertJsonPath('data.status', 'available')
            ->assertJsonPath('data.result.sessionReference', 'ASMT-'.str_pad((string) $session->getKey(), 6, '0', STR_PAD_LEFT))
            ->assertJsonPath('data.result.primary.label', 'Investigative')
            ->assertJsonPath('data.result.secondary.label', 'Social')
            ->assertJsonPath('data.result.code', 'I-S');
    }

    public function test_career_interests_come_from_recorded_matches_and_configured_programmes(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);
        $session = $this->completedAssessment($student);
        RecommendationRun::query()->create([
            'user_id' => $student->getKey(),
            'assessment_session_id' => $session->getKey(),
            'catalogue_reference' => 'TCC-AY-2026-2027-V1',
            'rule_reference' => 'PROPOSED-RIASEC-1',
            'methodology_status' => 'Proposed methodology',
            'default_count' => 3,
            'total_eligible' => 1,
            'ranked_courses' => [[
                'id' => 'bs-information-technology',
                'rank' => 1,
                'code' => 'BSIT',
                'name' => 'BS Information Technology',
                'match' => 80,
            ]],
            'generated_at' => now(),
        ]);

        $this->actingAs($student)
            ->getJson('/api/v1/student/profile')
            ->assertOk()
            ->assertJsonPath('data.careerInterests.0', 'Software and application development')
            ->assertJsonPath('data.riasec.code', 'I-S');
    }

    public function test_counselor_can_view_but_not_modify_a_student_profile(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);
        $counselor = $this->userWithRole(RoleSlug::Counselor);
        StudentProfile::query()->create([
            'user_id' => $student->getKey(),
            'strengths' => ['Teamwork'],
            'growth_areas' => ['Public speaking'],
            'learning_preferences' => ['Group activities'],
        ]);

        $this->actingAs($counselor)
            ->getJson("/api/v1/counselor/students/{$student->getKey()}")
            ->assertOk()
            ->assertJsonPath('data.profile.questionnaire.strengths.0', 'Teamwork');

        $this->putJson('/api/v1/student/profile', [
            'strengths' => ['Leadership'],
            'growthAreas' => [],
            'learningPreferences' => [],
        ])->assertForbidden();

        $this->assertDatabaseMissing('student_profiles', [
            'user_id' => $student->getKey(),
            'strengths' => json_encode(['Leadership']),
        ]);
    }

    public function test_guest_cannot_read_or_write_student_profiles(): void
    {
        $this->getJson('/api/v1/student/profile')->assertUnauthorized();
        $this->putJson('/api/v1/student/profile', [])->assertUnauthorized();
        $this->getJson('/api/v1/student/profile/riasec-result')->assertUnauthorized();
    }

    public function test_student_can_upload_and_replace_only_their_own_valid_profile_photo(): void
    {
        Storage::fake('local');
        $student = $this->userWithRole(RoleSlug::Student);
        $response = $this->actingAs($student)
            ->postJson('/api/v1/student/profile/photo', ['photo' => UploadedFile::fake()->image('profile.jpg', 640, 640)])
            ->assertCreated();
        $firstPath = StudentProfile::query()->where('user_id', $student->getKey())->value('photo_path');
        $response->assertJsonPath('data.student.photoUrl', '/api/v1/profile-photos/'.$student->getKey());
        Storage::disk('local')->assertExists($firstPath);
        $this->get('/api/v1/profile-photos/'.$student->getKey())->assertOk();
        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->get('/api/v1/profile-photos/'.$student->getKey())
            ->assertForbidden();
        $this->actingAs($this->userWithRole(RoleSlug::Counselor))
            ->get('/api/v1/profile-photos/'.$student->getKey())
            ->assertOk();
        $this->actingAs($student);

        $this->postJson('/api/v1/student/profile/photo', ['photo' => UploadedFile::fake()->image('replacement.png', 500, 500)])
            ->assertCreated();
        Storage::disk('local')->assertMissing($firstPath);

        $this->postJson('/api/v1/student/profile/photo', ['photo' => UploadedFile::fake()->create('profile.pdf', 20, 'application/pdf')])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('photo');
    }

    private function userWithRole(RoleSlug $slug): User
    {
        $role = Role::query()->firstOrCreate(['slug' => $slug->value], ['name' => $slug->value]);
        $user = User::factory()->create(['account_status' => 'active']);
        $user->roles()->attach($role);

        return $user;
    }

    private function completedAssessment(User $student): AssessmentSession
    {
        return AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'attempt_number' => 1,
            'is_current' => true,
            'status' => 'result_available',
            'answers' => array_combine(range(1, 30), array_fill(0, 30, 3)),
            'current_question' => 30,
            'result_payload' => ['result' => [
                ['area' => 'Realistic', 'score' => 12],
                ['area' => 'Investigative', 'score' => 22],
                ['area' => 'Artistic', 'score' => 16],
                ['area' => 'Social', 'score' => 20],
                ['area' => 'Enterprising', 'score' => 14],
                ['area' => 'Conventional', 'score' => 18],
            ]],
            'started_at' => now()->subHour(),
            'submitted_at' => now()->subMinute(),
            'result_available_at' => now(),
        ]);
    }
}
