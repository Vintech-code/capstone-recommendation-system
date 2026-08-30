<?php

namespace Tests\Feature\Auth;

use App\Models\RoleSlug;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\LocalAuthUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Tests\TestCase;

class LocalAuthUserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_one_local_sign_in_account_for_each_approved_role(): void
    {
        config()->set('local-auth.password', 'local-test-password');

        app(LocalAuthUserSeeder::class)->run();

        $roleCount = count(RoleSlug::cases());
        $this->assertDatabaseCount('roles', $roleCount);
        $this->assertDatabaseCount('users', $roleCount);
        $this->assertDatabaseCount('role_user', $roleCount);

        foreach (RoleSlug::cases() as $role) {
            $email = config("local-auth.accounts.{$role->value}.email");
            $user = User::query()
                ->where('email', $email)
                ->with('roles')
                ->firstOrFail();

            $this->assertTrue($user->hasRole($role));
            $this->assertTrue(Hash::check('local-test-password', $user->password));
        }
    }

    public function test_it_is_idempotent_and_refreshes_the_configured_local_password(): void
    {
        config()->set('local-auth.password', 'first-local-password');
        $this->seed(LocalAuthUserSeeder::class);

        config()->set('local-auth.password', 'second-local-password');
        $this->seed(LocalAuthUserSeeder::class);

        $roleCount = count(RoleSlug::cases());
        $this->assertDatabaseCount('users', $roleCount);
        $this->assertDatabaseCount('role_user', $roleCount);

        User::query()->each(function (User $user): void {
            $this->assertTrue(
                Hash::check('second-local-password', $user->password),
            );
        });
    }

    public function test_it_requires_a_password_from_the_local_environment(): void
    {
        config()->set('local-auth.password');

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Set LOCAL_AUTH_SEED_PASSWORD');

        $this->seed(LocalAuthUserSeeder::class);
    }

    public function test_it_refuses_to_reassign_an_existing_conflicting_account(): void
    {
        config()->set('local-auth.password', 'local-test-password');
        $studentEmail = config('local-auth.accounts.student.email');
        $user = User::factory()->create(['email' => $studentEmail]);

        try {
            $this->seed(LocalAuthUserSeeder::class);
            $this->fail('The seeder should reject a conflicting account.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString(
                'already belongs to an account with a different role',
                $exception->getMessage(),
            );
        }

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_it_refuses_to_seed_sign_in_accounts_in_production(): void
    {
        config()->set('local-auth.password', 'local-test-password');
        app()->detectEnvironment(fn (): string => 'production');

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('may only be seeded locally or during tests');

        app(LocalAuthUserSeeder::class)->run();
    }

    public function test_the_main_database_seeder_does_not_create_sign_in_accounts_by_default(): void
    {
        config()->set('local-auth.seed_enabled', false);

        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseCount('roles', count(RoleSlug::cases()));
        $this->assertDatabaseCount('users', 0);
    }

    public function test_the_main_database_seeder_creates_local_accounts_when_enabled(): void
    {
        config()->set('local-auth.seed_enabled', true);
        config()->set('local-auth.password', 'local-test-password');

        $this->seed(DatabaseSeeder::class);

        $roleCount = count(RoleSlug::cases());
        $this->assertDatabaseCount('roles', $roleCount);
        $this->assertDatabaseCount('users', $roleCount);
        $this->assertDatabaseCount('role_user', $roleCount);
    }
}
