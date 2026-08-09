<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('must_change_password')->default(false)->after('password');
        });

        DB::table('roles')->where('slug', 'admin')->update(['name' => 'Administrator']);
        $systemAdminId = DB::table('roles')->where('slug', 'system-admin')->value('id');
        if ($systemAdminId) {
            DB::table('role_user')->where('role_id', $systemAdminId)->delete();
            DB::table('roles')->where('id', $systemAdminId)->delete();
        }
        DB::table('roles')->updateOrInsert(
            ['slug' => 'counselor'],
            ['name' => 'Counselor', 'created_at' => now(), 'updated_at' => now()],
        );
    }

    public function down(): void
    {
        $counselorId = DB::table('roles')->where('slug', 'counselor')->value('id');
        if ($counselorId) {
            DB::table('role_user')->where('role_id', $counselorId)->delete();
            DB::table('roles')->where('id', $counselorId)->delete();
        }
        DB::table('roles')->updateOrInsert(
            ['slug' => 'system-admin'],
            ['name' => 'System Administrator', 'created_at' => now(), 'updated_at' => now()],
        );
        DB::table('roles')->where('slug', 'admin')->update(['name' => 'Guidance / Psychometrician / Admin']);

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('must_change_password');
        });
    }
};
