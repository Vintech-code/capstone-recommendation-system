<?php

namespace Tests\Feature\Assessment;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class OnetInterestProfilerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_student_can_load_the_official_thirty_question_mini_ip(): void
    {
        config()->set('services.onet.api_key', 'test-onet-key');
        Http::fake([
            'api-v2.onetcenter.org/*' => Http::response($this->questionsPayload()),
        ]);

        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->getJson('/api/v1/student/assessments/onet-mini-ip/questions')
            ->assertOk()
            ->assertJsonPath('data.instrument.code', 'onet-mini-ip-30')
            ->assertJsonPath('data.instrument.question_count', 30)
            ->assertJsonCount(30, 'data.questions')
            ->assertJsonCount(5, 'data.answer_options')
            ->assertJsonMissing(['area' => 'realistic']);

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://api-v2.onetcenter.org/mnm/interestprofiler/questions_30?start=1&end=30'
                && $request->hasHeader('X-API-Key', 'test-onet-key');
        });
    }

    public function test_validated_questions_are_cached_for_the_configured_interval(): void
    {
        config()->set('services.onet.api_key', 'test-onet-key');
        config()->set('services.onet.question_cache_seconds', 3600);
        Http::fake([
            'api-v2.onetcenter.org/*' => Http::response($this->questionsPayload()),
        ]);
        $student = $this->userWithRole(RoleSlug::Student);

        $this->actingAs($student)
            ->getJson('/api/v1/student/assessments/onet-mini-ip/questions')
            ->assertOk();
        $this->getJson('/api/v1/student/assessments/onet-mini-ip/questions')
            ->assertOk();

        Http::assertSentCount(1);
    }

    public function test_results_require_exactly_thirty_ordered_answers_from_one_to_five(): void
    {
        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->postJson('/api/v1/student/assessments/onet-mini-ip/results', [
                'answers' => array_fill(0, 29, 3),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('answers');

        $answers = array_fill(0, 30, 3);
        $answers[12] = 6;

        $this->postJson('/api/v1/student/assessments/onet-mini-ip/results', [
            'answers' => $answers,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('answers.12');
    }

    public function test_student_can_request_onet_computed_riasec_results(): void
    {
        config()->set('services.onet.api_key', 'test-onet-key');
        Http::fake([
            'api-v2.onetcenter.org/*' => Http::response([
                'result' => [
                    ['code' => 'realistic', 'title' => 'Realistic', 'score' => 11, 'description' => 'Provider text'],
                    ['code' => 'investigative', 'title' => 'Investigative', 'score' => 12, 'description' => 'Provider text'],
                    ['code' => 'artistic', 'title' => 'Artistic', 'score' => 13, 'description' => 'Provider text'],
                    ['code' => 'social', 'title' => 'Social', 'score' => 14, 'description' => 'Provider text'],
                    ['code' => 'enterprising', 'title' => 'Enterprising', 'score' => 15, 'description' => 'Provider text'],
                    ['code' => 'conventional', 'title' => 'Conventional', 'score' => 16, 'description' => 'Provider text'],
                ],
                'careers' => ['href' => 'https://example.test/careers'],
            ]),
        ]);

        $answers = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5,
            1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5];

        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->postJson('/api/v1/student/assessments/onet-mini-ip/results', [
                'answers' => $answers,
            ])
            ->assertOk()
            ->assertJsonPath('data.instrument_code', 'onet-mini-ip-30')
            ->assertJsonPath('data.answer_count', 30)
            ->assertJsonCount(6, 'data.result')
            ->assertJsonPath('data.result.0.area', 'Realistic')
            ->assertJsonPath('data.result.0.score', 11)
            ->assertJsonMissing(['description' => 'Provider text']);

        Http::assertSent(fn (Request $request): bool => str_contains(
            $request->url(),
            'answers=123451234512345123451234512345',
        ));
    }

    public function test_assessment_endpoints_enforce_student_role_and_authentication(): void
    {
        $this->getJson('/api/v1/student/assessments/onet-mini-ip/questions')
            ->assertUnauthorized();

        $this->actingAs($this->userWithRole(RoleSlug::Admin))
            ->getJson('/api/v1/student/assessments/onet-mini-ip/questions')
            ->assertForbidden()
            ->assertJsonPath('error.code', 'ROLE_FORBIDDEN');
    }

    public function test_missing_api_key_uses_the_bundled_official_instrument(): void
    {
        config()->set('services.onet.api_key');

        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->getJson('/api/v1/student/assessments/onet-mini-ip/questions')
            ->assertOk()
            ->assertJsonPath('data.instrument.content_version', 'onet-mini-ip-30-v1')
            ->assertJsonPath('data.questions.0.text', 'Build kitchen cabinets')
            ->assertJsonPath('data.questions.29.text', 'Stamp, sort, and distribute mail for an organization')
            ->assertJsonPath('data.answer_options.0.name', 'Strongly Dislike')
            ->assertJsonPath('data.answer_options.4.name', 'Strongly Like');
    }

    public function test_malformed_provider_response_uses_the_validated_official_instrument(): void
    {
        config()->set('services.onet.api_key', 'test-onet-key');
        Http::fake([
            'api-v2.onetcenter.org/*' => Http::response([
                'total' => 40,
                'answer_option' => [],
                'question' => [],
            ]),
        ]);

        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->getJson('/api/v1/student/assessments/onet-mini-ip/questions')
            ->assertOk()
            ->assertJsonPath('data.instrument.content_version', 'onet-mini-ip-30-v1')
            ->assertJsonCount(30, 'data.questions');
    }

    public function test_provider_rate_limit_uses_the_bundled_official_instrument(): void
    {
        config()->set('services.onet.api_key', 'test-onet-key');
        Http::fake([
            'api-v2.onetcenter.org/*' => Http::response([], 429),
        ]);

        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->getJson('/api/v1/student/assessments/onet-mini-ip/questions')
            ->assertOk()
            ->assertJsonPath('data.instrument.content_version', 'onet-mini-ip-30-v1')
            ->assertJsonMissing(['test-onet-key']);
    }

    public function test_provider_connection_failure_uses_the_bundled_official_instrument(): void
    {
        config()->set('services.onet.api_key', 'test-onet-key');
        Log::spy();
        Http::fake([
            'api-v2.onetcenter.org/*' => Http::failedConnection(),
        ]);

        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->getJson('/api/v1/student/assessments/onet-mini-ip/questions')
            ->assertOk()
            ->assertJsonPath('data.instrument.content_version', 'onet-mini-ip-30-v1')
            ->assertJsonMissing(['test-onet-key']);

        Log::shouldHaveReceived('warning')->once()->withArgs(
            static fn (string $message, array $context): bool => $message === 'O*NET request failed.'
                && ! str_contains(json_encode($context, JSON_THROW_ON_ERROR), 'test-onet-key'),
        );
    }

    public function test_results_are_scored_from_the_official_definition_when_provider_is_unavailable(): void
    {
        config()->set('services.onet.api_key', 'test-onet-key');
        Http::fake([
            'api-v2.onetcenter.org/*' => Http::failedConnection(),
        ]);

        $answers = [1, 2, 3, 4, 5, 1, 1, 2, 3, 4, 5, 1, 1, 2, 3,
            4, 5, 1, 1, 2, 3, 4, 5, 1, 1, 2, 3, 4, 5, 1];

        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->postJson('/api/v1/student/assessments/onet-mini-ip/results', [
                'answers' => $answers,
            ])
            ->assertOk()
            ->assertJsonPath('data.scoring_source', 'official-mini-ip-local-v1')
            ->assertJsonPath('data.result.0.area', 'Realistic')
            ->assertJsonPath('data.result.0.score', 0)
            ->assertJsonPath('data.result.1.score', 5)
            ->assertJsonPath('data.result.2.score', 10)
            ->assertJsonPath('data.result.3.score', 15)
            ->assertJsonPath('data.result.4.score', 20)
            ->assertJsonPath('data.result.5.score', 0);
    }

    /**
     * @return array<string, mixed>
     */
    private function questionsPayload(): array
    {
        return [
            'start' => 1,
            'end' => 30,
            'total' => 30,
            'answer_option' => collect(range(1, 5))->map(fn (int $value): array => [
                'value' => $value,
                'name' => "Option {$value}",
            ])->all(),
            'question' => collect(range(1, 30))->map(fn (int $index): array => [
                'index' => $index,
                'area' => 'realistic',
                'text' => "Question {$index}",
            ])->all(),
        ];
    }

    private function userWithRole(RoleSlug $roleSlug): User
    {
        $role = Role::query()->create([
            'slug' => $roleSlug->value,
            'name' => $roleSlug->value,
        ]);
        $user = User::factory()->create();
        $user->roles()->attach($role);

        return $user;
    }
}
