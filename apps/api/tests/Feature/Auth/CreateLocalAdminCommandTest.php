<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateLocalAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_local_admin_without_committed_credentials(): void
    {
        Role::query()->create([
            'slug' => RoleSlug::Admin->value,
            'name' => 'Guidance / Psychometrician / Admin',
        ]);

        $this->artisan('auth:create-local-admin', [
            'email' => 'admin@example.test',
        ])
            ->expectsQuestion('Name', 'Local Admin')
            ->expectsQuestion('Password', 'local-password')
            ->expectsOutput('Local Admin account created.')
            ->assertSuccessful();

        $user = User::query()
            ->where('email', 'admin@example.test')
            ->with('roles')
            ->firstOrFail();

        $this->assertTrue(Hash::check('local-password', $user->password));
        $this->assertTrue($user->hasRole(RoleSlug::Admin));
    }

    public function test_it_refuses_to_replace_an_existing_account(): void
    {
        User::factory()->create(['email' => 'admin@example.test']);

        $this->artisan('auth:create-local-admin', [
            'email' => 'admin@example.test',
        ])
            ->expectsQuestion('Name', 'Local Admin')
            ->expectsQuestion('Password', 'replacement-password')
            ->expectsOutput('An account with that email address already exists.')
            ->assertFailed();
    }
}
