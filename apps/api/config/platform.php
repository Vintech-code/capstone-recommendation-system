<?php

$legacyPrefix = (string) hex2bin('50415448574159535f');

return [
    'source_review_days' => (int) env('TCC_SOURCE_REVIEW_DAYS', env($legacyPrefix.'SOURCE_REVIEW_DAYS', 180)),
    'student_retention_years' => (int) env('TCC_STUDENT_RETENTION_YEARS', env($legacyPrefix.'STUDENT_RETENTION_YEARS', 5)),
    'identifiable_exports_enabled' => false,
    'backup' => [
        'owner_role' => 'Administrator',
        'encryption_key' => env('TCC_BACKUP_KEY') ?: env($legacyPrefix.'BACKUP_KEY') ?: env('APP_KEY'),
        'disk' => env('TCC_BACKUP_DISK', env($legacyPrefix.'BACKUP_DISK', 'local')),
        'directory' => env('TCC_BACKUP_DIRECTORY', env($legacyPrefix.'BACKUP_DIRECTORY', 'backups')),
    ],
];
