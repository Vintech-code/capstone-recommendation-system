<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use RuntimeException;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'app.frontend_url' => 'http://localhost:5173',
            'services.google.client_id' => 'test-client-id',
            'services.google.client_secret' => 'test-client-secret',
            'services.google.redirect' => 'http://localhost:8000/auth/google/callback',
        ]);
    }

    public function test_student_can_start_google_authentication(): void
    {
        Socialite::fake('google');

        $this->get('/auth/google/redirect')
            ->assertRedirect('https://socialite.fake/google/authorize');
    }

    public function test_verified_google_account_creates_and_authenticates_a_student(): void
    {
        Socialite::fake('google', $this->googleUser());

        $this->get('/auth/google/callback')
            ->assertRedirect('http://localhost:5173/student');

        $user = User::query()->where('email', 'new.student@example.test')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertTrue($user->hasRole(RoleSlug::Student));
        $this->assertFalse($user->hasRole(RoleSlug::Admin));
        $this->assertSame('google-student-123', $user->google_id);
        $this->assertNotNull($user->email_verified_at);
        $this->assertNotSame('', (string) $user->getRawOriginal('password'));
        $this->assertFalse(Hash::needsRehash((string) $user->getRawOriginal('password')));
        $this->assertSame(
            [RoleSlug::Student->value],
            $user->roles()->pluck('slug')->all(),
        );
        $this->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('user.photoUrl', 'https://example.test/student-avatar.png');
    }

    public function test_existing_student_is_linked_by_verified_email(): void
    {
        $student = $this->userWithRole(RoleSlug::Student, [
            'email' => 'new.student@example.test',
            'google_id' => null,
            'email_verified_at' => null,
        ]);

        Socialite::fake('google', $this->googleUser());

        $this->get('/auth/google/callback')
            ->assertRedirect('http://localhost:5173/student');

        $student->refresh();
        $this->assertAuthenticatedAs($student);
        $this->assertSame('google-student-123', $student->google_id);
        $this->assertNotNull($student->email_verified_at);
    }

    public function test_google_authentication_never_grants_a_student_role_to_staff(): void
    {
        $admin = $this->userWithRole(RoleSlug::Admin, [
            'email' => 'new.student@example.test',
        ]);

        Socialite::fake('google', $this->googleUser());

        $this->get('/auth/google/callback')
            ->assertRedirect('http://localhost:5173/student/login?google_error=portal_forbidden');

        $this->assertGuest();
        $this->assertFalse($admin->fresh()->hasRole(RoleSlug::Student));
        $this->assertNull($admin->fresh()->google_id);
    }

    public function test_suspended_student_cannot_sign_in_with_google(): void
    {
        $student = $this->userWithRole(RoleSlug::Student, [
            'email' => 'new.student@example.test',
            'account_status' => 'suspended',
        ]);

        Socialite::fake('google', $this->googleUser());

        $this->get('/auth/google/callback')
            ->assertRedirect('http://localhost:5173/student/login?google_error=account_inactive');

        $this->assertGuest();
        $this->assertNull($student->fresh()->google_id);
    }

    public function test_unverified_google_email_is_rejected(): void
    {
        Socialite::fake('google', $this->googleUser([
            'email_verified' => false,
        ]));

        $this->get('/auth/google/callback')
            ->assertRedirect('http://localhost:5173/student/login?google_error=email_unverified');

        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'new.student@example.test']);
    }

    public function test_account_already_linked_to_another_google_identity_is_rejected(): void
    {
        $student = $this->userWithRole(RoleSlug::Student, [
            'email' => 'new.student@example.test',
            'google_id' => 'different-google-id',
        ]);

        Socialite::fake('google', $this->googleUser());

        $this->get('/auth/google/callback')
            ->assertRedirect('http://localhost:5173/student/login?google_error=account_conflict');

        $this->assertGuest();
        $this->assertSame('different-google-id', $student->fresh()->google_id);
    }

    public function test_provider_failure_returns_a_safe_student_login_error(): void
    {
        Socialite::fake('google', function (): never {
            throw new RuntimeException('Provider callback failed.');
        });

        $this->get('/auth/google/callback')
            ->assertRedirect('http://localhost:5173/student/login?google_error=oauth_failed');

        $this->assertGuest();
    }

    public function test_missing_google_configuration_returns_a_safe_error(): void
    {
        config(['services.google.client_secret' => null]);

        $this->get('/auth/google/redirect')
            ->assertRedirect('http://localhost:5173/student/login?google_error=not_configured');
    }

    /** @param array<string, mixed> $overrides */
    private function googleUser(array $overrides = []): SocialiteUser
    {
        return SocialiteUser::fake(array_merge([
            'id' => 'google-student-123',
            'sub' => 'google-student-123',
            'name' => 'Google Student',
            'email' => 'new.student@example.test',
            'email_verified' => true,
            'avatar' => 'https://example.test/student-avatar.png',
        ], $overrides));
    }

    /** @param array<string, mixed> $attributes */
    private function userWithRole(RoleSlug $role, array $attributes = []): User
    {
        $roleModel = Role::query()->firstOrCreate(
            ['slug' => $role->value],
            ['name' => $role->name],
        );
        $user = User::factory()->create($attributes);
        $user->roles()->attach($roleModel);

        return $user->load('roles');
    }
}
