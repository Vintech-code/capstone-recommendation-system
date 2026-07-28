<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
