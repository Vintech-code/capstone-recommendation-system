<?php

use App\Services\Notifications\NotificationPolicyScheduler;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

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
