<?php

namespace Tests\Feature\Recommendation;

use App\Models\AssessmentSession;
use App\Models\GuidanceAppointment;
use App\Models\RecommendationRun;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentRecommendationTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_receives_truthful_unavailable_state_without_fabricated_courses(): void
    {
        $role = Role::query()->firstOrCreate(
            ['slug' => RoleSlug::Student->value],
            ['name' => 'Student Applicant'],
        );
        $student = User::factory()->create();
        $student->roles()->attach($role);

        $this->actingAs($student)
            ->getJson('/api/v1/student/recommendations/latest')
            ->assertOk()
            ->assertJsonPath('data.status', 'not_available')
            ->assertJsonPath('data.recommendation', null);
    }

    public function test_guest_cannot_read_student_recommendations(): void
    {
        $this->getJson('/api/v1/student/recommendations/latest')
            ->assertUnauthorized();
    }

    public function test_student_can_browse_the_versioned_programme_catalogue_and_open_a_programme(): void
    {
        $student = $this->student();

        $this->actingAs($student)
            ->getJson('/api/v1/student/programmes')
            ->assertOk()
            ->assertJsonPath('data.academicYear', '2026-2027')
            ->assertJsonCount(11, 'data.programmes')
            ->assertJsonPath('data.programmes.0.id', 'bs-information-technology');

        $this->getJson('/api/v1/student/programmes/bs-information-technology')
            ->assertOk()
            ->assertJsonPath('data.code', 'BSIT')
            ->assertJsonPath('data.learningAreas.0', 'Software development')
            ->assertJsonPath(
                'data.learningAreaDescriptions.Software development',
                'Design, build, test, and maintain software applications using programming concepts and development tools.',
            )
            ->assertJsonPath('data.learningAreaTopics.Software development.0', 'Programming fundamentals')
            ->assertJsonPath('data.learningAreaTopics.Software development.1', 'Application testing')
            ->assertJsonPath('data.careerDirections.0', 'Software and application development')
            ->assertJsonPath('data.degreeType', "Bachelor's degree")
            ->assertJsonPath('data.duration.display', '4 years')
            ->assertJsonPath('data.salary.status', 'not_published')
            ->assertJsonPath('data.jobGrowth.status', 'not_published')
            ->assertJsonMissingPath('data.careerTrajectory')
            ->assertJsonPath('data.recommendedStrands.0', 'STEM')
            ->assertJsonPath('data.recommendedStrands.1', 'TVL-ICT')
            ->assertJsonPath(
                'data.strandGuidance',
                'STEM supports mathematics and analytical preparation, while TVL-ICT provides practical exposure to computer systems and digital tools.',
            );
    }

    public function test_programme_catalogue_requires_student_access_and_returns_not_found_for_unknown_records(): void
    {
        $this->getJson('/api/v1/student/programmes')->assertUnauthorized();

        $this->actingAs($this->student())
            ->getJson('/api/v1/student/programmes/not-a-programme')
            ->assertNotFound();
    }

    public function test_student_saved_programmes_are_owned_validated_and_removable(): void
    {
        $student = $this->student();
        $otherStudent = $this->student();

        $this->actingAs($student)
            ->putJson('/api/v1/student/saved-programmes/bs-information-technology')
            ->assertCreated()
            ->assertJsonPath('data.saved', true);

        $this->putJson('/api/v1/student/saved-programmes/not-a-programme')->assertNotFound();

        $this->getJson('/api/v1/student/saved-programmes')
            ->assertOk()
            ->assertExactJson(['data' => ['programmeIds' => ['bs-information-technology']]]);

        $this->actingAs($otherStudent)
            ->getJson('/api/v1/student/saved-programmes')
            ->assertOk()
            ->assertExactJson(['data' => ['programmeIds' => []]]);

        $this->actingAs($student)
            ->deleteJson('/api/v1/student/saved-programmes/bs-information-technology')
            ->assertOk()
            ->assertJsonPath('data.saved', false);

        $this->getJson('/api/v1/student/saved-programmes')
            ->assertOk()
            ->assertExactJson(['data' => ['programmeIds' => []]]);
    }

    public function test_student_can_only_read_their_own_guidance_appointments(): void
    {
        $student = $this->student();
        $otherStudent = $this->student();
        $adminRole = Role::query()->firstOrCreate(
            ['slug' => RoleSlug::Admin->value],
            ['name' => 'Guidance/Psychometrician/Admin'],
        );
        $counselor = User::factory()->create(['account_status' => 'active']);
        $counselor->roles()->attach($adminRole);

        GuidanceAppointment::query()->create([
            'student_id' => $student->getKey(),
            'counselor_id' => $counselor->getKey(),
            'created_by' => $counselor->getKey(),
            'scheduled_at' => now()->addDay(),
            'topic' => 'Review programme matches',
            'programme_code' => 'BSIT',
            'status' => 'scheduled',
        ]);
        GuidanceAppointment::query()->create([
            'student_id' => $otherStudent->getKey(),
            'counselor_id' => $counselor->getKey(),
            'created_by' => $counselor->getKey(),
            'scheduled_at' => now()->addDays(2),
            'topic' => 'Private appointment',
            'status' => 'scheduled',
        ]);

        $this->actingAs($student)
            ->getJson('/api/v1/student/guidance-appointments')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.counselorName', $counselor->name)
            ->assertJsonPath('data.0.topic', 'Review programme matches')
            ->assertJsonPath('data.0.programmeCode', 'BSIT')
            ->assertJsonMissing(['Private appointment']);
    }

    public function test_configured_temporary_catalogue_produces_visible_recommendations(): void
    {
        $role = Role::query()->firstOrCreate(
            ['slug' => RoleSlug::Student->value],
            ['name' => 'Student Applicant'],
        );
        $student = User::factory()->create();
        $student->roles()->attach($role);
        AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
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

        $this->actingAs($student)
            ->getJson('/api/v1/student/recommendations/latest')
            ->assertOk()
            ->assertJsonPath('data.status', 'available')
            ->assertJsonPath('data.recommendation.status', 'Proposed methodology')
            ->assertJsonPath('data.recommendation.totalEligible', 11)
            ->assertJsonPath('data.recommendation.canViewAll', true)
            ->assertJsonPath('data.recommendation.guidanceContentStatus', 'proposed')
            ->assertJsonPath('data.recommendation.courses.0.contentStatus', 'proposed')
            ->assertJsonPath('data.recommendation.courses.0.degreeType', "Bachelor's degree")
            ->assertJsonPath('data.recommendation.courses.0.salary.status', 'not_published')
            ->assertJsonPath('data.recommendation.courses.0.jobGrowth.status', 'not_published')
            ->assertJsonMissingPath('data.recommendation.courses.0.careerTrajectory')
            ->assertJsonCount(3, 'data.recommendation.courses.0.careerDirections')
            ->assertJsonCount(3, 'data.recommendation.courses');

        $this->assertDatabaseCount('recommendation_runs', 1);
        $this->assertSame($student->getKey(), RecommendationRun::query()->firstOrFail()->user_id);
    }

    public function test_temporary_engine_returns_top_three_and_can_return_all_ranked_programmes(): void
    {
        $role = Role::query()->firstOrCreate(
            ['slug' => RoleSlug::Student->value],
            ['name' => 'Student Applicant'],
        );
        $student = User::factory()->create();
        $student->roles()->attach($role);
        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'status' => 'result_available',
            'answers' => array_combine(range(1, 30), array_fill(0, 30, 3)),
            'current_question' => 30,
            'result_payload' => ['result' => [
                ['area' => 'Realistic', 'score' => 5],
                ['area' => 'Investigative', 'score' => 25],
                ['area' => 'Artistic', 'score' => 15],
                ['area' => 'Social', 'score' => 10],
                ['area' => 'Enterprising', 'score' => 20],
                ['area' => 'Conventional', 'score' => 15],
            ]],
            'started_at' => now()->subHour(),
            'submitted_at' => now()->subMinute(),
            'result_available_at' => now(),
        ]);

        $repository = $this->mock(TccProgrammeCatalogueRepository::class);
        $repository->shouldReceive('current')->twice()->andReturn($this->temporaryCatalogue());

        $this->actingAs($student)
            ->getJson('/api/v1/student/recommendations/latest')
            ->assertOk()
            ->assertJsonPath('data.status', 'available')
            ->assertJsonPath('data.recommendation.assessmentResultReference', 'ASMT-'.str_pad((string) $session->getKey(), 6, '0', STR_PAD_LEFT))
            ->assertJsonPath('data.recommendation.profile.topCode', 'I-E')
            ->assertJsonPath('data.recommendation.profile.dimensions.1.label', 'Investigative')
            ->assertJsonPath('data.recommendation.profile.dimensions.1.value', 25)
            ->assertJsonPath('data.recommendation.totalEligible', 4)
            ->assertJsonPath('data.recommendation.canViewAll', true)
            ->assertJsonCount(3, 'data.recommendation.courses')
            ->assertJsonPath('data.recommendation.courses.0.name', 'Alpha Programme')
            ->assertJsonPath('data.recommendation.courses.0.match', 75);

        $this->getJson('/api/v1/student/recommendations/latest?view=all')
            ->assertOk()
            ->assertJsonPath('data.recommendation.showingAll', true)
            ->assertJsonCount(4, 'data.recommendation.courses');

        $this->assertDatabaseCount('recommendation_runs', 1);
    }

    public function test_latest_recommendation_preserves_the_newest_completed_result_during_a_retake(): void
    {
        $student = $this->student();
        $completed = $this->completedAssessment($student, 1, false);
        AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'previous_session_id' => $completed->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'attempt_number' => 2,
            'is_current' => true,
            'status' => 'in_progress',
            'answers' => [],
            'current_question' => 1,
            'started_at' => now(),
        ]);

        $this->actingAs($student)
            ->getJson('/api/v1/student/recommendations/latest')
            ->assertOk()
            ->assertJsonPath('data.status', 'available')
            ->assertJsonPath('data.recommendation.assessmentResultReference', 'ASMT-'.str_pad((string) $completed->getKey(), 6, '0', STR_PAD_LEFT));
    }

    public function test_existing_recommendation_run_is_hydrated_from_the_current_programme_catalogue(): void
    {
        $student = $this->student();
        $completed = $this->completedAssessment($student, 1, true);
        RecommendationRun::query()->create([
            'user_id' => $student->getKey(),
            'assessment_session_id' => $completed->getKey(),
            'catalogue_reference' => 'TCC-AY-2026-2027-V1',
            'rule_reference' => 'PROPOSED-RIASEC-1',
            'methodology_status' => 'Proposed methodology',
            'default_count' => 3,
            'total_eligible' => 1,
            'ranked_courses' => [[
                'id' => 'bs-business-administration',
                'rank' => 1,
                'code' => 'BSBA',
                'name' => 'BS Business Administration',
                'match' => 75,
                'interestAreas' => ['E', 'C'],
                'learningAreas' => [],
                'careerDirections' => [],
            ]],
            'generated_at' => now()->subDay(),
        ]);

        $this->actingAs($student)
            ->getJson('/api/v1/student/recommendations/latest')
            ->assertOk()
            ->assertJsonPath('data.recommendation.courses.0.degreeType', "Bachelor's degree")
            ->assertJsonPath('data.recommendation.courses.0.duration', '4 years')
            ->assertJsonPath('data.recommendation.courses.0.learningAreaDescriptions.Management', 'Develop skills in planning, organising, leading teams, and evaluating organisational performance.')
            ->assertJsonPath('data.recommendation.courses.0.careerDirections.0', 'Business and operations administration');
    }

    public function test_student_can_read_recommendations_for_an_owned_historical_attempt_only(): void
    {
        $student = $this->student();
        $otherStudent = $this->student();
        $completed = $this->completedAssessment($student, 1, false);

        $this->actingAs($student)
            ->getJson("/api/v1/student/recommendations/attempts/{$completed->getKey()}")
            ->assertOk()
            ->assertJsonPath('data.status', 'available')
            ->assertJsonCount(3, 'data.recommendation.courses');

        $this->actingAs($otherStudent)
            ->getJson("/api/v1/student/recommendations/attempts/{$completed->getKey()}")
            ->assertNotFound();
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

    private function completedAssessment(User $student, int $attemptNumber, bool $isCurrent): AssessmentSession
    {
        return AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'attempt_number' => $attemptNumber,
            'is_current' => $isCurrent,
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
            'started_at' => now()->subDays(31),
            'submitted_at' => now()->subDays(30),
            'result_available_at' => now()->subDays(30),
            'retake_available_at' => now(),
        ]);
    }

    /** @return array<string, mixed> */
    private function temporaryCatalogue(): array
    {
        return [
            'catalogue_version' => 1,
            'academic_year' => '2026-2027',
            'matching_policy' => [
                'method' => 'unweighted_riasec_profile_matching',
                'formula' => ['name' => 'equal_membership_profile_mean'],
                'normalization' => ['instrument_min' => 5, 'instrument_max' => 25],
                'display' => ['default_count' => 3, 'allow_view_all' => true],
            ],
            'programmes' => [
                ['id' => 'zulu', 'short_label' => 'Z', 'display_name' => 'Zulu Programme', 'riasec_profile' => ['I', 'A']],
                ['id' => 'alpha', 'short_label' => 'A', 'display_name' => 'Alpha Programme', 'riasec_profile' => ['I', 'C']],
                ['id' => 'social', 'short_label' => 'S', 'display_name' => 'Social Programme', 'riasec_profile' => ['S']],
                ['id' => 'enterprise', 'short_label' => 'E', 'display_name' => 'Enterprise Programme', 'riasec_profile' => ['E']],
            ],
        ];
    }
}
