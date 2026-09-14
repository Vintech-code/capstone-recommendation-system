<?php

namespace Tests\Feature\Admin;

use App\Models\AdministratorInvitation;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use App\Notifications\AdministratorInvitationNotification;
use App\Notifications\AdministratorSecurityNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdministratorAccountManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_an_authorized_account_manager_can_list_and_invite_administrators(): void
    {
        Notification::fake();
        $this->freezeTime();
        $manager = $this->admin(true);
        $standardAdmin = $this->admin(false);

        $this->actingAs($standardAdmin)->getJson('/api/v1/admin/administrators')->assertForbidden();

        $response = $this->actingAs($manager)->postJson('/api/v1/admin/administrators/invitations', [
            'name' => 'New Administrator',
            'email' => 'NEW-ADMIN@example.test',
            'canManageAdministrators' => false,
            'currentPassword' => 'password',
        ])->assertCreated()
            ->assertJsonPath('data.email', 'new-admin@example.test')
            ->assertJsonPath('data.status', 'pending');

        $invitation = AdministratorInvitation::query()->findOrFail($response->json('data.id'));
        $this->assertSame(64, strlen($invitation->token_hash));
        $this->assertNotNull($invitation->sent_at);
        $this->assertTrue($invitation->expires_at->isSameSecond(now()->addMinutes(15)));
        Notification::assertSentOnDemand(AdministratorInvitationNotification::class);
        Notification::assertSentOnDemand(AdministratorInvitationNotification::class, function (AdministratorInvitationNotification $notification, array $channels, object $notifiable): bool {
            $url = $notification->toMail($notifiable)->actionUrl;

            return is_string($url) && str_contains($url, '/admin/setup#token=') && ! str_contains($url, '?token=');
        });
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'administrator_invitation.created']);
    }

    public function test_invitation_acceptance_creates_an_active_individual_admin_and_consumes_the_link(): void
    {
        Notification::fake();
        $manager = $this->admin(true);
        $token = Str::random(64);
        $invitation = AdministratorInvitation::query()->create([
            'name' => 'Invited Administrator',
            'email' => 'invited@example.test',
            'pending_email' => 'invited@example.test',
            'token_hash' => hash('sha256', $token),
            'can_manage_administrators' => false,
            'invited_by' => $manager->getKey(),
            'expires_at' => now()->addDay(),
            'sent_at' => now(),
        ]);

        $this->postJson('/api/v1/auth/admin-invitation/preview', ['token' => $token])
            ->assertOk()
            ->assertJsonPath('data.name', 'Invited Administrator')
            ->assertJsonMissing(['email' => 'invited@example.test']);

        $this->postJson('/api/v1/auth/admin-invitation/accept', [
            'token' => $token,
            'password' => 'lowercase-only',
            'password_confirmation' => 'lowercase-only',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->postJson('/api/v1/auth/admin-invitation/accept', [
            'token' => $token,
            'password' => 'AdminSecure!2026',
            'password_confirmation' => 'AdminSecure!2026',
        ])->assertOk()->assertJsonPath('data.accepted', true);

        $user = User::query()->where('email', 'invited@example.test')->firstOrFail();
        $this->assertTrue($user->load('roles')->hasRole(RoleSlug::Admin));
        $this->assertSame('active', $user->account_status);
        $this->assertNotNull($user->email_verified_at);
        $this->assertNotNull($invitation->fresh()->accepted_at);
        Notification::assertSentTo($user, AdministratorSecurityNotification::class);

        $this->postJson('/api/v1/auth/admin-invitation/accept', [
            'token' => $token,
            'password' => 'another-password',
            'password_confirmation' => 'another-password',
        ])->assertUnprocessable();
    }

    public function test_expired_and_revoked_invitation_links_are_rejected(): void
    {
        $manager = $this->admin(true);
        foreach ([['expires_at' => now()->subMinute()], ['expires_at' => now()->addDay(), 'revoked_at' => now()]] as $state) {
            $token = Str::random(64);
            AdministratorInvitation::query()->create(array_merge([
                'name' => 'Expired Administrator',
                'email' => Str::random(8).'@example.test',
                'pending_email' => null,
                'token_hash' => hash('sha256', $token),
                'invited_by' => $manager->getKey(),
            ], $state));

            $this->postJson('/api/v1/auth/admin-invitation/preview', ['token' => $token])->assertUnprocessable();
        }
    }

    public function test_sensitive_actions_require_the_managers_current_password(): void
    {
        Notification::fake();
        $manager = $this->admin(true);

        $this->actingAs($manager)->postJson('/api/v1/admin/administrators/invitations', [
            'name' => 'New Administrator',
            'email' => 'new@example.test',
            'currentPassword' => 'wrong-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('currentPassword');

        $this->assertDatabaseMissing('administrator_invitations', ['email' => 'new@example.test']);
    }

    public function test_a_pending_administrator_email_cannot_be_registered_as_a_student(): void
    {
        $manager = $this->admin(true);
        AdministratorInvitation::query()->create([
            'name' => 'Reserved Administrator',
            'email' => 'reserved@example.test',
            'pending_email' => 'reserved@example.test',
            'token_hash' => hash('sha256', Str::random(64)),
            'invited_by' => $manager->getKey(),
            'expires_at' => now()->addDay(),
        ]);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Wrong Portal',
            'email' => 'reserved@example.test',
            'password' => 'secure-password',
            'password_confirmation' => 'secure-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->assertDatabaseMissing('users', ['email' => 'reserved@example.test']);
    }

    public function test_resending_invalidates_the_old_link_and_revoking_blocks_the_new_link(): void
    {
        Notification::fake();
        $this->freezeTime();
        $manager = $this->admin(true);
        $oldToken = Str::random(64);
        $invitation = AdministratorInvitation::query()->create([
            'name' => 'Pending Administrator',
            'email' => 'pending@example.test',
            'pending_email' => 'pending@example.test',
            'token_hash' => hash('sha256', $oldToken),
            'invited_by' => $manager->getKey(),
            'expires_at' => now()->subMinute(),
        ]);

        $this->actingAs($manager)->postJson("/api/v1/admin/administrators/invitations/{$invitation->getKey()}/resend", [
            'currentPassword' => 'password',
        ])->assertOk()->assertJsonPath('data.status', 'pending');

        $resent = $invitation->fresh();
        $this->assertNotSame(hash('sha256', $oldToken), $resent->token_hash);
        $this->assertTrue($resent->expires_at->isSameSecond(now()->addMinutes(15)));
        $this->postJson('/api/v1/auth/admin-invitation/preview', ['token' => $oldToken])->assertUnprocessable();

        $this->actingAs($manager)->deleteJson("/api/v1/admin/administrators/invitations/{$invitation->getKey()}", [
            'currentPassword' => 'password',
            'reason' => 'Recipient no longer requires access.',
        ])->assertOk()->assertJsonPath('data.revoked', true);

        $this->assertNotNull($invitation->fresh()->revoked_at);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'administrator_invitation.resent']);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'administrator_invitation.revoked']);
    }

    public function test_manager_can_grant_account_management_and_revoke_another_admins_sessions(): void
    {
        Notification::fake();
        $manager = $this->admin(true);
        $target = $this->admin(false);
        DB::table('sessions')->insert([
            'id' => 'another-session',
            'user_id' => $target->getKey(),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'test',
            'payload' => 'payload',
            'last_activity' => now()->timestamp,
        ]);

        $this->actingAs($manager)->putJson("/api/v1/admin/administrators/{$target->getKey()}/permission", [
            'canManageAdministrators' => true,
            'currentPassword' => 'password',
            'reason' => 'Backup account manager.',
        ])->assertOk()->assertJsonPath('data.canManageAdministrators', true);

        $this->postJson("/api/v1/admin/administrators/{$target->getKey()}/sessions/revoke", [
            'currentPassword' => 'password',
            'reason' => 'Routine access review.',
        ])->assertOk()->assertJsonPath('data.revoked', true);

        $this->assertDatabaseMissing('sessions', ['id' => 'another-session']);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'administrator.permission_changed']);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'administrator.sessions_revoked']);
        Notification::assertSentToTimes($target, AdministratorSecurityNotification::class, 2);
    }

    public function test_suspension_revokes_sessions_and_preserves_at_least_one_active_manager(): void
    {
        Notification::fake();
        $manager = $this->admin(true);
        $target = $this->admin(true);
        DB::table('sessions')->insert([
            'id' => 'target-session',
            'user_id' => $target->getKey(),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'test',
            'payload' => 'payload',
            'last_activity' => now()->timestamp,
        ]);

        $this->actingAs($manager)->putJson("/api/v1/admin/administrators/{$target->getKey()}/status", [
            'status' => 'suspended',
            'currentPassword' => 'password',
            'reason' => 'Access is no longer required.',
        ])->assertOk()->assertJsonPath('data.accountStatus', 'suspended');

        $this->assertDatabaseMissing('sessions', ['id' => 'target-session']);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'administrator.status_changed']);
        Notification::assertSentTo($target, AdministratorSecurityNotification::class);

    }

    public function test_last_active_manager_permission_cannot_be_removed(): void
    {
        $manager = $this->admin(true);
        $this->admin(false);

        $this->actingAs($manager)->putJson("/api/v1/admin/administrators/{$manager->getKey()}/permission", [
            'canManageAdministrators' => false,
            'currentPassword' => 'password',
            'reason' => 'Attempt to remove the last manager.',
        ])->assertUnprocessable()->assertJsonValidationErrors('administrator');

        $this->assertTrue((bool) $manager->fresh()->can_manage_administrators);
    }

    public function test_an_administrator_cannot_suspend_their_own_account(): void
    {
        $manager = $this->admin(true);

        $this->actingAs($manager)->putJson("/api/v1/admin/administrators/{$manager->getKey()}/status", [
            'status' => 'suspended',
            'currentPassword' => 'password',
            'reason' => 'Self suspension attempt.',
        ])->assertUnprocessable()->assertJsonValidationErrors('status');
    }

    private function admin(bool $canManage): User
    {
        $role = Role::query()->firstOrCreate(['slug' => RoleSlug::Admin->value], ['name' => 'Administrator']);
        $user = User::factory()->create(['can_manage_administrators' => $canManage]);
        $user->roles()->attach($role);

        return $user->load('roles');
    }
}
