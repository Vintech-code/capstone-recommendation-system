<?php

namespace Tests\Feature\Assessment;

use App\Jobs\ProcessAssessmentResult;
use App\Models\AssessmentSession;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use App\Services\Onet\OnetInterestProfilerClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class AssessmentSessionPersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_starts_saves_and_resumes_one_owned_session(): void
    {
        $student = $this->student();

        $created = $this->actingAs($student)
            ->postJson('/api/v1/student/assessments/onet-mini-ip/sessions')
            ->assertCreated()
            ->assertJsonPath('data.status', 'in_progress')
            ->json('data');

        $this->patchJson("/api/v1/student/assessments/onet-mini-ip/sessions/{$created['id']}", [
            'answers' => ['1' => 3, '2' => 5],
            'current_question' => 3,
        ])
            ->assertOk()
            ->assertJsonPath('data.answer_count', 2)
            ->assertJsonPath('data.current_question', 3);

        $this->getJson('/api/v1/student/assessments/onet-mini-ip/session')
            ->assertOk()
            ->assertJsonPath('data.id', $created['id'])
            ->assertJsonPath('data.answers.1', 3)
            ->assertJsonPath('data.current_question', 3);

        $this->postJson('/api/v1/student/assessments/onet-mini-ip/sessions')
            ->assertOk()
            ->assertJsonPath('data.id', $created['id']);

        $this->assertDatabaseCount('assessment_sessions', 1);
    }

    public function test_student_cannot_read_or_change_another_students_session(): void
    {
        $owner = $this->student();
        $other = $this->student();
        $session = AssessmentSession::query()->create([
            'user_id' => $owner->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'status' => 'in_progress',
            'answers' => [],
            'current_question' => 1,
            'started_at' => now(),
        ]);

        $this->actingAs($other)
            ->patchJson("/api/v1/student/assessments/onet-mini-ip/sessions/{$session->getKey()}", [
                'answers' => ['1' => 3],
                'current_question' => 2,
            ])
            ->assertNotFound();
    }

    public function test_complete_session_ignores_late_save_replays_without_changing_submitted_answers(): void
    {
        config()->set('services.onet.api_key', 'test-onet-key');
        Http::fake(['api-v2.onetcenter.org/*' => Http::response(['result' => [
            ['title' => 'Realistic', 'score' => 10],
            ['title' => 'Investigative', 'score' => 20],
            ['title' => 'Artistic', 'score' => 15],
            ['title' => 'Social', 'score' => 12],
            ['title' => 'Enterprising', 'score' => 11],
            ['title' => 'Conventional', 'score' => 18],
        ]])]);
        $student = $this->student();
        $answers = array_combine(range(1, 30), array_fill(0, 30, 3));
        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'status' => 'in_progress',
            'answers' => $answers,
            'current_question' => 30,
            'started_at' => now(),
        ]);

        $this->actingAs($student)
            ->postJson("/api/v1/student/assessments/onet-mini-ip/sessions/{$session->getKey()}/submit")
            ->assertOk()
            ->assertJsonPath('data.status', 'result_available')
            ->assertJsonCount(6, 'data.result.result');

        $this->patchJson("/api/v1/student/assessments/onet-mini-ip/sessions/{$session->getKey()}", [
            'answers' => $answers,
            'current_question' => 30,
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'result_available')
            ->assertJsonPath('meta.save_ignored', true);

        $changedAnswers = $answers;
        $changedAnswers[1] = 5;

        $this->patchJson("/api/v1/student/assessments/onet-mini-ip/sessions/{$session->getKey()}", [
            'answers' => $changedAnswers,
            'current_question' => 12,
        ])
            ->assertOk()
            ->assertJsonPath('data.answers.1', 3)
            ->assertJsonPath('data.current_question', 30)
            ->assertJsonPath('meta.save_ignored', true);

        $this->assertSame($answers, $session->fresh()->answers);
    }

    public function test_incomplete_session_cannot_be_submitted(): void
    {
        $student = $this->student();
        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'status' => 'in_progress',
            'answers' => ['1' => 4],
            'current_question' => 2,
            'started_at' => now(),
        ]);

        $this->actingAs($student)
            ->postJson("/api/v1/student/assessments/onet-mini-ip/sessions/{$session->getKey()}/submit")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('answers');
    }

    public function test_result_processor_makes_the_result_available(): void
    {
        config()->set('services.onet.api_key', 'test-onet-key');
        config()->set('assessment.retake.minimum_days_between_completed_attempts', 14);
        Http::fake([
            'api-v2.onetcenter.org/*' => Http::response([
                'result' => [
                    ['title' => 'Realistic', 'score' => 10],
                    ['title' => 'Investigative', 'score' => 20],
                    ['title' => 'Artistic', 'score' => 15],
                    ['title' => 'Social', 'score' => 12],
                    ['title' => 'Enterprising', 'score' => 11],
                    ['title' => 'Conventional', 'score' => 18],
                ],
            ]),
        ]);
        $student = $this->student();
        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'status' => 'preparing_result',
            'answers' => array_combine(range(1, 30), array_fill(0, 30, 3)),
            'current_question' => 30,
            'started_at' => now(),
            'submitted_at' => now(),
        ]);

        (new ProcessAssessmentResult($session->getKey()))
            ->handle(app(OnetInterestProfilerClient::class));

        $session->refresh();
        $this->assertSame('result_available', $session->status);
        $this->assertCount(6, $session->result_payload['result']);
        $this->assertSame('Realistic', $session->result_payload['result'][0]['area']);
        $this->assertArrayNotHasKey('title', $session->result_payload['result'][0]);
        $this->assertNotNull($session->result_available_at);
        $this->assertSame(14, (int) $session->result_available_at->diffInDays($session->retake_available_at));
    }

    public function test_loading_a_legacy_preparing_session_finishes_the_result_immediately(): void
    {
        config()->set('services.onet.api_key', 'test-onet-key');
        Http::fake(['api-v2.onetcenter.org/*' => Http::response(['result' => [
            ['title' => 'Realistic', 'score' => 10],
            ['title' => 'Investigative', 'score' => 20],
            ['title' => 'Artistic', 'score' => 15],
            ['title' => 'Social', 'score' => 12],
            ['title' => 'Enterprising', 'score' => 11],
            ['title' => 'Conventional', 'score' => 18],
        ]])]);
        $student = $this->student();
        AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'status' => 'preparing_result',
            'answers' => array_combine(range(1, 30), array_fill(0, 30, 3)),
            'current_question' => 30,
            'is_current' => true,
            'started_at' => now(),
            'submitted_at' => now(),
        ]);

        $this->actingAs($student)
            ->getJson('/api/v1/student/assessments/onet-mini-ip/session')
            ->assertOk()
            ->assertJsonPath('data.status', 'result_available')
            ->assertJsonCount(6, 'data.result.result');
    }

    public function test_failed_processing_is_recoverable_without_unlocking_answers(): void
    {
        $student = $this->student();
        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'status' => 'preparing_result',
            'answers' => array_combine(range(1, 30), array_fill(0, 30, 3)),
            'current_question' => 30,
            'started_at' => now(),
            'submitted_at' => now(),
        ]);

        $job = new ProcessAssessmentResult($session->getKey());
        $job->failed(new RuntimeException('Provider details must not be stored.'));

        $session->refresh();
        $this->assertSame('result_failed', $session->status);
        $this->assertSame('ASSESSMENT_PROVIDER_UNAVAILABLE', $session->processing_error_code);
        $this->assertNotNull($session->processing_failed_at);

        config()->set('services.onet.api_key', 'test-onet-key');
        Http::fake(['api-v2.onetcenter.org/*' => Http::response(['result' => [
            ['title' => 'Realistic', 'score' => 10],
            ['title' => 'Investigative', 'score' => 20],
            ['title' => 'Artistic', 'score' => 15],
            ['title' => 'Social', 'score' => 12],
            ['title' => 'Enterprising', 'score' => 11],
            ['title' => 'Conventional', 'score' => 18],
        ]])]);

        $this->actingAs($student)
            ->postJson("/api/v1/student/assessments/onet-mini-ip/sessions/{$session->getKey()}/retry-result")
            ->assertOk()
            ->assertJsonPath('data.status', 'result_available')
            ->assertJsonPath('data.answer_count', 30);

        $this->assertDatabaseMissing('assessment_sessions', [
            'id' => $session->getKey(),
            'processing_error_code' => 'Provider details must not be stored.',
        ]);
    }

    public function test_current_session_normalizes_a_previously_saved_live_onet_result(): void
    {
        $student = $this->student();
        AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'status' => 'result_available',
            'answers' => array_combine(range(1, 30), array_fill(0, 30, 3)),
            'current_question' => 30,
            'result_payload' => [
                'instrument_code' => 'onet-mini-ip-30',
                'answer_count' => 30,
                'result' => collect(['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'])
                    ->map(fn (string $title, int $index): array => [
                        'code' => strtolower($title),
                        'title' => $title,
                        'score' => $index + 10,
                        'description' => 'Unapproved provider interpretation text',
                    ])->all(),
            ],
            'started_at' => now(),
            'submitted_at' => now(),
            'result_available_at' => now(),
        ]);

        $this->actingAs($student)
            ->getJson('/api/v1/student/assessments/onet-mini-ip/session')
            ->assertOk()
            ->assertJsonPath('data.result.result.0.area', 'Realistic')
            ->assertJsonPath('data.result.result.0.score', 10)
            ->assertJsonMissing(['description' => 'Unapproved provider interpretation text']);
    }

    public function test_completed_attempt_is_immutable_and_a_retake_creates_linked_history_immediately(): void
    {
        $student = $this->student();
        $first = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'attempt_number' => 1,
            'is_current' => true,
            'status' => 'result_available',
            'answers' => array_combine(range(1, 30), array_fill(0, 30, 3)),
            'current_question' => 30,
            'started_at' => now()->subDays(31),
            'submitted_at' => now()->subDays(30),
            'result_available_at' => now()->subDays(30),
            'retake_available_at' => now()->subMinute(),
        ]);

        $second = $this->actingAs($student)
            ->postJson('/api/v1/student/assessments/onet-mini-ip/sessions')
            ->assertCreated()
            ->assertJsonPath('data.attempt_number', 2)
            ->json('data');

        $this->assertFalse($first->fresh()->is_current);
        $this->assertDatabaseHas('assessment_sessions', [
            'id' => $second['id'],
            'previous_session_id' => $first->getKey(),
            'is_current' => true,
        ]);

        $this->getJson('/api/v1/student/assessments/onet-mini-ip/history')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('policy.status', 'proposed')
            ->assertJsonPath('policy.version', 'RETAKE-PROPOSED-2026-01')
            ->assertJsonPath('policy.minimum_days_between_completed_attempts', 0);
    }

    public function test_retake_is_available_without_a_waiting_period(): void
    {
        $student = $this->student();
        AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'onet-mini-ip-30',
            'status' => 'result_available',
            'answers' => [],
            'current_question' => 30,
            'started_at' => now(),
            'result_available_at' => now(),
            'retake_available_at' => now()->addDays(30),
        ]);

        $this->actingAs($student)
            ->postJson('/api/v1/student/assessments/onet-mini-ip/sessions')
            ->assertCreated()
            ->assertJsonPath('data.attempt_number', 2)
            ->assertJsonPath('data.status', 'in_progress');
        $this->assertDatabaseCount('assessment_sessions', 2);
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
