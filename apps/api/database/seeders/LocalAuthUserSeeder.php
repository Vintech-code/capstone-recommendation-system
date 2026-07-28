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

        $password = config('local-auth.password');

        if (! is_string($password) || $password === '') {
            throw new RuntimeException(
                'Set LOCAL_AUTH_SEED_PASSWORD in apps/api/.env before seeding local authentication accounts.',
            );
        }

        $this->call(RoleSeeder::class);

        foreach (RoleSlug::cases() as $role) {
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
        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $password,
        ])->save();
        $user->roles()->syncWithoutDetaching([$roleModel->id]);
    }
}
