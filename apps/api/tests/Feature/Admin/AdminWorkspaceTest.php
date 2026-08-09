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

        $this->actingAs($admin)->getJson('/api/v1/admin/overview')
            ->assertOk()
            ->assertJsonPath('data.students', 1)
            ->assertJsonPath('data.completed', 1)
            ->assertJsonPath('data.recommendations', 1);

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

    public function test_counselor_can_schedule_and_complete_a_course_guidance_appointment_while_admin_monitors(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();
        $counselor = User::factory()->create(['name' => 'Course Counselor']);
        $counselor->roles()->attach($this->counselorRole());

        $this->actingAs($admin)->postJson('/api/v1/admin/appointments', [])->assertStatus(405);

        $appointment = $this->actingAs($counselor)->postJson('/api/v1/counselor/appointments', [
            'studentId' => $student->getKey(),
            'counselorId' => $counselor->getKey(),
            'scheduledAt' => '2026-08-20T09:00:00+08:00',
            'endsAt' => '2026-08-20T10:00:00+08:00',
            'topic' => 'Review programme matches',
            'programmeCode' => 'BSIT',
            'notes' => 'Discuss the student’s current top three matches.',
        ])->assertCreated()
            ->assertJsonPath('data.studentId', $student->getKey())
            ->assertJsonPath('data.counselorId', $counselor->getKey())
            ->assertJsonPath('data.status', 'scheduled')
            ->json('data');

        $this->actingAs($admin)->getJson('/api/v1/admin/appointments')
            ->assertOk()
            ->assertJsonPath('data.0.topic', 'Review programme matches');

        $this->actingAs($counselor)->putJson("/api/v1/counselor/appointments/{$appointment['id']}", [
            'studentId' => $student->getKey(),
            'counselorId' => $counselor->getKey(),
            'scheduledAt' => '2026-08-20T09:00:00+08:00',
            'endsAt' => '2026-08-20T10:00:00+08:00',
            'topic' => 'Review programme matches',
            'programmeCode' => 'BSIT',
            'notes' => 'Guidance conversation completed.',
            'status' => 'completed',
        ])->assertOk()->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('guidance_appointments', ['id' => $appointment['id'], 'status' => 'completed']);
        $this->assertDatabaseHas('guidance_appointment_events', [
            'guidance_appointment_id' => $appointment['id'],
            'event_type' => 'created',
            'from_status' => null,
            'to_status' => 'scheduled',
        ]);
        $this->assertDatabaseHas('guidance_appointment_events', [
            'guidance_appointment_id' => $appointment['id'],
            'event_type' => 'status_changed',
            'from_status' => 'scheduled',
            'to_status' => 'completed',
        ]);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'guidance_appointment.created']);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'guidance_appointment.updated']);
    }

    public function test_appointment_lifecycle_rejects_conflicts_and_terminal_record_changes(): void
    {
        [, $student] = $this->createAdminAndStudent();
        $counselor = User::factory()->create(['name' => 'Schedule Owner']);
        $counselor->roles()->attach($this->counselorRole());
        $payload = [
            'studentId' => $student->getKey(),
            'counselorId' => $counselor->getKey(),
            'scheduledAt' => '2026-08-22T09:00:00+08:00',
            'endsAt' => '2026-08-22T10:00:00+08:00',
            'topic' => 'Course guidance',
        ];

        $appointment = $this->actingAs($counselor)
            ->postJson('/api/v1/counselor/appointments', $payload)
            ->assertCreated()
            ->assertJsonCount(1, 'data.statusHistory')
            ->json('data');

        $this->actingAs($counselor)
            ->postJson('/api/v1/counselor/appointments', $payload)
            ->assertConflict()
            ->assertJsonPath('message', 'This appointment overlaps another active appointment for the counselor.');

        $this->actingAs($counselor)
            ->postJson('/api/v1/counselor/appointments', [
                ...$payload,
                'scheduledAt' => '2026-08-22T09:30:00+08:00',
                'endsAt' => '2026-08-22T10:30:00+08:00',
            ])
            ->assertConflict();

        $terminal = $this->actingAs($counselor)
            ->putJson("/api/v1/counselor/appointments/{$appointment['id']}", [
                ...$payload,
                'status' => 'no_show',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'no_show')
            ->assertJsonCount(2, 'data.statusHistory')
            ->json('data');

        $this->actingAs($counselor)
            ->putJson("/api/v1/counselor/appointments/{$terminal['id']}", [
                ...$payload,
                'status' => 'scheduled',
            ])
            ->assertConflict()
            ->assertJsonPath('message', 'Completed, cancelled, and no-show appointments are immutable.');
    }

    public function test_student_guidance_request_enters_the_admin_queue_and_is_linked_to_an_appointment(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();
        $counselor = User::factory()->create(['name' => 'Course Counselor']);
        $counselor->roles()->attach($this->counselorRole());

        $request = $this->actingAs($student)->postJson('/api/v1/student/guidance-requests', [
            'programmeId' => 'bs-information-technology',
            'concernCategory' => 'programme_comparison',
            'preferredFormat' => 'in_person',
            'preferredDate' => '2026-08-20',
            'message' => 'I would like help comparing my matched programmes before deciding.',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.programmeCode', 'BSIT')
            ->assertJsonPath('data.concernCategory', 'programme_comparison')
            ->assertJsonPath('data.preferredFormat', 'in_person')
            ->assertJsonPath('data.statusHistory.0.eventType', 'submitted')
            ->json('data');

        $this->actingAs($student)->getJson('/api/v1/student/guidance-requests')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $request['id']);
        $otherStudent = User::factory()->create();
        $otherStudent->roles()->attach(Role::query()->where('slug', RoleSlug::Student->value)->firstOrFail());
        $this->actingAs($otherStudent)->getJson('/api/v1/student/guidance-requests')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->actingAs($admin)->getJson('/api/v1/admin/guidance-requests')
            ->assertOk()
            ->assertJsonPath('data.0.studentId', $student->getKey())
            ->assertJsonPath('data.0.status', 'pending');
        $this->actingAs($admin)->getJson('/api/v1/admin/overview')
            ->assertOk()
            ->assertJsonPath('data.pendingGuidanceRequests', 1);

        $appointment = $this->actingAs($counselor)->postJson('/api/v1/counselor/appointments', [
            'studentId' => $student->getKey(),
            'counselorId' => $counselor->getKey(),
            'guidanceRequestId' => $request['id'],
            'scheduledAt' => '2026-08-21T10:00:00+08:00',
            'endsAt' => '2026-08-21T11:00:00+08:00',
            'topic' => 'Review programme matches',
            'programmeCode' => 'BSIT',
        ])->assertCreated()->json('data');

        $this->assertDatabaseHas('guidance_requests', [
            'id' => $request['id'],
            'student_id' => $student->getKey(),
            'status' => 'scheduled',
            'appointment_id' => $appointment['id'],
            'accepted_by' => $counselor->getKey(),
        ]);
        $this->assertDatabaseHas('guidance_request_events', [
            'guidance_request_id' => $request['id'],
            'actor_id' => $counselor->getKey(),
            'event_type' => 'accepted',
            'to_status' => 'accepted',
        ]);
        $this->assertDatabaseHas('guidance_request_events', [
            'guidance_request_id' => $request['id'],
            'actor_id' => $counselor->getKey(),
            'event_type' => 'scheduled',
            'to_status' => 'scheduled',
        ]);
        $this->assertSame(1, GuidanceRequest::query()->count());
    }

    public function test_guidance_requests_are_owned_by_the_accepting_counselor_and_cannot_be_claimed_twice(): void
    {
        [, $student] = $this->createAdminAndStudent();
        $firstCounselor = User::factory()->create(['name' => 'First Counselor']);
        $secondCounselor = User::factory()->create(['name' => 'Second Counselor']);
        $firstCounselor->roles()->attach($this->counselorRole());
        $secondCounselor->roles()->attach($this->counselorRole());

        $request = $this->actingAs($student)->postJson('/api/v1/student/guidance-requests', [
            'concernCategory' => 'course_requirements',
            'preferredFormat' => 'video_call',
            'message' => 'I need help understanding the programme requirements.',
        ])->assertCreated()->json('data');

        $startsAt = now()->addDays(8)->setTime(13, 0);
        $payload = [
            'studentId' => $student->getKey(),
            'counselorId' => $firstCounselor->getKey(),
            'guidanceRequestId' => $request['id'],
            'scheduledAt' => $startsAt->toAtomString(),
            'endsAt' => $startsAt->copy()->addHour()->toAtomString(),
            'topic' => 'Review programme requirements',
        ];

        $this->actingAs($firstCounselor)
            ->postJson('/api/v1/counselor/appointments', $payload)
            ->assertCreated();

        $this->actingAs($secondCounselor)
            ->postJson('/api/v1/counselor/appointments', [
                ...$payload,
                'counselorId' => $secondCounselor->getKey(),
                'scheduledAt' => $startsAt->copy()->addDays(1)->toAtomString(),
                'endsAt' => $startsAt->copy()->addDays(1)->addHour()->toAtomString(),
            ])
            ->assertConflict();

        $this->assertDatabaseCount('guidance_appointments', 1);
        $this->assertDatabaseHas('guidance_requests', [
            'id' => $request['id'],
            'accepted_by' => $firstCounselor->getKey(),
            'status' => 'scheduled',
        ]);
        $this->actingAs($secondCounselor)->getJson('/api/v1/counselor/guidance-requests')
            ->assertOk()
            ->assertJsonCount(0, 'data');
        $this->actingAs($firstCounselor)->getJson('/api/v1/counselor/guidance-requests')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.acceptedById', $firstCounselor->getKey())
            ->assertJsonPath('data.0.acceptedBy', 'First Counselor');
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

    public function test_student_can_confirm_and_cancel_only_their_own_future_appointment(): void
    {
        [, $student] = $this->createAdminAndStudent();
        $otherStudent = User::factory()->create();
        $otherStudent->roles()->attach(Role::query()->where('slug', RoleSlug::Student->value)->firstOrFail());
        $counselor = User::factory()->create(['name' => 'Student Appointment Counselor']);
        $counselor->roles()->attach($this->counselorRole());
        $startsAt = now()->addDays(7)->setTime(9, 0);
        $endsAt = $startsAt->copy()->addHour();

        $appointment = $this->actingAs($counselor)->postJson('/api/v1/counselor/appointments', [
            'studentId' => $student->getKey(),
            'counselorId' => $counselor->getKey(),
            'scheduledAt' => $startsAt->toAtomString(),
            'endsAt' => $endsAt->toAtomString(),
            'topic' => 'Review saved programmes',
        ])->assertCreated()->json('data');

        $this->actingAs($otherStudent)
            ->postJson("/api/v1/student/guidance-appointments/{$appointment['id']}/confirm")
            ->assertNotFound();

        $this->actingAs($student)
            ->postJson("/api/v1/student/guidance-appointments/{$appointment['id']}/confirm")
            ->assertOk()
            ->assertJsonPath('data.status', 'scheduled')
            ->assertJsonPath('data.statusHistory.1.eventType', 'student_confirmed');

        $this->actingAs($student)
            ->postJson("/api/v1/student/guidance-appointments/{$appointment['id']}/cancel", [
                'reason' => 'I need to request a different schedule.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.cancellationReason', 'I need to request a different schedule.');

        $this->assertDatabaseHas('guidance_appointment_events', [
            'guidance_appointment_id' => $appointment['id'],
            'actor_id' => $student->getKey(),
            'event_type' => 'status_changed',
            'to_status' => 'cancelled',
        ]);
    }

    public function test_admin_and_counselor_can_export_aggregate_reports_without_student_details(): void
    {
        [$admin, $student] = $this->createAdminAndStudent();
        $session = $this->completedSession($student);
        RecommendationRun::query()->create([
            'user_id' => $student->getKey(), 'assessment_session_id' => $session->getKey(),
            'catalogue_reference' => 'TCC-AY-2026-2027-V1', 'rule_reference' => 'PROPOSED-RIASEC-1',
            'methodology_status' => 'Proposed methodology', 'default_count' => 3, 'total_eligible' => 1,
            'ranked_courses' => [['id' => 'bsit', 'rank' => 1, 'code' => 'BSIT', 'name' => 'BS Information Technology', 'match' => 90]],
            'generated_at' => now(),
        ]);

        $this->actingAs($admin)->getJson('/api/v1/admin/reports')
            ->assertOk()
            ->assertJsonPath('data.completedAssessments', 1)
            ->assertJsonMissingPath('data.topMatchFrequency');

        $response = $this->actingAs($admin)->get('/api/v1/admin/reports/export');
        $response->assertOk()->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringNotContainsString($student->email, $response->streamedContent());
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'report.exported']);

        $counselor = User::factory()->create();
        $counselor->roles()->attach($this->counselorRole());
        $this->actingAs($counselor)->getJson('/api/v1/counselor/reports')->assertOk();
    }

    public function test_counselor_can_load_every_read_only_dashboard_resource(): void
    {
        $counselor = User::factory()->create(['account_status' => 'active']);
        $counselor->roles()->attach($this->counselorRole());

        foreach (['overview', 'students', 'counselors', 'appointments', 'guidance-requests', 'reports'] as $resource) {
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
