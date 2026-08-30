<?php

namespace Tests\Feature\Notifications;

use App\Jobs\ProcessAssessmentResult;
use App\Models\AssessmentSession;
use App\Models\ConfigurationVersion;
use App\Models\NotificationDispatch;
use App\Models\RecommendationRun;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\StudentSavedProgramme;
use App\Models\User;
use App\Services\Assessment\RiasecQuestionnaire;
use App\Services\Notifications\NotificationPolicyScheduler;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SystemNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_result_processing_notifies_the_student_once_result_is_available(): void
    {
        [$student] = $this->studentAndAdmin();
        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'tcc-riasec-42-v1',
            'status' => 'preparing_result',
            'answers' => array_combine(range(1, 42), array_fill(0, 42, 1)),
            'current_question' => 42,
            'started_at' => now(),
            'submitted_at' => now(),
        ]);

        (new ProcessAssessmentResult($session->getKey()))->handle(app(RiasecQuestionnaire::class));

        $this->assertSame('assessment_result_ready', $student->notifications()->firstOrFail()->data['eventType']);
    }

    public function test_published_programme_changes_are_batched_only_for_affected_students(): void
    {
        CarbonImmutable::setTestNow('2026-08-10 00:00:00 UTC');
        [$savedStudent, $admin] = $this->studentAndAdmin();
        $studentRole = Role::query()->where('slug', RoleSlug::Student->value)->firstOrFail();
        $matchedStudent = User::factory()->create(['account_status' => 'active']);
        $matchedStudent->roles()->attach($studentRole);
        $unaffectedStudent = User::factory()->create(['account_status' => 'active']);
        $unaffectedStudent->roles()->attach($studentRole);
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
            'created_by' => $admin->getKey(), 'published_by' => $admin->getKey(), 'published_at' => now(),
        ]);
        $policies = app(NotificationPolicyScheduler::class);
        $policies->queuePublishedProgrammeUpdates($version, $before);
        $this->assertSame(2, NotificationDispatch::query()->where('event_type', 'programme_updated')->count());

        $versionTwo = ConfigurationVersion::query()->create([
            'kind' => 'catalogue', 'version' => 21, 'status' => 'published',
            'payload' => ['programmes' => [[...$after['programmes'][0], 'description' => 'After again']]],
            'created_by' => $admin->getKey(), 'published_by' => $admin->getKey(), 'published_at' => now()->addMinute(),
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
    private function studentAndAdmin(): array
    {
        $studentRole = Role::query()->firstOrCreate(['slug' => RoleSlug::Student->value], ['name' => 'Student Applicant']);
        $adminRole = Role::query()->firstOrCreate(['slug' => RoleSlug::Admin->value], ['name' => 'Administrator']);
        $student = User::factory()->create(['account_status' => 'active']);
        $student->roles()->attach($studentRole);
        $admin = User::factory()->create(['account_status' => 'active']);
        $admin->roles()->attach($adminRole);

        return [$student, $admin];
    }
}
