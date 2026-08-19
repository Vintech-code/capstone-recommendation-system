<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assessment\SaveAssessmentSessionRequest;
use App\Jobs\ProcessAssessmentResult;
use App\Models\AssessmentSession;
use App\Services\Assessment\RiasecQuestionnaire;
use App\Services\Recommendation\ProposedGuidanceContentRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class AssessmentSessionController extends Controller
{
    public function __construct(private ProposedGuidanceContentRepository $guidance) {}

    public function current(Request $request, RiasecQuestionnaire $questionnaire): JsonResponse
    {
        $session = AssessmentSession::query()
            ->whereBelongsTo($request->user())
            ->where('instrument_code', RiasecQuestionnaire::INSTRUMENT_CODE)
            ->where('is_current', true)
            ->latest('attempt_number')
            ->first();

        if ($session?->status === 'preparing_result') {
            $session = $this->processResultNow($session, $questionnaire);
        }

        return response()->json(['data' => $session ? $this->resource($session) : [
            'status' => 'not_started',
            'question_count' => RiasecQuestionnaire::QUESTION_COUNT,
        ]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'retakeReason' => ['nullable', 'string', 'max:500'],
        ]);
        $retakeReason = trim((string) ($validated['retakeReason'] ?? ''));
        $created = false;
        $session = DB::transaction(function () use ($request, $retakeReason, &$created): AssessmentSession {
            $current = AssessmentSession::query()
                ->whereBelongsTo($request->user())
                ->where('instrument_code', RiasecQuestionnaire::INSTRUMENT_CODE)
                ->where('is_current', true)
                ->latest('attempt_number')
                ->lockForUpdate()
                ->first();

            if ($current === null) {
                $created = true;

                return $this->createAttempt($request->user()->getKey(), 1);
            }

            if (in_array($current->status, ['in_progress', 'preparing_result', 'result_failed'], true)) {
                return $current;
            }

            $current->update(['is_current' => false]);
            $created = true;

            return $this->createAttempt(
                $request->user()->getKey(),
                $current->attempt_number + 1,
                $current->getKey(),
                $retakeReason !== '' ? $retakeReason : null,
            );
        });

        return response()->json(['data' => $this->resource($session)], $created ? 201 : 200);
    }

    public function update(
        SaveAssessmentSessionRequest $request,
        AssessmentSession $assessmentSession,
    ): JsonResponse {
        $this->assertOwnedBy($request, $assessmentSession);
        $this->assertActiveInstrument($assessmentSession);
        $answers = $request->validated('answers');
        $currentQuestion = $request->integer('current_question');

        if ($assessmentSession->status !== 'in_progress') {
            return response()->json([
                'data' => $this->resource($assessmentSession),
                'meta' => [
                    'save_ignored' => true,
                    'reason' => 'submitted_responses_locked',
                ],
            ]);
        }

        $assessmentSession->update([
            'answers' => $answers,
            'current_question' => $currentQuestion,
            'saved_at' => now(),
        ]);

        return response()->json(['data' => $this->resource($assessmentSession->fresh())]);
    }

    public function submit(Request $request, AssessmentSession $assessmentSession, RiasecQuestionnaire $questionnaire): JsonResponse
    {
        $this->assertOwnedBy($request, $assessmentSession);
        $this->assertActiveInstrument($assessmentSession);

        if ($assessmentSession->status !== 'in_progress') {
            return response()->json(['data' => $this->resource($assessmentSession)]);
        }

        $answers = $assessmentSession->answers ?? [];
        if (count($answers) !== RiasecQuestionnaire::QUESTION_COUNT
            || array_map('intval', array_keys($answers)) !== range(1, RiasecQuestionnaire::QUESTION_COUNT)) {
            return response()->json([
                'message' => 'All 42 questions must be answered before submission.',
                'errors' => ['answers' => ['All 42 questions must be answered before submission.']],
            ], 422);
        }

        $assessmentSession->update([
            'status' => 'preparing_result',
            'submitted_at' => now(),
            'saved_at' => now(),
        ]);

        $assessmentSession = $this->processResultNow($assessmentSession->fresh(), $questionnaire);

        return response()->json(['data' => $this->resource($assessmentSession)]);
    }

    public function retryResult(Request $request, AssessmentSession $assessmentSession, RiasecQuestionnaire $questionnaire): JsonResponse
    {
        $this->assertOwnedBy($request, $assessmentSession);
        $this->assertActiveInstrument($assessmentSession);
        abort_if($assessmentSession->status !== 'result_failed', 409, 'This result is not available for retry.');

        $assessmentSession->forceFill([
            'status' => 'preparing_result',
            'processing_error_code' => null,
            'processing_failed_at' => null,
        ])->save();

        $assessmentSession = $this->processResultNow($assessmentSession->fresh(), $questionnaire);

        return response()->json(['data' => $this->resource($assessmentSession)]);
    }

    public function history(Request $request): JsonResponse
    {
        $sessions = AssessmentSession::query()
            ->whereBelongsTo($request->user())
            ->whereIn('instrument_code', [RiasecQuestionnaire::INSTRUMENT_CODE, RiasecQuestionnaire::LEGACY_INSTRUMENT_CODE])
            ->latest('started_at')
            ->get()
            ->map(fn (AssessmentSession $session): array => $this->resource($session));

        return response()->json([
            'data' => $sessions,
            'policy' => config('assessment.retake'),
        ]);
    }

    private function createAttempt(
        int $userId,
        int $attemptNumber,
        ?int $previousSessionId = null,
        ?string $retakeReason = null,
    ): AssessmentSession {
        return AssessmentSession::query()->create([
            'user_id' => $userId,
            'previous_session_id' => $previousSessionId,
            'retake_reason' => $retakeReason,
            'instrument_code' => RiasecQuestionnaire::INSTRUMENT_CODE,
            'attempt_number' => $attemptNumber,
            'is_current' => true,
            'status' => 'in_progress',
            'answers' => [],
            'current_question' => 1,
            'started_at' => now(),
        ]);
    }

    private function assertOwnedBy(Request $request, AssessmentSession $session): void
    {
        abort_unless($session->user_id === $request->user()->getKey(), 404);
    }

    private function assertActiveInstrument(AssessmentSession $session): void
    {
        abort_unless(
            $session->instrument_code === RiasecQuestionnaire::INSTRUMENT_CODE,
            409,
            'Historical assessment attempts are read-only.',
        );
    }

    private function processResultNow(AssessmentSession $session, RiasecQuestionnaire $questionnaire): AssessmentSession
    {
        $job = new ProcessAssessmentResult($session->getKey());

        try {
            $job->handle($questionnaire);
        } catch (Throwable $exception) {
            report($exception);
            $job->failed($exception);
        }

        return $session->fresh();
    }

    /** @return array<string, mixed> */
    private function resource(AssessmentSession $session): array
    {
        $resultPayload = $session->result_payload;
        if (is_array($resultPayload) && is_array($resultPayload['result'] ?? null)) {
            $resultPayload['result'] = RiasecQuestionnaire::normalizeResultEntries(
                $resultPayload['result'],
            );
            $content = $this->guidance->current();
            $resultPayload['guidance'] = [
                'status' => $content['policy_status'],
                'version' => $content['policy_version'],
                'notice' => $content['student_notice'],
                'explanations' => $content['riasec_explanations'],
            ];
        }

        return [
            'id' => $session->getKey(),
            'reference' => 'ASMT-'.str_pad((string) $session->getKey(), 6, '0', STR_PAD_LEFT),
            'instrument_code' => $session->instrument_code,
            'attempt_number' => $session->attempt_number,
            'is_current' => $session->is_current,
            'status' => $session->status,
            'answers' => $session->answers ?? [],
            'answer_count' => count($session->answers ?? []),
            'question_count' => $session->instrument_code === RiasecQuestionnaire::LEGACY_INSTRUMENT_CODE
                ? 30
                : RiasecQuestionnaire::QUESTION_COUNT,
            'current_question' => $session->current_question,
            'started_at' => $session->started_at?->toAtomString(),
            'saved_at' => $session->saved_at?->toAtomString(),
            'submitted_at' => $session->submitted_at?->toAtomString(),
            'result_available_at' => $session->result_available_at?->toAtomString(),
            'retake_available_at' => $session->retake_available_at?->toAtomString(),
            'retake_reason' => $session->retake_reason,
            'can_retake' => $session->status === 'result_available'
                && $session->is_current,
            'processing_error_code' => $session->processing_error_code,
            'processing_failed_at' => $session->processing_failed_at?->toAtomString(),
            'result' => $resultPayload,
        ];
    }
}
