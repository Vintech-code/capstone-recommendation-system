<?php

namespace Tests\Feature\Student;

use App\Models\AssessmentSession;
use App\Models\Barangay;
use App\Models\CityMunicipality;
use App\Models\Province;
use App\Models\RecommendationRun;
use App\Models\Region;
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

    public function test_google_avatar_is_the_profile_photo_fallback(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);
        $student->forceFill([
            'google_avatar_url' => 'https://example.test/google-avatar.png',
        ])->save();

        $this->actingAs($student)
            ->getJson('/api/v1/student/profile')
            ->assertOk()
            ->assertJsonPath(
                'data.student.photoUrl',
                'https://example.test/google-avatar.png',
            );
    }

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

        $region = Region::create(['code' => '0100000000', 'name' => 'Test region']);
        $province = Province::create(['code' => '0100100000', 'name' => 'Test province', 'region_id' => $region->id]);
        $city = CityMunicipality::create(['code' => '0100101000', 'name' => 'Test city', 'type' => 'City', 'region_id' => $region->id, 'province_id' => $province->id]);
        $barangay = Barangay::create(['code' => '0100101001', 'name' => 'Test barangay', 'city_municipality_id' => $city->id]);

        $payload = [
            'location' => ['regionId' => $region->id, 'provinceId' => $province->id, 'cityMunicipalityId' => $city->id, 'barangayId' => $barangay->id],
            'lrn' => '128490000011',
            'birthDate' => '2007-04-18',
            'phone' => '+63 917 842 1928',
            'addressLine' => 'Zone 2',
            'barangay' => 'Poblacion',
            'municipality' => 'Tagoloan',
            'province' => 'Misamis Oriental',
            'shsSchoolName' => 'Tagoloan National High School',
            'shsStrand' => 'STEM',
            'shsGraduationYear' => 2026,
            'strengths' => ['Problem-solving', 'Logical thinking'],
            'growthAreas' => ['Time management'],
            'learningPreferences' => ['Hands-on activities', 'Independent work'],
        ];

        $this->actingAs($student)
            ->putJson('/api/v1/student/profile', $payload)
            ->assertOk()
            ->assertJsonPath('data.questionnaire.complete', true)
            ->assertJsonPath('data.questionnaire.strengths.0', 'Problem-solving')
            ->assertJsonPath('data.personalAcademic.complete', true)
            ->assertJsonPath('data.personalAcademic.lrn', '128490000011')
            ->assertJsonPath('data.personalAcademic.shsStrand', 'STEM')
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
        $stored = StudentProfile::query()->where('user_id', $student->getKey())->firstOrFail();
        $this->assertSame('128490000011', $stored->lrn);
        $this->assertNotSame('128490000011', $stored->getRawOriginal('lrn'));
        $this->assertNotSame('+63 917 842 1928', $stored->getRawOriginal('phone'));
        $this->assertArrayNotHasKey('shs_gwa', $stored->getAttributes());
        $this->assertDatabaseHas('student_profiles', ['user_id' => $other->getKey()]);
        $this->assertSame(['Leadership'], $other->studentProfile()->firstOrFail()->strengths);
    }

    public function test_lrn_cannot_be_connected_to_multiple_student_accounts(): void
    {
        $first = $this->userWithRole(RoleSlug::Student);
        $second = $this->userWithRole(RoleSlug::Student);
        $payload = [
            'lrn' => '128490000011',
            'strengths' => ['Problem-solving'],
            'growthAreas' => ['Time management'],
            'learningPreferences' => ['Reading'],
        ];

        $this->actingAs($first)->putJson('/api/v1/student/profile', $payload)->assertOk();
        $this->actingAs($second)
            ->putJson('/api/v1/student/profile', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('lrn');
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

    public function test_profile_empty_state_is_truthful(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);

        $this->actingAs($student)
            ->getJson('/api/v1/student/profile')
            ->assertOk()
            ->assertJsonPath('data.questionnaire.complete', false)
            ->assertJsonPath('data.questionnaire.strengths', [])
            ->assertJsonPath('data.riasec', null);

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
            ->assertJsonPath('data.careerInterests.0', 'Web and applications developer')
            ->assertJsonPath('data.riasec.code', 'I-S-A');
    }

    public function test_guest_cannot_read_or_write_student_profiles(): void
    {
        $this->getJson('/api/v1/student/profile')->assertUnauthorized();
        $this->putJson('/api/v1/student/profile', [])->assertUnauthorized();
    }

    public function test_student_can_upload_and_replace_only_their_own_valid_profile_photo(): void
    {
        Storage::fake('local');
        $student = $this->userWithRole(RoleSlug::Student);
        $response = $this->actingAs($student)
            ->postJson('/api/v1/student/profile/photo', ['photo' => UploadedFile::fake()->image('profile.jpg', 640, 640)])
            ->assertCreated();
        $firstPath = StudentProfile::query()->where('user_id', $student->getKey())->value('photo_path');
        $this->assertStringStartsWith(
            '/api/v1/profile-photos/'.$student->getKey().'?v=',
            (string) $response->json('data.student.photoUrl'),
        );
        Storage::disk('local')->assertExists($firstPath);
        $this->get('/api/v1/profile-photos/'.$student->getKey())->assertOk();
        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->get('/api/v1/profile-photos/'.$student->getKey())
            ->assertForbidden();
        $this->actingAs($this->userWithRole(RoleSlug::Admin))
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
            'instrument_code' => 'tcc-uhcc-riasec-42-v1',
            'attempt_number' => 1,
            'is_current' => true,
            'status' => 'result_available',
            'answers' => array_combine(range(1, 42), array_fill(0, 42, 1)),
            'current_question' => 42,
            'result_payload' => ['result' => [
                ['area' => 'Realistic', 'score' => 4],
                ['area' => 'Investigative', 'score' => 7],
                ['area' => 'Artistic', 'score' => 5],
                ['area' => 'Social', 'score' => 6],
                ['area' => 'Enterprising', 'score' => 3],
                ['area' => 'Conventional', 'score' => 5],
            ]],
            'started_at' => now()->subHour(),
            'submitted_at' => now()->subMinute(),
            'result_available_at' => now(),
        ]);
    }
}
