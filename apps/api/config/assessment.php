<?php

return [
    'retake' => [
        'status' => 'proposed',
        'version' => env('ASSESSMENT_RETAKE_POLICY_VERSION', 'RETAKE-PROPOSED-2026-01'),
        'minimum_days_between_completed_attempts' => (int) env('ASSESSMENT_RETAKE_MINIMUM_DAYS', 0),
        'completed_attempts_are_read_only' => true,
    ],
];
