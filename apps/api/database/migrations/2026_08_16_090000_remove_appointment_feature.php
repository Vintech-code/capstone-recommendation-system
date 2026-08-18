<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('guidance_requests')->where('status', 'scheduled')->update(['status' => 'accepted']);
        DB::table('notification_dispatches')
            ->where('subject_type', 'guidance_appointment')
            ->orWhere('event_type', 'appointment_reminder')
            ->delete();
        DB::table('notifications')
            ->where('data', 'like', '%appointment_%')
            ->delete();

        Schema::table('guidance_requests', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('appointment_id');
        });
        Schema::dropIfExists('guidance_appointment_events');
        Schema::dropIfExists('counselor_availability_windows');
        Schema::dropIfExists('guidance_appointments');
    }

    public function down(): void
    {
        Schema::create('guidance_appointments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('counselor_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->dateTime('scheduled_at');
            $table->dateTime('ends_at')->nullable();
            $table->string('topic', 160);
            $table->string('programme_code', 32)->nullable();
            $table->string('status', 24)->default('scheduled');
            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('student_confirmed_at')->nullable();
            $table->timestamps();
            $table->index(['counselor_id', 'scheduled_at']);
            $table->index(['student_id', 'scheduled_at']);
            $table->index(['status', 'scheduled_at']);
            $table->index(['counselor_id', 'scheduled_at', 'ends_at'], 'appointment_counselor_window');
        });
        Schema::create('guidance_appointment_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('guidance_appointment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('users')->restrictOnDelete();
            $table->string('event_type', 32);
            $table->string('from_status', 24)->nullable();
            $table->string('to_status', 24);
            $table->dateTime('previous_scheduled_at')->nullable();
            $table->dateTime('previous_ends_at')->nullable();
            $table->dateTime('scheduled_at')->nullable();
            $table->dateTime('ends_at')->nullable();
            $table->text('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['guidance_appointment_id', 'created_at'], 'appointment_event_timeline');
        });
        Schema::create('counselor_availability_windows', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('counselor_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->string('timezone', 64)->default('Asia/Manila');
            $table->timestamps();
            $table->index(['counselor_id', 'weekday'], 'counselor_availability_day');
        });
        Schema::table('guidance_requests', function (Blueprint $table): void {
            $table->foreignId('appointment_id')->nullable()->after('status')->constrained('guidance_appointments')->nullOnDelete();
        });
    }
};
