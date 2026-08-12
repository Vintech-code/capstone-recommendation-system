<?php

return [
    'source_review_days' => (int) env('PATHWAYS_SOURCE_REVIEW_DAYS', 180),
    'student_retention_years' => (int) env('PATHWAYS_STUDENT_RETENTION_YEARS', 5),
    'identifiable_exports_enabled' => false,
    'backup' => [
        'owner_role' => 'Administrator',
        'encryption_key' => env('PATHWAYS_BACKUP_KEY') ?: env('APP_KEY'),
        'disk' => env('PATHWAYS_BACKUP_DISK', 'local'),
        'directory' => env('PATHWAYS_BACKUP_DIRECTORY', 'backups'),
    ],
];
