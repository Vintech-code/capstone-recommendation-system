<?php

namespace App\Services\Admin;

use App\Models\AdminAuditEvent;
use App\Models\AdministratorInvitation;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use App\Notifications\AdministratorInvitationNotification;
use App\Notifications\AdministratorSecurityNotification;
use App\Services\Auth\UserSessionRevoker;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class AdministratorAccountService
{
    public function __construct(private readonly UserSessionRevoker $sessions) {}

    /** @return array{administrators: array<int, array<string, mixed>>, invitations: array<int, array<string, mixed>>} */
    public function index(): array
    {
        $administrators = User::query()
            ->whereHas('roles', fn ($query) => $query->where('slug', RoleSlug::Admin->value))
            ->with('roles')
            ->orderBy('name')
            ->get()
            ->map(function (User $administrator): array {
                $lastActivity = DB::table((string) config('session.table', 'sessions'))
                    ->where('user_id', $administrator->getKey())
                    ->max('last_activity');

                return [
                    'id' => $administrator->getKey(),
                    'name' => $administrator->name,
                    'email' => $administrator->email,
                    'accountStatus' => $administrator->account_status,
                    'canManageAdministrators' => (bool) $administrator->can_manage_administrators,
                    'photoUrl' => $administrator->admin_photo_path
                        ? '/api/v1/admin/administrators/'.$administrator->getKey().'/photo?v='.$administrator->updated_at?->getTimestamp()
                        : $administrator->google_avatar_url,
                    'lastActiveAt' => $lastActivity ? Carbon::createFromTimestamp((int) $lastActivity)->toIso8601String() : null,
                    'createdAt' => $administrator->created_at?->toIso8601String(),
                ];
            })->all();

        $invitations = AdministratorInvitation::query()
            ->with('inviter:id,name')
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (AdministratorInvitation $invitation): array => $this->invitationPayload($invitation))
            ->all();

        return compact('administrators', 'invitations');
    }

    /** @param array{name: string, email: string, canManageAdministrators?: bool, currentPassword: string} $data */
    public function invite(User $actor, array $data): AdministratorInvitation
    {
        $this->confirmPassword($actor, $data['currentPassword']);
        $email = Str::lower(trim($data['email']));
        if (User::query()->whereRaw('LOWER(email) = ?', [$email])->exists()) {
            throw ValidationException::withMessages(['email' => ['That email already belongs to an account.']]);
        }
        if (AdministratorInvitation::query()->whereRaw('LOWER(pending_email) = ?', [$email])->exists()) {
            throw ValidationException::withMessages(['email' => ['An unresolved invitation already exists for this email. Resend it from the invitation history.']]);
        }

        [$invitation, $token] = $this->newInvitation($actor, trim($data['name']), $email, (bool) ($data['canManageAdministrators'] ?? false));
        $this->send($actor, $invitation, $token, 'administrator_invitation.created');

        return $invitation->fresh('inviter');
    }

    public function resend(User $actor, AdministratorInvitation $invitation, string $currentPassword): AdministratorInvitation
    {
        $this->confirmPassword($actor, $currentPassword);
        if ($invitation->accepted_at !== null || $invitation->revoked_at !== null) {
            throw ValidationException::withMessages(['invitation' => ['Only pending or expired invitations can be resent.']]);
        }
        if (User::query()->whereRaw('LOWER(email) = ?', [Str::lower($invitation->email)])->exists()) {
            throw ValidationException::withMessages(['invitation' => ['That email already belongs to an account.']]);
        }

        $token = Str::random(64);
        $invitation->forceFill([
            'token_hash' => hash('sha256', $token),
            'expires_at' => $this->invitationExpiresAt(),
            'sent_at' => null,
        ])->save();
        $this->send($actor, $invitation, $token, 'administrator_invitation.resent');

        return $invitation->fresh('inviter');
    }

    public function revokeInvitation(User $actor, AdministratorInvitation $invitation, string $currentPassword, ?string $reason): void
    {
        $this->confirmPassword($actor, $currentPassword);
        if ($invitation->accepted_at !== null || $invitation->revoked_at !== null) {
            throw ValidationException::withMessages(['invitation' => ['Only a pending or expired invitation can be revoked.']]);
        }

        $invitation->forceFill(['revoked_at' => now(), 'pending_email' => null])->save();
        $this->audit($actor, 'administrator_invitation.revoked', 'administrator_invitation', (string) $invitation->getKey(), ['reason' => $reason]);
    }

    public function invitation(string $token): AdministratorInvitation
    {
        $invitation = AdministratorInvitation::query()->with('inviter:id,name')->where('token_hash', hash('sha256', $token))->first();
        if ($invitation === null || ! $invitation->isPending()) {
            throw ValidationException::withMessages(['token' => ['This setup link is invalid or has expired. Request a new invitation.']]);
        }

        return $invitation;
    }

    /** @param array{token: string, password: string} $data */
    public function accept(array $data): User
    {
        $user = DB::transaction(function () use ($data): User {
            $invitation = AdministratorInvitation::query()
                ->where('token_hash', hash('sha256', $data['token']))
                ->lockForUpdate()
                ->first();
            if ($invitation === null || ! $invitation->isPending()) {
                throw ValidationException::withMessages(['token' => ['This setup link is invalid or has expired. Request a new invitation.']]);
            }
            if (User::query()->whereRaw('LOWER(email) = ?', [Str::lower($invitation->email)])->exists()) {
                throw ValidationException::withMessages(['token' => ['This invitation can no longer be accepted.']]);
            }

            $role = Role::query()->where('slug', RoleSlug::Admin->value)->firstOrFail();
            $user = User::query()->create([
                'name' => $invitation->name,
                'email' => $invitation->email,
                'password' => $data['password'],
                'account_status' => 'active',
                'can_manage_administrators' => $invitation->can_manage_administrators,
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();
            $user->roles()->attach($role);
            $invitation->forceFill(['accepted_at' => now(), 'pending_email' => null])->save();
            $this->audit($user, 'administrator_invitation.accepted', 'administrator', (string) $user->getKey(), ['invitedBy' => $invitation->invited_by]);

            return $user;
        });

        $this->notifySecurityChange($user, $user, 'Your TCC Administrator account is active', 'Your individual Administrator account was activated successfully.');

        return $user;
    }

    public function updateStatus(User $actor, User $administrator, string $status, string $currentPassword, string $reason): User
    {
        $this->confirmPassword($actor, $currentPassword);
        $this->assertAdministrator($administrator);
        if ($actor->is($administrator)) {
            throw ValidationException::withMessages(['status' => ['You cannot change your own account status.']]);
        }
        if ($status === 'suspended' && $administrator->can_manage_administrators) {
            $this->assertAnotherActiveManager($administrator);
        }

        $before = $administrator->account_status;
        $administrator->forceFill(['account_status' => $status, 'status_changed_at' => now()])->save();
        if ($status === 'suspended') {
            $this->sessions->revoke($administrator);
        }
        $this->audit($actor, 'administrator.status_changed', 'administrator', (string) $administrator->getKey(), [
            'beforeStatus' => $before,
            'afterStatus' => $status,
            'reason' => $reason,
        ]);
        $this->notifySecurityChange(
            $actor,
            $administrator,
            'Your TCC Administrator access changed',
            $status === 'suspended' ? 'Your Administrator account was suspended and its active sessions were revoked.' : 'Your Administrator account was reactivated.',
        );

        return $administrator;
    }

    public function updatePermission(User $actor, User $administrator, bool $canManage, string $currentPassword, string $reason): User
    {
        $this->confirmPassword($actor, $currentPassword);
        $this->assertAdministrator($administrator);
        if (! $canManage && $administrator->can_manage_administrators) {
            $this->assertAnotherActiveManager($administrator);
        }

        $administrator->forceFill(['can_manage_administrators' => $canManage])->save();
        $this->audit($actor, 'administrator.permission_changed', 'administrator', (string) $administrator->getKey(), [
            'canManageAdministrators' => $canManage,
            'reason' => $reason,
        ]);
        $this->notifySecurityChange(
            $actor,
            $administrator,
            'Your Administrator permissions changed',
            $canManage ? 'You can now manage Administrator accounts and invitations.' : 'Your permission to manage Administrator accounts and invitations was removed.',
        );

        return $administrator;
    }

    public function revokeSessions(User $actor, User $administrator, string $currentPassword, ?string $reason): void
    {
        $this->confirmPassword($actor, $currentPassword);
        $this->assertAdministrator($administrator);
        if ($actor->is($administrator)) {
            throw ValidationException::withMessages(['administrator' => ['Use Sign out to end your own session.']]);
        }
        $this->sessions->revoke($administrator);
        $this->audit($actor, 'administrator.sessions_revoked', 'administrator', (string) $administrator->getKey(), ['reason' => $reason]);
        $this->notifySecurityChange($actor, $administrator, 'Your Administrator sessions were revoked', 'Your active TCC Administrator sessions were revoked. Sign in again to continue.');
    }

    /** @return array<string, mixed> */
    public function invitationPayload(AdministratorInvitation $invitation): array
    {
        $status = $invitation->accepted_at !== null ? 'accepted'
            : ($invitation->revoked_at !== null ? 'revoked'
                : ($invitation->expires_at->isPast() ? 'expired' : 'pending'));

        return [
            'id' => $invitation->getKey(),
            'name' => $invitation->name,
            'email' => $invitation->email,
            'status' => $status,
            'canManageAdministrators' => (bool) $invitation->can_manage_administrators,
            'invitedBy' => $invitation->inviter?->name,
            'expiresAt' => $invitation->expires_at->toIso8601String(),
            'sentAt' => $invitation->sent_at?->toIso8601String(),
            'createdAt' => $invitation->created_at?->toIso8601String(),
        ];
    }

    /** @return array{AdministratorInvitation, string} */
    private function newInvitation(User $actor, string $name, string $email, bool $canManage): array
    {
        $token = Str::random(64);
        $invitation = AdministratorInvitation::query()->create([
            'name' => $name,
            'email' => $email,
            'pending_email' => $email,
            'token_hash' => hash('sha256', $token),
            'can_manage_administrators' => $canManage,
            'invited_by' => $actor->getKey(),
            'expires_at' => $this->invitationExpiresAt(),
        ]);

        return [$invitation, $token];
    }

    private function invitationExpiresAt(): Carbon
    {
        $minutes = max(1, (int) config('administrator-management.invitation_minutes', 15));

        return now()->addMinutes($minutes);
    }

    private function send(User $actor, AdministratorInvitation $invitation, string $token, string $action): void
    {
        try {
            Notification::route('mail', $invitation->email)->notify(new AdministratorInvitationNotification($invitation, $token));
            $invitation->forceFill(['sent_at' => now()])->save();
            $this->audit($actor, $action, 'administrator_invitation', (string) $invitation->getKey(), ['status' => 'sent']);
        } catch (\Throwable $exception) {
            $this->audit($actor, 'administrator_invitation.delivery_failed', 'administrator_invitation', (string) $invitation->getKey(), ['status' => 'delivery_failed']);
            throw $exception;
        }
    }

    private function confirmPassword(User $actor, string $password): void
    {
        if (! Hash::check($password, $actor->password)) {
            throw ValidationException::withMessages(['currentPassword' => ['The current password is incorrect.']]);
        }
    }

    private function notifySecurityChange(User $actor, User $administrator, string $subject, string $message): void
    {
        try {
            $administrator->notify(new AdministratorSecurityNotification($subject, $message));
        } catch (\Throwable) {
            $this->audit($actor, 'administrator.security_notice_failed', 'administrator', (string) $administrator->getKey(), ['status' => 'delivery_failed']);
        }
    }

    private function assertAdministrator(User $administrator): void
    {
        if (! $administrator->loadMissing('roles')->hasRole(RoleSlug::Admin)) {
            abort(404);
        }
    }

    private function assertAnotherActiveManager(User $excluded): void
    {
        $count = User::query()
            ->whereKeyNot($excluded->getKey())
            ->where('account_status', 'active')
            ->where('can_manage_administrators', true)
            ->whereHas('roles', fn ($query) => $query->where('slug', RoleSlug::Admin->value))
            ->count();
        if ($count === 0) {
            throw ValidationException::withMessages(['administrator' => ['At least one active Administrator account manager must remain.']]);
        }
    }

    /** @param array<string, mixed> $metadata */
    private function audit(User $actor, string $action, string $subjectType, string $subjectReference, array $metadata = []): void
    {
        AdminAuditEvent::query()->create([
            'actor_id' => $actor->getKey(),
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_reference' => $subjectReference,
            'metadata' => array_filter($metadata, static fn (mixed $value): bool => $value !== null && $value !== ''),
        ]);
    }
}
