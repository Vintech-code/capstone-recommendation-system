<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PathwaysEventNotification extends Notification
{
    use Queueable;

    /** @param array<string, int|string|null> $context */
    public function __construct(
        public readonly string $eventType,
        public readonly string $title,
        public readonly string $message,
        public readonly array $context = [],
    ) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array<string, mixed> */
    public function toDatabase(object $notifiable): array
    {
        return [
            'eventType' => $this->eventType,
            'title' => $this->title,
            'message' => $this->message,
            'context' => $this->context,
        ];
    }
}
