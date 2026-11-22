<?php

namespace Tests\Feature\Admin;

use App\Models\AdminAuditEvent;
use App\Models\AssessmentSession;
use App\Models\EntranceExaminationResult;
use App\Models\RecommendationFeedback;
use App\Models\RecommendationRun;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\StudentProfile;
use App\Models\StudentSavedProgramme;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_workspace_uses_only_system_and_student_records(): void
    {
        $admin = $this->userWithRole(RoleSlug::Admin);
        $student = $this->userWithRole(RoleSlug::Student);
        $session = $this->completedSession($student);
        $this->createRecommendation($student, $session);
        StudentProfile::query()->create([
            'user_id' => $student->getKey(),
            'id_number' => '12345678',
            'id_number_lookup_hash' => hash('sha256', '12345678'),
            'birth_date' => now()->subYears(18)->format('Y-m-d'),
            'phone' => '+63 917 842 1928',
            'municipality' => 'Tagoloan',
            'province' => 'Misamis Oriental',
        ]);
        StudentSavedProgramme::query()->create(['user_id' => $student->getKey(), 'programme_id' => 'bs-information-technology']);

        $this->actingAs($admin)->getJson('/api/v1/admin/overview')
            ->assertOk()
            ->assertJsonPath('data.students', 1)
            ->assertJsonPath('data.completed', 1)
            ->assertJsonPath('data.funnel.entranceDeclared', 1)
            ->assertJsonPath('data.eligibilityDistribution.board', 1)
            ->assertJsonCount(1, 'data.operationalAttention');

        $this->getJson('/api/v1/admin/students?search=ASMT-000001&status=result_available&eligibility=board')
            ->assertOk()
            ->assertJsonPath('data.items.0.selfDeclaredScore', 2.5)
            ->assertJsonPath('data.items.0.eligibilityGroup', 'board')
            ->assertJsonPath('data.items.0.recommendationAvailable', true)
            ->assertJsonPath('data.items.0.savedProgrammeCount', 1)
            ->assertJsonPath('data.pagination.total', 1);

        $this->getJson("/api/v1/admin/students/{$student->getKey()}")
            ->assertOk()
            ->assertJsonPath('data.attempts.0.entranceExamination.ruleReference', 'SELF-DECLARED-TCC-ENTRANCE-2026-01')
            ->assertJsonPath('data.attempts.0.recommendationSnapshot.catalogueReference', 'TCC-AY-2026-2027-V1')
            ->assertJsonPath('data.attempts.0.recommendations.0.code', 'BSIT')
            ->assertJsonPath('data.profile.idNumber', '12345678')
            ->assertJsonMissingPath('data.profile.shsStrand')
            ->assertJsonMissingPath('data.profile.shsGwa');

        $this->getJson('/api/v1/admin/programmes')
            ->assertOk()
            ->assertJsonPath('data.programmes.0.eligibilityGroup', 'non_board')
            ->assertJsonPath('data.programmes.0.monitoring.savedByStudents', 1)
            ->assertJsonCount(1, 'data.programmes.0.monitoring');

        $this->getJson('/api/v1/admin/reports')
            ->assertOk()
            ->assertJsonPath('data.scope', 'institution')
            ->assertJsonPath('data.completedAssessments', 1)
            ->assertJsonPath('data.eligibilityDistribution.board', 1)
            ->assertJsonPath('data.recommendationRuns', 1)
            ->assertJsonPath('data.programmeSaves', 1)
            ->assertJsonMissingPath('data.recommendationFeedback')
            ->assertJsonStructure(['data' => ['assessmentFunnel', 'retakeMetrics']]);
    }

    public function test_student_and_guest_cannot_access_admin_data(): void
    {
        $admin = $this->userWithRole(RoleSlug::Admin);
        $student = $this->userWithRole(RoleSlug::Student);

        $this->getJson('/api/v1/admin/overview')->assertUnauthorized();
        $this->getJson('/api/v1/admin/feedback')->assertUnauthorized();
        $this->actingAs($student)->getJson('/api/v1/admin/overview')->assertForbidden();
        $this->actingAs($student)->getJson('/api/v1/admin/feedback')->assertForbidden();
        $this->actingAs($admin)->getJson("/api/v1/admin/students/{$admin->getKey()}")->assertNotFound();
    }

    public function test_recommendation_feedback_report_publishes_the_latest_comment_without_student_identity(): void
    {
        $admin = $this->userWithRole(RoleSlug::Admin);
        $student = $this->userWithRole(RoleSlug::Student);
        $run = $this->createRecommendation($student, $this->completedSession($student));
        RecommendationFeedback::query()->create([
            'user_id' => $student->getKey(),
            'recommendation_run_id' => $run->getKey(),
            'programme_id' => 'bs-information-technology',
            'rating' => 5,
            'comment' => 'Private Student comment',
        ]);

        RecommendationFeedback::query()
            ->where('user_id', $student->getKey())
            ->update(['updated_at' => now()->subDay()]);
        $latestRun = $this->createRecommendation($student, $this->completedSession($student, 2));
        RecommendationFeedback::query()->create([
            'user_id' => $student->getKey(),
            'recommendation_run_id' => $latestRun->getKey(),
            'programme_id' => 'bs-information-technology',
            'rating' => 1,
            'comment' => 'A newer private response replaces the earlier aggregate input.',
        ]);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/feedback');

        $response
            ->assertOk()
            ->assertJsonPath('data.publishedResponseCount', 1)
            ->assertJsonPath('data.publishedRespondentCount', 1)
            ->assertJsonPath('data.eligibleProgrammeCount', 1)
            ->assertJsonPath('data.programmes.0.programmeId', 'bs-information-technology')
            ->assertJsonPath('data.programmes.0.programmeName', 'BS Information Technology')
            ->assertJsonPath('data.programmes.0.respondentCount', 1)
            ->assertJsonPath('data.programmes.0.averageRating', 1)
            ->assertJsonPath('data.programmes.0.ratingDistribution.1', 1)
            ->assertJsonPath('data.programmes.0.ratingDistribution.5', 0)
            ->assertJsonMissingPath('data.programmes.0.comment')
            ->assertJsonPath('data.commentCount', 1)
            ->assertJsonPath('data.comments.0.programmeId', 'bs-information-technology')
            ->assertJsonPath('data.comments.0.programmeName', 'BS Information Technology')
            ->assertJsonPath('data.comments.0.rating', 1)
            ->assertJsonPath('data.comments.0.comment', 'A newer private response replaces the earlier aggregate input.')
            ->assertJsonPath('data.comments.0.updatedAt', fn (mixed $value): bool => is_string($value) && $value !== '');

        $this->assertStringNotContainsString('Private Student comment', $response->getContent());
        $this->assertStringNotContainsString('user_id', $response->getContent());
    }

    public function test_recommendation_feedback_report_has_a_truthful_empty_state_without_responses(): void
    {
        $admin = $this->userWithRole(RoleSlug::Admin);

        $this->actingAs($admin)->getJson('/api/v1/admin/feedback')
            ->assertOk()
            ->assertJsonPath('data.publishedResponseCount', 0)
            ->assertJsonPath('data.publishedRespondentCount', 0)
            ->assertJsonPath('data.eligibleProgrammeCount', 0)
            ->assertJsonPath('data.commentCount', 0)
            ->assertJsonCount(0, 'data.programmes')
            ->assertJsonCount(0, 'data.comments');
    }

    public function test_activity_is_filterable_and_exposes_only_safe_summary_metadata(): void
    {
        $admin = $this->userWithRole(RoleSlug::Admin);
        AdminAuditEvent::query()->create([
            'actor_id' => $admin->getKey(),
            'action' => 'configuration.draft_updated',
            'subject_type' => 'configuration_version',
            'subject_reference' => 'catalogue-v2',
            'metadata' => ['kind' => 'catalogue', 'version' => 2, 'changedProgrammeCount' => 2, 'secret' => 'not-for-client'],
        ]);

        $this->actingAs($admin)->getJson('/api/v1/admin/activity?action=configuration.draft_updated&subjectType=configuration_version')
            ->assertOk()
            ->assertJsonPath('data.items.0.summary', 'Catalogue version 2 · 2 programme records changed')
            ->assertJsonPath('data.items.0.metadata.changedProgrammeCount', 2)
            ->assertJsonMissingPath('data.items.0.metadata.secret')
            ->assertJsonPath('data.pagination.total', 1);
    }

    private function userWithRole(RoleSlug $slug): User
    {
        $role = Role::query()->firstOrCreate(['slug' => $slug->value], ['name' => $slug->name]);
        $user = User::factory()->create(['account_status' => 'active']);
        $user->roles()->attach($role);

        return $user;
    }

    private function completedSession(User $student, int $attemptNumber = 1): AssessmentSession
    {
        $entrance = EntranceExaminationResult::query()->create([
            'user_id' => $student->getKey(),
            'score' => 2.5,
            'eligibility_group' => 'board',
            'rule_reference' => 'SELF-DECLARED-TCC-ENTRANCE-2026-01',
            'declared_at' => now()->subHours(2),
        ]);

        return AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'entrance_examination_result_id' => $entrance->getKey(),
            'instrument_code' => 'tcc-uhcc-riasec-42-v1',
            'attempt_number' => $attemptNumber,
            'status' => 'result_available',
            'is_current' => true,
            'answers' => array_combine(range(1, 42), array_fill(0, 42, 1)),
            'current_question' => 42,
            'result_payload' => [
                'result' => [
                    ['area' => 'Realistic', 'score' => 4],
                    ['area' => 'Investigative', 'score' => 7],
                    ['area' => 'Artistic', 'score' => 5],
                    ['area' => 'Social', 'score' => 6],
                    ['area' => 'Enterprising', 'score' => 3],
                    ['area' => 'Conventional', 'score' => 5],
                ],
            ],
            'started_at' => now()->subHour(),
            'submitted_at' => now()->subMinute(),
            'result_available_at' => now(),
        ]);
    }

    private function createRecommendation(User $student, AssessmentSession $session): RecommendationRun
    {
        return RecommendationRun::query()->create([
            'user_id' => $student->getKey(),
            'assessment_session_id' => $session->getKey(),
            'catalogue_reference' => 'TCC-AY-2026-2027-V1',
            'rule_reference' => 'PROPOSED-RIASEC-1',
            'entrance_examination_snapshot' => ['score' => 2.5, 'eligibilityGroup' => 'board', 'ruleReference' => 'SELF-DECLARED-TCC-ENTRANCE-2026-01'],
            'methodology_status' => 'Proposed methodology',
            'default_count' => 3,
            'total_eligible' => 1,
            'ranked_courses' => [
                [
                    'id' => 'bs-information-technology',
                    'rank' => 1,
                    'code' => 'BSIT',
                    'name' => 'BS Information Technology',
                    'match' => 90,
                ],
            ],
            'generated_at' => now(),
        ]);
    }
}
