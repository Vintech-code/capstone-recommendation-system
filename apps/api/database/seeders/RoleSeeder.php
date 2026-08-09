<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\RoleSlug;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (RoleSlug::cases() as $role) {
            Role::query()->updateOrCreate(
                ['slug' => $role->value],
                ['name' => match ($role) {
                    RoleSlug::Student => 'Student Applicant',
                    RoleSlug::Admin => 'Administrator',
                    RoleSlug::Counselor => 'Counselor',
                }],
            );
        }
    }
}
