<?php

namespace Tests\Feature\Admin;

use App\Models\AdminAuditEvent;
use App\Models\AssessmentSession;
use App\Models\EntranceExaminationResult;
use App\Models\RecommendationRun;
use App\Models\Role;
use App\Models\RoleSlug;
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
        StudentSavedProgramme::query()->create(['user_id' => $student->getKey(), 'programme_id' => 'bs-information-technology']);

        $this->actingAs($admin)->getJson('/api/v1/admin/overview')
            ->assertOk()
            ->assertJsonPath('data.students', 1)
            ->assertJsonPath('data.completed', 1)
            ->assertJsonPath('data.funnel.entranceDeclared', 1)
            ->assertJsonCount(3, 'data.operationalAttention');

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
            ->assertJsonMissingPath('data.guidanceCase');

        $this->getJson('/api/v1/admin/programmes')
            ->assertOk()
            ->assertJsonPath('data.programmes.0.eligibilityGroup', 'non_board')
            ->assertJsonPath('data.programmes.0.monitoring.savedByStudents', 1)
            ->assertJsonCount(1, 'data.programmes.0.monitoring');

        $this->getJson('/api/v1/admin/reports')
            ->assertOk()
            ->assertJsonPath('data.scope', 'institution')
            ->assertJsonPath('data.completedAssessments', 1)
            ->assertJsonPath('data.entranceDeclarations', 1)
            ->assertJsonPath('data.eligibilityDistribution.board', 1)
            ->assertJsonPath('data.recommendationsByEligibility.board', 1)
            ->assertJsonPath('data.programmeSavesByEligibility.board', 1)
            ->assertJsonStructure(['data' => ['assessmentFunnel', 'catalogueGovernance']]);
    }

    public function test_admin_can_export_aggregate_reports_without_student_details(): void
    {
        $admin = $this->userWithRole(RoleSlug::Admin);
        $student = $this->userWithRole(RoleSlug::Student);
        $this->createRecommendation($student, $this->completedSession($student));

        $export = $this->actingAs($admin)->get('/api/v1/admin/reports/export')->assertOk()->streamedContent();
        $this->assertStringContainsString('aggregate system report', $export);
        $this->assertStringNotContainsString($student->email, $export);
    }

    public function test_student_and_guest_cannot_access_admin_data(): void
    {
        $admin = $this->userWithRole(RoleSlug::Admin);
        $student = $this->userWithRole(RoleSlug::Student);

        $this->getJson('/api/v1/admin/overview')->assertUnauthorized();
        $this->actingAs($student)->getJson('/api/v1/admin/overview')->assertForbidden();
        $this->actingAs($admin)->getJson("/api/v1/admin/students/{$admin->getKey()}")->assertNotFound();
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

    private function completedSession(User $student): AssessmentSession
    {
        $entrance = EntranceExaminationResult::query()->create([
            'user_id' => $student->getKey(),
            'score' => 2.5,
            'eligibility_group' => 'board',
            'rule_reference' => 'SELF-DECLARED-TCC-ENTRANCE-2026-01',
            'declared_at' => now()->subHours(2),
        ]);

        return AssessmentSession::query()->create([
            'user_id' => $student->getKey(), 'entrance_examination_result_id' => $entrance->getKey(), 'instrument_code' => 'tcc-riasec-42-v1',
            'attempt_number' => 1, 'status' => 'result_available', 'is_current' => true,
            'answers' => array_combine(range(1, 30), array_fill(0, 30, 3)), 'current_question' => 30,
            'result_payload' => ['result' => [
                ['area' => 'Realistic', 'score' => 12], ['area' => 'Investigative', 'score' => 22],
                ['area' => 'Artistic', 'score' => 16], ['area' => 'Social', 'score' => 20],
                ['area' => 'Enterprising', 'score' => 14], ['area' => 'Conventional', 'score' => 18],
            ]],
            'started_at' => now()->subHour(), 'submitted_at' => now()->subMinute(), 'result_available_at' => now(),
        ]);
    }

    private function createRecommendation(User $student, AssessmentSession $session): void
    {
        RecommendationRun::query()->create([
            'user_id' => $student->getKey(), 'assessment_session_id' => $session->getKey(),
            'catalogue_reference' => 'TCC-AY-2026-2027-V1', 'rule_reference' => 'PROPOSED-RIASEC-1',
            'entrance_examination_snapshot' => ['score' => 2.5, 'eligibilityGroup' => 'board', 'ruleReference' => 'SELF-DECLARED-TCC-ENTRANCE-2026-01'],
            'methodology_status' => 'Proposed methodology', 'default_count' => 3, 'total_eligible' => 1,
            'ranked_courses' => [[
                'id' => 'bs-information-technology', 'rank' => 1, 'code' => 'BSIT',
                'name' => 'BS Information Technology', 'match' => 90,
            ]],
            'generated_at' => now(),
        ]);
    }
}
