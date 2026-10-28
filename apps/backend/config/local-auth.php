<?php

return [
    'seed_enabled' => (bool) env('LOCAL_AUTH_SEED_ENABLED', false),
    'password' => env('LOCAL_AUTH_SEED_PASSWORD'),

    'accounts' => [
        'student' => [
            'name' => env('LOCAL_STUDENT_NAME', 'Local Student Applicant'),
            'email' => env('LOCAL_STUDENT_EMAIL', 'student@example.test'),
        ],
        'admin' => [
            'name' => env('LOCAL_ADMIN_NAME', 'Local Administrator'),
            'email' => env('LOCAL_ADMIN_EMAIL', 'admin@example.test'),
        ],
    ],
];
