<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
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
            ->assertJsonPath('user.roles.0', RoleSlug::Admin->value)
            ->assertJsonPath('user.canManageAdministrators', true);

        $this->getJson('/api/v1/auth/session')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email);

        $this->postJson('/api/v1/auth/logout')->assertOk();
        $this->assertGuest();
        $this->getJson('/api/v1/auth/session')->assertOk()->assertJsonPath('user', null);
    }

    public function test_guest_session_bootstrap_returns_an_empty_success_response(): void
    {
        $this->getJson('/api/v1/auth/session')
            ->assertOk()
            ->assertJsonPath('user', null);

    }

    public function test_session_bootstrap_clears_an_inactive_account_without_exposing_it(): void
    {
        $user = $this->adminUser();
        $this->actingAs($user);
        $user->update(['account_status' => 'suspended', 'status_changed_at' => now()]);

        $this->getJson('/api/v1/auth/session')
            ->assertOk()
            ->assertJsonPath('user', null);

        $this->assertGuest();
    }

    public function test_student_registers_with_split_names_and_must_verify_before_signing_in(): void
    {
        Notification::fake();
        $response = $this->postJson('/api/v1/auth/register', [
            'firstName' => 'Clark',
            'lastName' => 'Cabatuan',
            'email' => 'new.student@example.test',
            'password' => 'StudentPass!2026',
            'password_confirmation' => 'StudentPass!2026',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.firstName', 'Clark')
            ->assertJsonPath('user.lastName', 'Cabatuan')
            ->assertJsonPath('user.name', 'Clark Cabatuan')
            ->assertJsonPath('user.emailVerified', false)
            ->assertJsonPath('user.email', 'new.student@example.test')
            ->assertJsonPath('user.roles.0', RoleSlug::Student->value);

        $user = User::query()->where('email', 'new.student@example.test')->firstOrFail();
        $this->assertTrue($user->hasRole(RoleSlug::Student));
        $this->assertFalse($user->hasRole(RoleSlug::Admin));
        $this->assertSame('Clark', $user->first_name);
        $this->assertSame('Cabatuan', $user->last_name);
        $this->assertSame('Clark Cabatuan', $user->name);
        $this->assertNull($user->email_verified_at);
        Notification::assertSentTo($user, VerifyEmail::class);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'new.student@example.test',
            'password' => 'StudentPass!2026',
            'portal' => RoleSlug::Student->value,
        ])->assertForbidden()->assertJsonPath('error.code', 'EMAIL_NOT_VERIFIED');
        $this->assertGuest();

        $verificationUrl = null;
        Notification::assertSentTo($user, VerifyEmail::class, function (VerifyEmail $notification) use ($user, &$verificationUrl): bool {
            $mail = $notification->toMail($user);
            $verificationUrl = $mail->actionUrl;
            $rendered = (string) $mail->render();

            $this->assertSame('Verify your email address | TCC Course Recommendation', $mail->subject);
            $this->assertSame([
                'html' => 'mail.auth.verify-email',
                'text' => 'mail.auth.verify-email-text',
            ], $mail->view);
            $this->assertStringContainsString('Hi Clark,', $rendered);
            $this->assertStringContainsString('new.student@example.test', $rendered);
            $this->assertStringContainsString('background:#7ED321', $rendered);
            $this->assertStringNotContainsString('Laravel', $rendered);

            return true;
        });
        $this->get((string) $verificationUrl)
            ->assertRedirect('http://localhost:5173/student/login?email_verified=1');
        $this->assertNotNull($user->fresh()->email_verified_at);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'new.student@example.test',
            'password' => 'StudentPass!2026',
            'portal' => RoleSlug::Student->value,
        ])->assertOk();
    }

    public function test_unverified_account_cannot_access_a_protected_portal(): void
    {
        $role = Role::query()->create([
            'slug' => RoleSlug::Student->value,
            'name' => 'Student Applicant',
        ]);
        $user = User::factory()->unverified()->create();
        $user->roles()->attach($role);

        $this->actingAs($user)
            ->getJson('/api/v1/auth/authorize/student')
            ->assertForbidden();
    }

    public function test_student_session_includes_the_current_profile_photo(): void
    {
        $user = $this->studentUser();
        $user->studentProfile()->create([
            'photo_path' => 'student-profile-photos/'.$user->getKey().'/profile.webp',
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/auth/session')->assertOk();

        $this->assertStringStartsWith(
            '/api/v1/profile-photos/'.$user->getKey().'?v=',
            (string) $response->json('user.photoUrl'),
        );
    }

    public function test_student_registration_rejects_duplicate_email_and_mismatched_confirmation(): void
    {
        User::factory()->create(['email' => 'existing@example.test']);

        $this->postJson('/api/v1/auth/register', [
            'firstName' => 'Duplicate',
            'lastName' => 'Student',
            'email' => 'existing@example.test',
            'password' => 'StudentPass!2026',
            'password_confirmation' => 'DifferentPass!2026',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_student_registration_rejects_a_password_below_the_shared_policy(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'firstName' => 'New',
            'lastName' => 'Student',
            'email' => 'new.student@example.test',
            'password' => 'lowercase-only',
            'password_confirmation' => 'lowercase-only',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->assertDatabaseMissing('users', ['email' => 'new.student@example.test']);
    }

    public function test_student_registration_rejects_invalid_and_misspelled_email_domains(): void
    {
        foreach (['not-an-email', 'user@gamil.com'] as $email) {
            $this->postJson('/api/v1/auth/register', [
                'firstName' => 'Clark',
                'lastName' => 'Cabatuan',
                'email' => $email,
                'password' => 'StudentPass!2026',
                'password_confirmation' => 'StudentPass!2026',
            ])->assertUnprocessable()->assertJsonValidationErrors('email');
        }
    }

    public function test_verification_email_can_be_resent_without_account_enumeration(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create(['email' => 'unverified@example.test']);

        foreach (['unverified@example.test', 'missing@example.test'] as $email) {
            $this->postJson('/api/v1/auth/email/verification-notification', ['email' => $email])
                ->assertOk()
                ->assertJsonPath('message', 'If an unverified account matches that email, a new verification link has been sent.');
        }

        Notification::assertSentToTimes($user, VerifyEmail::class, 1);
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

    public function test_protected_auth_endpoints_reject_guests(): void
    {
        $this->getJson('/api/v1/auth/authorize/admin')->assertUnauthorized();
        $this->postJson('/api/v1/auth/logout')->assertUnauthorized();
    }

    public function test_protected_api_endpoint_returns_json_for_browser_guest_without_accept_header(): void
    {
        $this->get('/api/v1/auth/authorize/admin')
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'AUTHENTICATION_REQUIRED');
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

    public function test_suspending_an_authenticated_account_invalidates_its_existing_session(): void
    {
        $user = $this->adminUser();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'correct-password',
            'portal' => RoleSlug::Admin->value,
        ])->assertOk();

        $user->update(['account_status' => 'suspended', 'status_changed_at' => now()]);

        $this->getJson('/api/v1/auth/authorize/admin')
            ->assertForbidden()
            ->assertJsonPath('error.code', 'ACCOUNT_NOT_ACTIVE');

        $this->assertGuest();
        $this->getJson('/api/v1/auth/authorize/admin')->assertUnauthorized();
    }

    public function test_login_is_rate_limited_after_repeated_failed_attempts(): void
    {
        $user = $this->adminUser();
        $payload = [
            'email' => $user->email,
            'password' => 'incorrect-password',
            'portal' => RoleSlug::Admin->value,
        ];

        foreach (range(1, 5) as $attempt) {
            $this->postJson('/api/v1/auth/login', $payload)
                ->assertUnprocessable();
        }

        $this->postJson('/api/v1/auth/login', $payload)
            ->assertTooManyRequests();
    }

    public function test_password_recovery_is_non_enumerating_and_resets_an_active_account(): void
    {
        Notification::fake();
        $user = $this->adminUser();
        $token = null;
        $resetUrl = null;

        $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', 'If an active account matches that email, a password reset link has been sent.');
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'missing@example.test'])
            ->assertOk()
            ->assertJsonPath('message', 'If an active account matches that email, a password reset link has been sent.');

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use (&$token, &$resetUrl, $user): bool {
            $token = $notification->token;
            $resetUrl = $notification->toMail($user)->actionUrl;

            return true;
        });
        $this->assertIsString($resetUrl);
        $this->assertStringContainsString('/reset-password/'.$token.'?', $resetUrl);
        $this->assertStringContainsString('portal=admin', $resetUrl);

        DB::table('sessions')->insert([
            'id' => 'existing-browser-session',
            'user_id' => $user->getKey(),
            'payload' => 'encrypted-session-payload',
            'last_activity' => now()->timestamp,
        ]);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'lowercase-only',
            'password_confirmation' => 'lowercase-only',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'NewSecure!2026',
            'password_confirmation' => 'NewSecure!2026',
        ])->assertOk();

        $this->assertTrue(Hash::check('NewSecure!2026', $user->fresh()->password));
        $this->assertDatabaseMissing('sessions', ['id' => 'existing-browser-session']);
    }

    public function test_authenticated_password_change_uses_the_shared_policy(): void
    {
        $user = $this->adminUser();

        $this->actingAs($user)->putJson('/api/v1/auth/password', [
            'currentPassword' => 'correct-password',
            'password' => 'lowercase-only',
            'password_confirmation' => 'lowercase-only',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->assertTrue(Hash::check('correct-password', $user->fresh()->password));
    }

    private function adminUser(): User
    {
        $role = Role::query()->create([
            'slug' => RoleSlug::Admin->value,
            'name' => 'Administrator',
        ]);
        $user = User::factory()->create([
            'password' => 'correct-password',
            'can_manage_administrators' => true,
        ]);
        $user->roles()->attach($role);

        return $user;
    }

    private function studentUser(): User
    {
        $role = Role::query()->create([
            'slug' => RoleSlug::Student->value,
            'name' => 'Student Applicant',
        ]);
        $user = User::factory()->create();
        $user->roles()->attach($role);

        return $user;
    }
}
