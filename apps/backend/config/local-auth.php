<?php

return [
    'seed_enabled' => (bool) env('LOCAL_AUTH_SEED_ENABLED', false),
    'password' => env('LOCAL_AUTH_SEED_PASSWORD'),

    'accounts' => [
        'student' => [
            'name' => env('LOCAL_STUDENT_NAME', 'Student Applicant'),
            'email' => env('LOCAL_STUDENT_EMAIL', 'student@example.test'),
            'password' => env('LOCAL_STUDENT_PASSWORD'),
        ],
        'admin' => [
            'name' => env('LOCAL_ADMIN_NAME', 'Administrator'),
            'email' => env('LOCAL_ADMIN_EMAIL', 'admin@example.test'),
            'password' => env('LOCAL_ADMIN_PASSWORD'),
        ],
    ],
];
