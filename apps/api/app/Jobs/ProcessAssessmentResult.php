<?php

namespace App\Jobs;

use App\Models\AssessmentSession;
use App\Services\Onet\OnetInterestProfilerClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ProcessAssessmentResult implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public int $assessmentSessionId) {}

    public function handle(OnetInterestProfilerClient $client): void
    {
        $session = AssessmentSession::query()->findOrFail($this->assessmentSessionId);
        if ($session->status !== 'preparing_result') {
            return;
        }

        $answers = $session->answers ?? [];
        ksort($answers, SORT_NUMERIC);

        $session->forceFill([
            'status' => 'result_available',
            'result_payload' => $client->results(array_values($answers)),
            'result_available_at' => now(),
            'retake_available_at' => now()->addDays(
                (int) config('assessment.retake.minimum_days_between_completed_attempts'),
            ),
            'processing_error_code' => null,
            'processing_failed_at' => null,
        ])->save();
    }

    public function failed(?Throwable $exception): void
    {
        AssessmentSession::query()
            ->whereKey($this->assessmentSessionId)
            ->where('status', 'preparing_result')
            ->update([
                'status' => 'result_failed',
                'processing_error_code' => 'ASSESSMENT_PROVIDER_UNAVAILABLE',
                'processing_failed_at' => now(),
            ]);
    }
}
