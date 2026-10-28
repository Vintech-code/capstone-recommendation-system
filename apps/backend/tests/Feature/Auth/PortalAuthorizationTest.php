<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_each_approved_role_can_access_only_its_portal_boundary(): void
    {
        foreach (RoleSlug::cases() as $role) {
            $user = $this->userWithRole($role);

            $this->actingAs($user)
                ->getJson("/api/v1/auth/authorize/{$role->value}")
                ->assertOk()
                ->assertExactJson([
                    'authorized' => true,
                    'portal' => $role->value,
                ]);

            foreach (RoleSlug::cases() as $otherRole) {
                if ($otherRole === $role) {
                    continue;
                }

                $this->actingAs($user)
                    ->getJson("/api/v1/auth/authorize/{$otherRole->value}")
                    ->assertForbidden()
                    ->assertJsonPath('error.code', 'ROLE_FORBIDDEN');
            }
        }
    }

    public function test_portal_boundaries_reject_unauthenticated_requests(): void
    {
        foreach (RoleSlug::cases() as $role) {
            $this->getJson("/api/v1/auth/authorize/{$role->value}")
                ->assertUnauthorized()
                ->assertJsonPath('error.code', 'AUTHENTICATION_REQUIRED');
        }
    }

    public function test_an_account_cannot_hold_multiple_role_assignments(): void
    {
        $user = User::factory()->create();
        $student = Role::query()->create(['slug' => RoleSlug::Student->value, 'name' => RoleSlug::Student->name]);
        $admin = Role::query()->create(['slug' => RoleSlug::Admin->value, 'name' => RoleSlug::Admin->name]);
        $user->roles()->attach($student);

        $this->expectException(UniqueConstraintViolationException::class);
        $user->roles()->attach($admin);
    }

    private function userWithRole(RoleSlug $role): User
    {
        $roleModel = Role::query()->updateOrCreate([
            'slug' => $role->value,
            'name' => $role->name,
        ]);
        $user = User::factory()->create();
        $user->roles()->attach($roleModel);

        return $user;
    }
}
