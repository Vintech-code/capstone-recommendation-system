<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeader('Origin', 'http://localhost:5173');
    }

    public function test_admin_can_sign_in_restore_the_session_and_sign_out(): void
    {
        $user = $this->adminUser();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'correct-password',
            'portal' => RoleSlug::Admin->value,
        ]);

        $login
            ->assertOk()
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('user.roles.0', RoleSlug::Admin->value);

        $this->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email);

        $this->postJson('/api/v1/auth/logout')->assertOk();
        $this->assertGuest();
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_student_can_register_with_only_the_student_role_and_then_sign_in(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New Student',
            'email' => 'new.student@example.test',
            'password' => 'student-password',
            'password_confirmation' => 'student-password',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.email', 'new.student@example.test')
            ->assertJsonPath('user.roles.0', RoleSlug::Student->value);

        $user = User::query()->where('email', 'new.student@example.test')->firstOrFail();
        $this->assertTrue($user->hasRole(RoleSlug::Student));
        $this->assertFalse($user->hasRole(RoleSlug::Admin));

        $this->postJson('/api/v1/auth/login', [
            'email' => 'new.student@example.test',
            'password' => 'student-password',
            'portal' => RoleSlug::Student->value,
        ])->assertOk();
    }

    public function test_student_registration_rejects_duplicate_email_and_mismatched_confirmation(): void
    {
        User::factory()->create(['email' => 'existing@example.test']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Duplicate Student',
            'email' => 'existing@example.test',
            'password' => 'student-password',
            'password_confirmation' => 'different-password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_incorrect_credentials_are_rejected_without_starting_a_session(): void
    {
        $user = $this->adminUser();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'incorrect-password',
            'portal' => RoleSlug::Admin->value,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_account_cannot_enter_a_different_role_portal(): void
    {
        $user = $this->adminUser();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'correct-password',
            'portal' => RoleSlug::Student->value,
        ])
            ->assertForbidden()
            ->assertJsonPath(
                'message',
                'This account cannot access the selected portal.',
            );

        $this->assertGuest();
    }

    public function test_login_requires_a_valid_portal_and_credentials(): void
    {
        $this->postJson('/api/v1/auth/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password', 'portal']);
    }

    public function test_protected_session_endpoint_rejects_guests(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->postJson('/api/v1/auth/logout')->assertUnauthorized();
    }

    public function test_suspended_account_cannot_sign_in(): void
    {
        $user = $this->adminUser();
        $user->update(['account_status' => 'suspended', 'status_changed_at' => now()]);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'correct-password',
            'portal' => RoleSlug::Admin->value,
        ])->assertForbidden()->assertJsonPath('error.code', 'ACCOUNT_NOT_ACTIVE');

        $this->assertGuest();
    }

    public function test_password_recovery_is_non_enumerating_and_resets_an_active_account(): void
    {
        Notification::fake();
        $user = $this->adminUser();
        $token = null;

        $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', 'If an active account matches that email, a password reset link has been sent.');
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'missing@example.test'])
            ->assertOk()
            ->assertJsonPath('message', 'If an active account matches that email, a password reset link has been sent.');

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use (&$token): bool {
            $token = $notification->token;

            return true;
        });

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-secure-password', $user->fresh()->password));
    }

    private function adminUser(): User
    {
        $role = Role::query()->create([
            'slug' => RoleSlug::Admin->value,
            'name' => 'Guidance / Psychometrician / Admin',
        ]);
        $user = User::factory()->create([
            'password' => 'correct-password',
        ]);
        $user->roles()->attach($role);

        return $user;
    }
}
