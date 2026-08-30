<?php

namespace App\Jobs;

use App\Models\AssessmentSession;
use App\Services\Assessment\RiasecQuestionnaire;
use App\Services\Notifications\PathwaysNotifier;
use App\Services\Recommendation\ProposedGuidanceContentRepository;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ProcessAssessmentResult implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public int $assessmentSessionId) {}

    public function handle(RiasecQuestionnaire $questionnaire): void
    {
        $session = AssessmentSession::query()->findOrFail($this->assessmentSessionId);
        if ($session->status !== 'preparing_result') {
            return;
        }

        $answers = $session->answers ?? [];
        ksort($answers, SORT_NUMERIC);

        $resultPayload = $questionnaire->results(array_values($answers));
        $guidance = app(ProposedGuidanceContentRepository::class)->current();
        $resultPayload['guidance'] = [
            'status' => $guidance['policy_status'],
            'version' => $guidance['policy_version'],
            'notice' => $guidance['student_notice'],
            'explanations' => $guidance['riasec_explanations'],
        ];

        $session->forceFill([
            'status' => 'result_available',
            'result_payload' => $resultPayload,
            'result_available_at' => now(),
            'retake_available_at' => now()->addDays(
                (int) config('assessment.retake.minimum_days_between_completed_attempts'),
            ),
            'processing_error_code' => null,
            'processing_failed_at' => null,
        ])->save();

        $session->loadMissing('user:id,name,email');
        if ($session->user !== null) {
            app(PathwaysNotifier::class)->notify(
                $session->user,
                'assessment_result_ready',
                'Assessment result ready',
                'Your completed interest assessment result and programme matches are ready to review.',
                ['assessmentSessionId' => $session->getKey(), 'attemptNumber' => $session->attempt_number],
            );
        }
    }

    public function failed(?Throwable $exception): void
    {
        AssessmentSession::query()
            ->whereKey($this->assessmentSessionId)
            ->where('status', 'preparing_result')
            ->update([
                'status' => 'result_failed',
                'processing_error_code' => 'ASSESSMENT_PROCESSING_FAILED',
                'processing_failed_at' => now(),
            ]);
    }
}
