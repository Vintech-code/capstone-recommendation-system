<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

class LocalAuthUserSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException(
                'Local authentication accounts may only be seeded locally or during tests.',
            );
        }

        $defaultPassword = config('local-auth.password');

        $this->call(RoleSeeder::class);

        foreach (RoleSlug::cases() as $role) {
            $account = config("local-auth.accounts.{$role->value}");
            $rolePassword = $account['password'] ?? null;
            $password = is_string($rolePassword) && $rolePassword !== ''
                ? $rolePassword
                : $defaultPassword;

            if (! is_string($password) || $password === '') {
                throw new RuntimeException(
                    'Set LOCAL_AUTH_SEED_PASSWORD (or role-specific passwords) in apps/backend/.env before seeding local authentication accounts.',
                );
            }

            $this->seedAccount($role, $password);
        }
    }

    private function seedAccount(RoleSlug $role, string $password): void
    {
        $account = config("local-auth.accounts.{$role->value}");
        $validated = Validator::make($account, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ])->validate();

        $roleModel = Role::query()->where('slug', $role->value)->firstOrFail();
        $user = User::query()
            ->where('email', $validated['email'])
            ->with('roles')
            ->first();

        if ($user !== null && ! $user->hasRole($role)) {
            throw new RuntimeException(
                "The configured {$role->value} email already belongs to an account with a different role.",
            );
        }

        $user ??= new User;
        [$firstName, $lastName] = User::splitDisplayName($validated['name']);
        $user->fill([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $password,
            'can_manage_administrators' => $role === RoleSlug::Admin,
        ])->forceFill([
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();
        $user->roles()->syncWithoutDetaching([$roleModel->id]);
    }
}
