<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CreateLocalAdmin extends Command
{
    protected $signature = 'auth:create-local-admin {email?}';

    protected $description = 'Create a local Administrator account';

    public function handle(): int
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->error('This command is available only in the local environment.');

            return self::FAILURE;
        }

        $email = (string) ($this->argument('email') ?: $this->ask('Email address'));
        $name = (string) $this->ask('Name');
        $password = (string) $this->secret('Password');

        $validator = Validator::make(
            compact('email', 'name', 'password'),
            [
                'email' => ['required', 'email'],
                'name' => ['required', 'string'],
                'password' => ['required', 'string'],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        if (User::query()->where('email', $email)->exists()) {
            $this->error('An account with that email address already exists.');

            return self::FAILURE;
        }

        $role = Role::query()->where('slug', RoleSlug::Admin->value)->first();
        if (! $role) {
            $this->error('The Admin role is missing. Run php artisan db:seed first.');

            return self::FAILURE;
        }

        $user = User::query()->create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ]);
        $user->roles()->attach($role);

        $this->info('Local Admin account created.');

        return self::SUCCESS;
    }
}
