<?php

use App\Models\User;
use App\Services\Notifications\NotificationPolicyScheduler;
use App\Services\Privacy\StudentRetentionService;
use App\Services\Reliability\EncryptedDatabaseBackup;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Symfony\Component\Console\Command\Command;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('notifications:dispatch-due', function (NotificationPolicyScheduler $notificationPolicies): void {
    $count = $notificationPolicies->dispatchDue();
    $this->info("Dispatched {$count} due in-app notification(s).");
})->purpose('Dispatch due appointment reminders and batched programme updates');

Schedule::command('notifications:dispatch-due')
    ->everyMinute()
    ->withoutOverlapping();

Artisan::command('privacy:enforce-retention {--apply}', function (StudentRetentionService $retention): int {
    $candidates = $retention->candidates();
    if (! $this->option('apply')) {
        $this->info(count($candidates).' Student record(s) meet the five-year inactivity threshold. Re-run with --apply to anonymize them.');

        return Command::SUCCESS;
    }
    foreach ($candidates as $candidate) {
        $student = User::query()->findOrFail($candidate['studentId']);
        $retention->anonymize($student);
    }
    $this->info(count($candidates).' Student record(s) anonymized.');

    return Command::SUCCESS;
})->purpose('Review or anonymize Student records after five years of inactivity');

Artisan::command('system:backup', function (EncryptedDatabaseBackup $backups): int {
    $this->info('Encrypted backup created: '.$backups->create());

    return Command::SUCCESS;
})->purpose('Create an encrypted backup of the current SQLite database');

Artisan::command('system:verify-backup', function (EncryptedDatabaseBackup $backups): int {
    $this->info('Backup restored and verified: '.$backups->verifyLatest());

    return Command::SUCCESS;
})->purpose('Decrypt the latest backup into a temporary database and run an integrity check');

Schedule::command('system:backup')->dailyAt('02:00')->withoutOverlapping()->onOneServer();
Schedule::command('system:verify-backup')->monthlyOn(1, '03:00')->withoutOverlapping()->onOneServer();
Schedule::command('privacy:enforce-retention --apply')->monthlyOn(1, '04:00')->withoutOverlapping()->onOneServer();
