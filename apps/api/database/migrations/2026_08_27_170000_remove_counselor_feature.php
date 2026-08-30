<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $counselorRoleId = DB::table('roles')->where('slug', 'counselor')->value('id');

        if ($counselorRoleId !== null) {
            $counselorUserIds = DB::table('role_user')
                ->where('role_id', $counselorRoleId)
                ->pluck('user_id');

            $exclusiveCounselorUserIds = $counselorUserIds
                ->filter(static fn ($userId): bool => ! DB::table('role_user')
                    ->where('user_id', $userId)
                    ->where('role_id', '!=', $counselorRoleId)
                    ->exists());

            DB::table('sessions')->whereIn('user_id', $counselorUserIds)->delete();
            DB::table('personal_access_tokens')
                ->where('tokenable_type', 'App\\Models\\User')
                ->whereIn('tokenable_id', $counselorUserIds)
                ->delete();
            DB::table('users')->whereIn('id', $exclusiveCounselorUserIds)->update([
                'account_status' => 'suspended',
                'status_changed_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('role_user')->where('role_id', $counselorRoleId)->delete();
            DB::table('roles')->where('id', $counselorRoleId)->delete();
        }

        DB::table('notification_dispatches')
            ->where('event_type', 'like', 'guidance_%')
            ->orWhere('subject_type', 'like', 'guidance_%')
            ->delete();
        DB::table('notifications')->where('data', 'like', '%guidance_%')->delete();

        Schema::dropIfExists('guidance_request_events');
        Schema::dropIfExists('guidance_summaries');
        Schema::dropIfExists('guidance_notes');
        Schema::dropIfExists('guidance_requests');
        Schema::dropIfExists('guidance_cases');
    }

    public function down(): void
    {
        DB::table('roles')->updateOrInsert(
            ['slug' => 'counselor'],
            ['name' => 'Counselor', 'created_at' => now(), 'updated_at' => now()],
        );

        Schema::create('guidance_cases', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_to_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 32)->default('open');
            $table->date('follow_up_on')->nullable();
            $table->timestamps();
        });

        Schema::create('guidance_notes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('guidance_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->restrictOnDelete();
            $table->text('body');
            $table->timestamps();
            $table->index(['guidance_case_id', 'created_at']);
        });

        Schema::create('guidance_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('programme_id', 96)->nullable();
            $table->string('concern_category', 48)->default('general_guidance');
            $table->text('message');
            $table->string('preferred_format', 24)->default('in_person');
            $table->date('preferred_date')->nullable();
            $table->string('status', 24)->default('pending');
            $table->foreignId('accepted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->text('resolution_reason')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
            $table->index(['student_id', 'status']);
            $table->index(['accepted_by', 'status'], 'guidance_request_owner_status');
        });

        Schema::create('guidance_request_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('guidance_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('users')->restrictOnDelete();
            $table->string('event_type', 32);
            $table->string('from_status', 24)->nullable();
            $table->string('to_status', 24);
            $table->text('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['guidance_request_id', 'created_at'], 'guidance_request_timeline');
        });

        Schema::create('guidance_summaries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('guidance_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->restrictOnDelete();
            $table->text('body');
            $table->foreignId('published_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index(['guidance_case_id', 'published_at']);
        });

        // Removed records, role assignments, and prior account state cannot be
        // reconstructed by rollback. Restore a backup if that history is needed.
    }
};
