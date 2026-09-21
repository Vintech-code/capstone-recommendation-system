<?php

namespace App\Notifications;

use App\Models\AdministratorInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdministratorInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly AdministratorInvitation $invitation,
        private readonly string $token,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim((string) config('app.frontend_url'), '/').'/admin/setup#token='.rawurlencode($this->token);

        return (new MailMessage)
            ->subject('Set up your TCC Administrator account')
            ->greeting('Hello '.$this->invitation->name.',')
            ->line('You were invited to use an individual TCC Administrator account.')
            ->action('Set up Administrator account', $url)
            ->line('This single-use link expires at '.$this->invitation->expires_at->toDayDateTimeString().' UTC.')
            ->line('If you were not expecting this invitation, do not use the link and contact the capstone team.');
    }
}
