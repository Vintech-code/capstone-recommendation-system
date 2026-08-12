<?php

namespace Tests\Feature\Guidance;

use App\Http\Controllers\Admin\AdminGuidanceController;
use App\Http\Controllers\Guidance\StudentGuidanceSummaryController;
use App\Jobs\ProcessAssessmentResult;
use App\Models\AssessmentSession;
use App\Models\ConfigurationVersion;
use App\Models\CounselorAvailabilityWindow;
use App\Models\GuidanceAppointment;
use App\Models\GuidanceSummary;
use App\Models\NotificationDispatch;
use App\Models\RecommendationRun;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\StudentSavedProgramme;
use App\Models\User;
use App\Services\Notifications\NotificationPolicyScheduler;
use App\Services\Notifications\PathwaysNotifier;
use App\Services\Onet\OnetInterestProfilerClient;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class GuidanceSummaryAndNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_private_notes_are_separate_from_explicitly_published_student_summaries(): void
    {
        [$student, $counselor] = $this->studentAndCounselor();
        $controller = app(AdminGuidanceController::class);

        $controller->storeNote($this->requestFor($counselor, ['body' => 'Internal counselor observation.']), $student);
        $draftResponse = $controller->storeSummary($this->requestFor($counselor, ['body' => 'Review the compared programmes and list your remaining questions.']), $student);
        $draftId = $draftResponse->getData(true)['data']['id'];

        $studentResponse = app(StudentGuidanceSummaryController::class)->index($this->requestFor($student));
        $this->assertSame([], $studentResponse->getData(true)['data']);

        $draft = GuidanceSummary::query()->findOrFail($draftId);
        $controller->publishSummary($this->requestFor($counselor), $student, $draft, app(PathwaysNotifier::class));

        $payload = app(StudentGuidanceSummaryController::class)->index($this->requestFor($student))->getData(true)['data'];
        $this->assertCount(1, $payload);
        $this->assertSame('Review the compared programmes and list your remaining questions.', $payload[0]['body']);
        $this->assertStringNotContainsString('Internal counselor observation.', json_encode($payload, JSON_THROW_ON_ERROR));
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $student->getKey(),
            'notifiable_type' => User::class,
        ]);
        $this->assertSame('guidance_summary_published', $student->notifications()->firstOrFail()->data['eventType']);
    }

    public function test_published_guidance_summary_is_immutable(): void
    {
        [$student, $counselor] = $this->studentAndCounselor();
        $controller = app(AdminGuidanceController::class);
        $draftId = $controller->storeSummary($this->requestFor($counselor, ['body' => 'Student-visible next steps.']), $student)->getData(true)['data']['id'];
        $summary = GuidanceSummary::query()->findOrFail($draftId);
        $controller->publishSummary($this->requestFor($counselor), $student, $summary, app(PathwaysNotifier::class));

        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Published guidance summaries are immutable.');
        $controller->updateSummary($this->requestFor($counselor, ['body' => 'Changed after publishing.']), $student, $summary->fresh());
    }

    public function test_summary_and_notification_routes_enforce_student_visibility_and_ownership(): void
    {
        [$student, $counselor] = $this->studentAndCounselor();
        $otherStudent = User::factory()->create(['account_status' => 'active']);
        $otherStudent->roles()->attach(Role::query()->where('slug', RoleSlug::Student->value)->firstOrFail());

        $draft = $this->actingAs($counselor)->postJson("/api/v1/counselor/students/{$student->getKey()}/guidance-summaries", [
            'body' => 'Compare the two shortlisted programmes before the next conversation.',
        ])->assertCreated()->assertJsonPath('data.status', 'draft')->json('data');

        $this->actingAs($student)->getJson('/api/v1/student/guidance-summaries')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($student)->postJson("/api/v1/counselor/students/{$student->getKey()}/guidance-summaries", ['body' => 'Not allowed.'])->assertForbidden();

        $this->actingAs($counselor)->postJson("/api/v1/counselor/students/{$student->getKey()}/guidance-summaries/{$draft['id']}/publish")
            ->assertOk()->assertJsonPath('data.status', 'published');
        $this->actingAs($student)->getJson('/api/v1/student/guidance-summaries')
            ->assertOk()->assertJsonPath('data.0.body', 'Compare the two shortlisted programmes before the next conversation.');

        $notificationId = $this->actingAs($student)->getJson('/api/v1/notifications')
            ->assertOk()->assertJsonPath('data.0.eventType', 'guidance_summary_published')->json('data.0.id');
        $this->actingAs($otherStudent)->postJson("/api/v1/notifications/{$notificationId}/read")->assertNotFound();
        $this->actingAs($student)->postJson("/api/v1/notifications/{$notificationId}/read")
            ->assertOk()->assertJsonPath('data.id', $notificationId);
    }

    public function test_existing_appointment_lifecycle_creates_database_notifications(): void
    {
        [$student, $counselor] = $this->studentAndCounselor();
        $request = $this->actingAs($student)->postJson('/api/v1/student/guidance-requests', [
            'concernCategory' => 'general_guidance',
            'message' => 'I would like advice about my recorded programme matches.',
            'preferredFormat' => 'in_person',
        ])->assertCreated()->json('data');
        $startsAt = now()->addDays(5)->setTime(10, 0);
        $endsAt = $startsAt->copy()->addHour();
        CounselorAvailabilityWindow::query()->create([
            'counselor_id' => $counselor->getKey(),
            'weekday' => $startsAt->copy()->setTimezone('Asia/Manila')->dayOfWeek,
            'starts_at' => '00:00',
            'ends_at' => '23:59',
            'timezone' => 'Asia/Manila',
        ]);

        $appointment = $this->actingAs($counselor)->postJson('/api/v1/counselor/appointments', [
            'studentId' => $student->getKey(),
            'counselorId' => $counselor->getKey(),
            'guidanceRequestId' => $request['id'],
            'scheduledAt' => $startsAt->toAtomString(),
            'endsAt' => $endsAt->toAtomString(),
            'topic' => 'Review programme matches',
        ])->assertCreated()->json('data');

        $this->assertSame(
            ['guidance_request_accepted', 'guidance_request_scheduled'],
            $student->notifications()->oldest()->get()->pluck('data')->pluck('eventType')->all(),
        );

        $this->actingAs($student)->postJson("/api/v1/student/guidance-appointments/{$appointment['id']}/confirm")->assertOk();
        $this->assertSame('appointment_student_confirmed', $counselor->notifications()->firstOrFail()->data['eventType']);
    }

    public function test_result_processing_notifies_the_student_once_result_is_available(): void
    {
        [$student] = $this->studentAndCounselor();
        config()->set('services.onet.api_key', 'test-onet-key');
        Http::fake(['api-v2.onetcenter.org/*' => Http::response(['result' => [
            ['title' => 'Realistic', 'score' => 10], ['title' => 'Investigative', 'score' => 20],
            ['title' => 'Artistic', 'score' => 15], ['title' => 'Social', 'score' => 12],
            ['title' => 'Enterprising', 'score' => 11], ['title' => 'Conventional', 'score' => 18],
        ]])]);
        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'status' => 'preparing_result',
            'answers' => array_combine(range(1, 30), array_fill(0, 30, 3)),
            'current_question' => 30,
            'started_at' => now(),
            'submitted_at' => now(),
        ]);

        (new ProcessAssessmentResult($session->getKey()))->handle(app(OnetInterestProfilerClient::class));

        $this->assertSame('assessment_result_ready', $student->notifications()->firstOrFail()->data['eventType']);
    }

    public function test_confirmed_appointments_schedule_deduplicated_reminders_and_rescheduling_invalidates_obsolete_records(): void
    {
        CarbonImmutable::setTestNow('2026-08-10 00:00:00 UTC');
        [$student, $counselor] = $this->studentAndCounselor();
        foreach (range(0, 6) as $weekday) {
            CounselorAvailabilityWindow::query()->create([
                'counselor_id' => $counselor->getKey(),
                'weekday' => $weekday,
                'starts_at' => '08:00',
                'ends_at' => '17:00',
                'timezone' => 'Asia/Manila',
            ]);
        }
        $appointment = GuidanceAppointment::query()->create([
            'student_id' => $student->getKey(),
            'counselor_id' => $counselor->getKey(),
            'created_by' => $counselor->getKey(),
            'scheduled_at' => CarbonImmutable::parse('2026-08-12 10:00:00 Asia/Manila')->utc(),
            'ends_at' => CarbonImmutable::parse('2026-08-12 11:00:00 Asia/Manila')->utc(),
            'topic' => 'Review programme matches',
            'status' => 'scheduled',
        ]);
        $policies = app(NotificationPolicyScheduler::class);

        $policies->refreshAppointmentReminders($appointment);
        $this->assertDatabaseCount('notification_dispatches', 0);

        $appointment->update(['student_confirmed_at' => now()]);
        $policies->refreshAppointmentReminders($appointment);
        $policies->refreshAppointmentReminders($appointment);
        $this->assertSame(2, NotificationDispatch::query()->where('status', 'pending')->count());

        $appointment->update([
            'scheduled_at' => CarbonImmutable::parse('2026-08-13 10:00:00 Asia/Manila')->utc(),
            'ends_at' => CarbonImmutable::parse('2026-08-13 11:00:00 Asia/Manila')->utc(),
            'student_confirmed_at' => null,
        ]);
        $policies->refreshAppointmentReminders($appointment);
        $this->assertSame(2, NotificationDispatch::query()->where('status', 'invalidated')->count());
        $this->assertSame(0, NotificationDispatch::query()->where('status', 'pending')->count());

        $appointment->update(['student_confirmed_at' => now()]);
        $policies->refreshAppointmentReminders($appointment);
        $this->assertSame(2, NotificationDispatch::query()->where('status', 'pending')->count());

        $appointment->update(['status' => 'cancelled']);
        $policies->refreshAppointmentReminders($appointment);
        $this->assertSame(4, NotificationDispatch::query()->where('status', 'invalidated')->count());
        $this->assertSame(0, NotificationDispatch::query()->where('status', 'pending')->count());
        CarbonImmutable::setTestNow();
    }

    public function test_due_reminder_is_shifted_into_office_hours_and_dispatched_only_once(): void
    {
        CarbonImmutable::setTestNow('2026-08-10 00:00:00 UTC');
        [$student, $counselor] = $this->studentAndCounselor();
        $appointmentAt = CarbonImmutable::parse('2026-08-12 09:30:00 Asia/Manila');
        foreach ([$appointmentAt->dayOfWeek, $appointmentAt->subDay()->dayOfWeek] as $weekday) {
            CounselorAvailabilityWindow::query()->firstOrCreate([
                'counselor_id' => $counselor->getKey(),
                'weekday' => $weekday,
                'starts_at' => '09:00',
                'ends_at' => '17:00',
                'timezone' => 'Asia/Manila',
            ]);
        }
        $appointment = GuidanceAppointment::query()->create([
            'student_id' => $student->getKey(),
            'counselor_id' => $counselor->getKey(),
            'created_by' => $counselor->getKey(),
            'scheduled_at' => $appointmentAt->utc(),
            'ends_at' => $appointmentAt->addHour()->utc(),
            'topic' => 'Course guidance',
            'status' => 'scheduled',
            'student_confirmed_at' => now(),
        ]);
        $policies = app(NotificationPolicyScheduler::class);
        $policies->refreshAppointmentReminders($appointment);

        $oneHour = NotificationDispatch::query()->whereJsonContains('payload->intervalMinutes', 60)->firstOrFail();
        $this->assertSame('2026-08-12 09:00', $oneHour->scheduled_for->setTimezone('Asia/Manila')->format('Y-m-d H:i'));

        $dispatchAt = CarbonImmutable::parse('2026-08-11 09:30:00 Asia/Manila');
        $this->assertSame(1, $policies->dispatchDue($dispatchAt));
        $this->assertSame(0, $policies->dispatchDue($dispatchAt));
        $this->assertSame(1, $student->notifications()->where('data->eventType', 'appointment_reminder')->count());
        CarbonImmutable::setTestNow();
    }

    public function test_published_programme_changes_are_batched_only_for_affected_students(): void
    {
        CarbonImmutable::setTestNow('2026-08-10 00:00:00 UTC');
        [$savedStudent, $counselor] = $this->studentAndCounselor();
        $matchedStudent = User::factory()->create(['account_status' => 'active']);
        $matchedStudent->roles()->attach(Role::query()->where('slug', RoleSlug::Student->value)->firstOrFail());
        $unaffectedStudent = User::factory()->create(['account_status' => 'active']);
        $unaffectedStudent->roles()->attach(Role::query()->where('slug', RoleSlug::Student->value)->firstOrFail());
        StudentSavedProgramme::query()->create(['user_id' => $savedStudent->getKey(), 'programme_id' => 'bsit']);
        $session = AssessmentSession::query()->create([
            'user_id' => $matchedStudent->getKey(),
            'instrument_code' => 'notification-policy-test',
            'status' => 'result_available',
            'current_question' => 30,
            'started_at' => now(),
        ]);
        RecommendationRun::query()->create([
            'user_id' => $matchedStudent->getKey(),
            'assessment_session_id' => $session->getKey(),
            'catalogue_reference' => 'catalogue-v1',
            'rule_reference' => 'rules-v1',
            'methodology_status' => 'proposed',
            'default_count' => 3,
            'total_eligible' => 1,
            'ranked_courses' => [['id' => 'bsit', 'code' => 'BSIT', 'name' => 'BS Information Technology']],
            'generated_at' => now(),
        ]);
        $before = ['programmes' => [['id' => 'bsit', 'short_label' => 'BSIT', 'display_name' => 'BS Information Technology', 'description' => 'Before']]];
        $after = ['programmes' => [['id' => 'bsit', 'short_label' => 'BSIT', 'display_name' => 'BS Information Technology', 'description' => 'After']]];
        $version = ConfigurationVersion::query()->create([
            'kind' => 'catalogue', 'version' => 20, 'status' => 'published', 'payload' => $after,
            'created_by' => $counselor->getKey(), 'published_by' => $counselor->getKey(), 'published_at' => now(),
        ]);
        $policies = app(NotificationPolicyScheduler::class);
        $policies->queuePublishedProgrammeUpdates($version, $before);
        $this->assertSame(2, NotificationDispatch::query()->where('event_type', 'programme_updated')->count());

        $versionTwo = ConfigurationVersion::query()->create([
            'kind' => 'catalogue', 'version' => 21, 'status' => 'published',
            'payload' => ['programmes' => [[...$after['programmes'][0], 'description' => 'After again']]],
            'created_by' => $counselor->getKey(), 'published_by' => $counselor->getKey(), 'published_at' => now()->addMinute(),
        ]);
        $policies->queuePublishedProgrammeUpdates($versionTwo, $after);
        $this->assertSame(2, NotificationDispatch::query()->where('event_type', 'programme_updated')->count());
        $this->assertCount(2, NotificationDispatch::query()->firstOrFail()->payload['versionIds']);

        $this->assertSame(2, $policies->dispatchDue(CarbonImmutable::now('UTC')->addMinutes(16)));
        $this->assertSame(1, $savedStudent->notifications()->where('data->eventType', 'programme_updated')->count());
        $this->assertSame(1, $matchedStudent->notifications()->where('data->eventType', 'programme_updated')->count());
        $this->assertSame(0, $unaffectedStudent->notifications()->count());
        $policies->queuePublishedProgrammeUpdates($versionTwo, $after);
        $this->assertSame(2, NotificationDispatch::query()->where('event_type', 'programme_updated')->count());
        $this->assertSame(0, $policies->dispatchDue(CarbonImmutable::now('UTC')->addMinutes(32)));
        $this->assertSame('BSIT', RecommendationRun::query()->findOrFail(1)->ranked_courses[0]['code']);
        CarbonImmutable::setTestNow();
    }

    /** @return array{User, User} */
    private function studentAndCounselor(): array
    {
        $studentRole = Role::query()->firstOrCreate(['slug' => RoleSlug::Student->value], ['name' => 'Student']);
        $counselorRole = Role::query()->firstOrCreate(['slug' => RoleSlug::Counselor->value], ['name' => 'Counselor']);
        $student = User::factory()->create(['account_status' => 'active']);
        $student->roles()->attach($studentRole);
        $counselor = User::factory()->create(['account_status' => 'active']);
        $counselor->roles()->attach($counselorRole);

        return [$student, $counselor];
    }

    /** @param array<string, mixed> $data */
    private function requestFor(User $user, array $data = []): Request
    {
        $request = Request::create('/', 'POST', $data);
        $request->setUserResolver(static fn (): User => $user);

        return $request;
    }
}
