<?php

use App\Models\RoleSlug;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('can_manage_administrators')->default(false)->after('must_change_password');
        });

        Schema::create('administrator_invitations', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('pending_email')->nullable()->unique();
            $table->char('token_hash', 64)->unique();
            $table->boolean('can_manage_administrators')->default(false);
            $table->foreignId('invited_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('expires_at');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
            $table->index(['email', 'accepted_at', 'revoked_at'], 'administrator_invitations_email_state_index');
        });

        $adminRoleId = DB::table('roles')->where('slug', RoleSlug::Admin->value)->value('id');
        if ($adminRoleId !== null) {
            DB::table('users')
                ->whereIn('id', DB::table('role_user')->select('user_id')->where('role_id', $adminRoleId))
                ->update(['can_manage_administrators' => true]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('administrator_invitations');
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('can_manage_administrators');
        });
    }
};
