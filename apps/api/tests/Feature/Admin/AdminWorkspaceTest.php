<?php

namespace Tests\Feature\Admin;

use App\Models\AdminAuditEvent;
use App\Models\AssessmentSession;
use App\Models\ConfigurationVersion;
use App\Models\GuidanceCase;
use App\Models\GuidanceRequest;
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

    public function test_admin_can_read_the_guidance_workspace_from_real_records(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();
        $session = $this->completedSession($student);
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
                'match' => 90,
            ]],
            'generated_at' => now(),
        ]);
        ConfigurationVersion::query()->create([
            'kind' => 'catalogue',
            'version' => 2,
            'status' => 'draft',
            'academic_year' => '2026-2027',
            'payload' => ['programmes' => []],
            'created_by' => $admin->getKey(),
        ]);
        $suspendedCounselor = User::factory()->create(['account_status' => 'suspended']);
        $suspendedCounselor->roles()->attach($this->counselorRole());

        $overview = $this->actingAs($admin)->getJson('/api/v1/admin/overview')
            ->assertOk()
            ->assertJsonPath('data.students', 1)
            ->assertJsonPath('data.completed', 1)
            ->assertJsonPath('data.recommendations', 1)
            ->assertJsonPath('data.operationalAttention.processingFailures', 0)
            ->assertJsonPath('data.operationalAttention.unpublishedDrafts', 1)
            ->assertJsonPath('data.operationalAttention.suspendedCounselors', 1);
        $this->assertGreaterThan(0, $overview->json('data.operationalAttention.unverifiedSources'));

        $this->actingAs($admin)->getJson('/api/v1/admin/students')
            ->assertOk()
            ->assertJsonPath('data.0.name', $student->name)
            ->assertJsonPath('data.0.latestTopCode', 'I-C');

        $this->actingAs($admin)->getJson("/api/v1/admin/students/{$student->getKey()}")
            ->assertOk()
            ->assertJsonPath('data.attempts.0.status', 'result_available')
            ->assertJsonPath('data.attempts.0.recommendations.0.code', 'BSIT');
    }

    public function test_admin_can_read_legacy_title_based_riasec_results(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();
        $session = $this->completedSession($student);
        $session->update(['result_payload' => ['result' => [
            ['code' => 'realistic', 'title' => 'Realistic', 'score' => 10],
            ['code' => 'investigative', 'title' => 'Investigative', 'score' => 16],
            ['code' => 'artistic', 'title' => 'Artistic', 'score' => 12],
            ['code' => 'social', 'title' => 'Social', 'score' => 15],
            ['code' => 'enterprising', 'title' => 'Enterprising', 'score' => 13],
            ['code' => 'conventional', 'title' => 'Conventional', 'score' => 14],
        ]]]);

        $this->actingAs($admin)->getJson('/api/v1/admin/assessments')
            ->assertOk()
            ->assertJsonPath('data.0.topCode', 'I-S');

        $this->actingAs($admin)->getJson("/api/v1/admin/students/{$student->getKey()}")
            ->assertOk()
            ->assertJsonPath('data.attempts.0.dimensions.0.label', 'Realistic')
            ->assertJsonPath('data.attempts.0.dimensions.1.label', 'Investigative')
            ->assertJsonPath('data.attempts.0.topCode', 'I-S');
    }

    public function test_counselor_student_record_access_is_audited_without_logging_student_identity(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();
        $counselor = User::factory()->create(['account_status' => 'active']);
        $counselor->roles()->attach($this->counselorRole());

        $this->actingAs($counselor)
            ->getJson("/api/v1/counselor/students/{$student->getKey()}")
            ->assertOk();

        $this->assertDatabaseHas('admin_audit_events', [
            'actor_id' => $counselor->getKey(),
            'action' => 'counselor.student_record.viewed',
            'subject_type' => 'student',
            'subject_reference' => (string) $student->getKey(),
        ]);
        $event = AdminAuditEvent::query()->where('action', 'counselor.student_record.viewed')->firstOrFail();
        $this->assertSame(['portal' => 'counselor'], $event->metadata);

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/activity')
            ->assertOk()
            ->assertJsonFragment([
                'actor' => $counselor->name,
                'action' => 'counselor.student_record.viewed',
                'subjectType' => 'student',
                'subjectReference' => (string) $student->getKey(),
            ]);

        $this->getJson("/api/v1/admin/students/{$student->getKey()}")->assertOk();
        $this->assertSame(1, AdminAuditEvent::query()->where('action', 'counselor.student_record.viewed')->count());
    }

    public function test_admin_can_review_programme_monitoring_and_aggregate_reports(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();
        $session = $this->completedSession($student);
        StudentSavedProgramme::query()->create(['user_id' => $student->getKey(), 'programme_id' => 'bs-information-technology']);
        RecommendationRun::query()->create([
            'user_id' => $student->getKey(), 'assessment_session_id' => $session->getKey(),
            'catalogue_reference' => 'TCC-AY-2026-2027-V1', 'rule_reference' => 'PROPOSED-RIASEC-1',
            'methodology_status' => 'Proposed methodology', 'default_count' => 3, 'total_eligible' => 1,
            'ranked_courses' => [['id' => 'bs-information-technology', 'rank' => 1, 'code' => 'BSIT', 'name' => 'BS Information Technology', 'match' => 90]],
            'generated_at' => now(),
        ]);

        $this->actingAs($admin)->getJson('/api/v1/admin/programmes')
            ->assertOk()
            ->assertJsonPath('data.academicYear', '2026-2027')
            ->assertJsonCount(11, 'data.programmes')
            ->assertJsonPath('data.programmes.0.degreeType', "Bachelor's degree")
            ->assertJsonPath('data.programmes.0.duration.status', 'ched_psg')
            ->assertJsonPath('data.programmes.0.monitoring.savedByStudents', 1)
            ->assertJsonMissingPath('data.programmes.0.monitoring.recommendationAppearances')
            ->assertJsonMissingPath('data.programmes.0.monitoring.topThreeAppearances');

        $this->actingAs($admin)->getJson('/api/v1/admin/reports')
            ->assertOk()
            ->assertJsonPath('data.studentCount', 1)
            ->assertJsonPath('data.completedAssessments', 1);
    }

    public function test_student_and_unauthenticated_accounts_cannot_access_admin_data(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();

        $this->getJson('/api/v1/admin/overview')->assertUnauthorized();
        $this->actingAs($student)->getJson('/api/v1/admin/overview')->assertForbidden();
        $this->actingAs($admin)->getJson("/api/v1/admin/students/{$admin->getKey()}")->assertNotFound();
    }

    public function test_assessment_monitoring_returns_only_the_latest_record_per_student(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();
        $this->completedSession($student)->update(['is_current' => false]);
        AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'attempt_number' => 2,
            'status' => 'in_progress',
            'is_current' => true,
            'answers' => [],
            'current_question' => 1,
            'started_at' => now(),
        ]);

        $this->actingAs($admin)->getJson('/api/v1/admin/assessments')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.attemptNumber', 2)
            ->assertJsonPath('data.0.attemptCount', 2);
    }

    public function test_admin_only_monitors_while_counselor_owns_guidance_progress(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();
        $otherStaff = User::factory()->create(['name' => 'Second Counselor']);
        $otherStaff->roles()->attach($this->counselorRole());
        $unassignedStaff = User::factory()->create(['name' => 'Unassigned Counselor']);
        $unassignedStaff->roles()->attach($this->counselorRole());

        $this->actingAs($admin)->putJson("/api/v1/admin/students/{$student->getKey()}/guidance-case", [])->assertNotFound();

        $this->actingAs($admin)->postJson("/api/v1/admin/students/{$student->getKey()}/guidance-notes", [
            'body' => 'Discuss the top programme matches during the next guidance conversation.',
        ])->assertNotFound();

        $this->actingAs($otherStaff)->putJson("/api/v1/counselor/students/{$student->getKey()}/guidance-case", [
            'status' => 'follow_up',
            'followUpOn' => '2026-08-20',
        ])->assertOk()
            ->assertJsonPath('data.status', 'follow_up');

        $this->actingAs($unassignedStaff)->postJson("/api/v1/counselor/students/{$student->getKey()}/guidance-notes", [
            'body' => 'This counselor does not own the case.',
        ])->assertForbidden();

        $this->actingAs($otherStaff)->postJson("/api/v1/counselor/students/{$student->getKey()}/guidance-notes", [
            'body' => 'Discuss the top programme matches during the next guidance conversation.',
        ])->assertCreated()
            ->assertJsonPath('data.author', $otherStaff->name);

        $this->actingAs($admin)->getJson("/api/v1/admin/students/{$student->getKey()}")
            ->assertOk()
            ->assertJsonPath('data.guidanceCase.status', 'follow_up')
            ->assertJsonPath('data.guidanceCase.notes.0.author', $otherStaff->name);

        $this->actingAs($admin)->getJson('/api/v1/admin/counselors')
            ->assertOk()
            ->assertJsonFragment([
                'name' => 'Second Counselor',
                'activeCaseCount' => 1,
                'followUpCount' => 1,
            ])
            ->assertJsonFragment([
                'studentId' => $student->getKey(),
                'status' => 'follow_up',
            ]);

        $this->assertDatabaseCount('guidance_notes', 1);
        $this->assertSame(2, AdminAuditEvent::query()->count());
        $this->assertSame('2026-08-20', GuidanceCase::query()->firstOrFail()->follow_up_on?->toDateString());
    }

    public function test_admin_can_create_update_and_publish_versioned_configuration(): void
    {
        [$admin] = $this->createAdminAndStudent();

        $draft = $this->actingAs($admin)->postJson('/api/v1/admin/configurations/methodology')
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->json('data');
        $draft['payload']['display']['default_count'] = 4;

        $this->actingAs($admin)->putJson("/api/v1/admin/configurations/versions/{$draft['id']}", [
            'payload' => $draft['payload'],
        ])->assertOk()
            ->assertJsonPath('data.payload.display.default_count', 4);

        $this->actingAs($admin)->postJson("/api/v1/admin/configurations/versions/{$draft['id']}/publish")
            ->assertOk()
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.publishedBy', $admin->name);

        $this->actingAs($admin)->postJson('/api/v1/admin/configurations/methodology', [
            'sourceVersionId' => $draft['id'],
        ])->assertCreated()
            ->assertJsonPath('data.version', 2)
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.payload.display.default_count', 4);

        $this->assertDatabaseHas('configuration_versions', ['kind' => 'methodology', 'version' => 1, 'status' => 'published']);
        $this->assertDatabaseHas('configuration_versions', ['kind' => 'methodology', 'version' => 2, 'status' => 'draft']);
        $this->assertSame(4, AdminAuditEvent::query()->count());
        $this->assertSame(4, ConfigurationVersion::query()->firstOrFail()->payload['display']['default_count']);
    }

    public function test_starting_configuration_editing_resumes_the_existing_draft_without_conflict(): void
    {
        [$admin] = $this->createAdminAndStudent();

        $first = $this->actingAs($admin)
            ->postJson('/api/v1/admin/configurations/catalogue')
            ->assertCreated()
            ->json('data');

        $this->actingAs($admin)
            ->postJson('/api/v1/admin/configurations/catalogue')
            ->assertOk()
            ->assertJsonPath('data.id', $first['id'])
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('message', 'The existing draft is ready to continue editing.');

        $this->assertDatabaseCount('configuration_versions', 1);
    }

    public function test_counselor_accepts_and_resolves_an_owned_guidance_concern(): void
    {
        [, $student] = $this->createAdminAndStudent();
        $counselor = User::factory()->create(['name' => 'Guidance Counselor']);
        $otherCounselor = User::factory()->create(['name' => 'Other Counselor']);
        $counselor->roles()->attach($this->counselorRole());
        $otherCounselor->roles()->attach($this->counselorRole());

        $guidanceRequest = $this->actingAs($student)->postJson('/api/v1/student/guidance-requests', [
            'concernCategory' => 'programme_comparison',
            'preferredFormat' => 'in_person',
            'message' => 'I need help comparing my matched programmes.',
        ])->assertCreated()->json('data');

        $this->actingAs($counselor)
            ->postJson("/api/v1/counselor/guidance-requests/{$guidanceRequest['id']}/accept")
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted')
            ->assertJsonPath('data.acceptedBy', 'Guidance Counselor');

        $this->actingAs($otherCounselor)
            ->postJson("/api/v1/counselor/guidance-requests/{$guidanceRequest['id']}/resolve", ['summary' => 'Unauthorized resolution.'])
            ->assertConflict();

        $this->actingAs($counselor)
            ->postJson("/api/v1/counselor/guidance-requests/{$guidanceRequest['id']}/resolve", ['summary' => 'Reviewed programme evidence and recorded the agreed next steps.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'closed')
            ->assertJsonPath('data.resolutionReason', 'Reviewed programme evidence and recorded the agreed next steps.');

        $this->assertDatabaseHas('guidance_request_events', [
            'guidance_request_id' => $guidanceRequest['id'],
            'event_type' => 'resolved',
            'to_status' => 'closed',
        ]);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'guidance_request.accepted']);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'guidance_request.resolved']);
    }

    public function test_counselor_decline_and_student_cancellation_retain_request_history(): void
    {
        [, $student] = $this->createAdminAndStudent();
        $otherStudent = User::factory()->create();
        $otherStudent->roles()->attach(Role::query()->where('slug', RoleSlug::Student->value)->firstOrFail());
        $counselor = User::factory()->create(['name' => 'Request Counselor']);
        $counselor->roles()->attach($this->counselorRole());

        $declined = $this->actingAs($student)->postJson('/api/v1/student/guidance-requests', [
            'concernCategory' => 'career_direction',
            'preferredFormat' => 'phone',
            'message' => 'I would like to discuss possible career directions.',
        ])->assertCreated()->json('data');

        $this->actingAs($counselor)
            ->postJson("/api/v1/counselor/guidance-requests/{$declined['id']}/decline", [
                'reason' => 'Please submit a new request after adding a reachable phone number.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'declined')
            ->assertJsonPath('data.resolutionReason', 'Please submit a new request after adding a reachable phone number.');

        $this->actingAs($counselor)
            ->postJson("/api/v1/counselor/guidance-requests/{$declined['id']}/decline", [
                'reason' => 'Duplicate action should not be accepted.',
            ])
            ->assertConflict();

        $cancelled = $this->actingAs($student)->postJson('/api/v1/student/guidance-requests', [
            'concernCategory' => 'general_guidance',
            'preferredFormat' => 'in_person',
            'message' => 'I would like general course guidance.',
        ])->assertCreated()->json('data');

        $this->actingAs($otherStudent)
            ->postJson("/api/v1/student/guidance-requests/{$cancelled['id']}/cancel", [
                'reason' => 'This is not my request.',
            ])
            ->assertNotFound();

        $this->actingAs($student)
            ->postJson("/api/v1/student/guidance-requests/{$cancelled['id']}/cancel", [
                'reason' => 'I no longer need counseling for this concern.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.statusHistory.1.eventType', 'cancelled');

        $this->assertDatabaseHas('guidance_request_events', [
            'guidance_request_id' => $cancelled['id'],
            'actor_id' => $student->getKey(),
            'event_type' => 'cancelled',
            'to_status' => 'cancelled',
        ]);
    }

    public function test_admin_and_counselor_can_export_aggregate_reports_without_student_details(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();
        $counselor = User::factory()->create();
        $counselor->roles()->attach($this->counselorRole());
        $session = $this->completedSession($student);
        RecommendationRun::query()->create([
            'user_id' => $student->getKey(), 'assessment_session_id' => $session->getKey(),
            'catalogue_reference' => 'TCC-AY-2026-2027-V1', 'rule_reference' => 'PROPOSED-RIASEC-1',
            'methodology_status' => 'Proposed methodology', 'default_count' => 3, 'total_eligible' => 1,
            'ranked_courses' => [['id' => 'bsit', 'rank' => 1, 'code' => 'BSIT', 'name' => 'BS Information Technology', 'match' => 90]],
            'generated_at' => now(),
        ]);
        StudentSavedProgramme::query()->create(['user_id' => $student->getKey(), 'programme_id' => 'bs-information-technology']);
        GuidanceCase::query()->create([
            'student_id' => $student->getKey(),
            'assigned_to_id' => $counselor->getKey(),
            'status' => 'follow_up',
            'follow_up_on' => today()->subDay(),
        ]);
        GuidanceRequest::query()->create([
            'student_id' => $student->getKey(),
            'concern_category' => 'general_guidance',
            'message' => 'Please help me review my options.',
            'preferred_format' => 'in_person',
            'status' => 'accepted',
            'accepted_by' => $counselor->getKey(),
            'accepted_at' => now(),
            'created_at' => now()->subHour(),
        ]);

        $this->actingAs($admin)->getJson('/api/v1/admin/reports')
            ->assertOk()
            ->assertJsonPath('data.completedAssessments', 1)
            ->assertJsonPath('data.assessmentCompletionRate', 100)
            ->assertJsonPath('data.programmeSaves', 1)
            ->assertJsonPath('data.guidanceRequestStatuses.accepted', 1)
            ->assertJsonPath('data.openFollowUps', 1)
            ->assertJsonPath('data.overdueFollowUps', 1)
            ->assertJsonCount(1, 'data.assessmentCompletionsByMonth')
            ->assertJsonMissingPath('data.topMatchFrequency');

        $response = $this->actingAs($admin)->get('/api/v1/admin/reports/export');
        $response->assertOk()->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $export = $response->streamedContent();
        $this->assertStringNotContainsString($student->email, $export);
        $this->assertStringContainsString('Guidance request lifecycle', $export);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'report.exported']);

        $this->actingAs($counselor)->getJson('/api/v1/counselor/reports')
            ->assertOk()
            ->assertJsonPath('data.scope', 'counselor')
            ->assertJsonPath('data.studentCount', 1)
            ->assertJsonPath('data.guidanceRequestStatuses.accepted', 1);

        $counselorExport = $this->actingAs($counselor)->get('/api/v1/counselor/reports/export');
        $counselorExport->assertOk();
        $this->assertStringNotContainsString($student->email, $counselorExport->streamedContent());
    }

    public function test_assessment_completion_rate_uses_the_same_started_student_cohort_for_its_numerator_and_denominator(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();
        $completedBeforePeriod = $this->completedSession($student);
        $completedBeforePeriod->update([
            'started_at' => today()->subDay()->addHours(9),
            'result_available_at' => today()->addHours(9),
        ]);

        $secondStudent = User::factory()->create();
        $secondStudent->roles()->attach(Role::query()->where('slug', RoleSlug::Student->value)->firstOrFail());
        AssessmentSession::query()->create([
            'user_id' => $secondStudent->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'attempt_number' => 1,
            'status' => 'in_progress',
            'is_current' => true,
            'answers' => [],
            'current_question' => 1,
            'started_at' => today()->addHours(10),
        ]);

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/reports?from='.today()->toDateString().'&to='.today()->toDateString())
            ->assertOk()
            ->assertJsonPath('data.assessmentActivity', 1)
            ->assertJsonPath('data.completedAssessments', 0)
            ->assertJsonPath('data.assessmentCompletionRate', 0)
            ->assertJsonPath('data.assessmentCompletionsByMonth.0.count', 1);
    }

    public function test_counselor_can_load_every_read_only_dashboard_resource(): void
    {
        $counselor = User::factory()->create(['account_status' => 'active']);
        $counselor->roles()->attach($this->counselorRole());

        foreach (['overview', 'students', 'counselors', 'guidance-requests', 'reports'] as $resource) {
            $this->actingAs($counselor)
                ->getJson("/api/v1/counselor/{$resource}")
                ->assertOk()
                ->assertJsonStructure(['data']);
        }
    }

    /** @return array{User, User} */
    private function createAdminAndStudent(): array
    {
        $adminRole = Role::query()->create(['slug' => RoleSlug::Admin->value, 'name' => 'Admin']);
        $studentRole = Role::query()->create(['slug' => RoleSlug::Student->value, 'name' => 'Student']);
        $admin = User::factory()->create();
        $student = User::factory()->create();
        $admin->roles()->attach($adminRole);
        $student->roles()->attach($studentRole);

        return [$admin, $student];
    }

    private function completedSession(User $student): AssessmentSession
    {
        return AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'attempt_number' => 1,
            'status' => 'result_available',
            'is_current' => true,
            'answers' => ['1' => 5],
            'current_question' => 30,
            'result_payload' => ['result' => [
                ['area' => 'Realistic', 'score' => 14],
                ['area' => 'Investigative', 'score' => 23],
                ['area' => 'Artistic', 'score' => 15],
                ['area' => 'Social', 'score' => 18],
                ['area' => 'Enterprising', 'score' => 17],
                ['area' => 'Conventional', 'score' => 21],
            ]],
            'started_at' => now()->subMinutes(20),
            'submitted_at' => now(),
            'result_available_at' => now(),
        ]);
    }

    private function counselorRole(): Role
    {
        return Role::query()->updateOrCreate(
            ['slug' => RoleSlug::Counselor->value],
            ['name' => 'Counselor'],
        );
    }
}
