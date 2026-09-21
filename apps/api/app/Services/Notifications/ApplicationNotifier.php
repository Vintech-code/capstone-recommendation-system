<?php

namespace App\Services\Notifications;

use App\Models\User;
use App\Notifications\ApplicationEventNotification;

final class ApplicationNotifier
{
    /** @param array<string, int|string|null> $context */
    public function notify(User $recipient, string $eventType, string $title, string $message, array $context = []): void
    {
        $recipient->notify(new ApplicationEventNotification($eventType, $title, $message, $context));
    }
}
