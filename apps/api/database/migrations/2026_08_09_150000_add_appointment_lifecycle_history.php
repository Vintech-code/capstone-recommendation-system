<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guidance_appointments', function (Blueprint $table): void {
            $table->text('cancellation_reason')->nullable()->after('notes');
            $table->timestamp('student_confirmed_at')->nullable()->after('cancellation_reason');
        });

        Schema::create('guidance_appointment_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('guidance_appointment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('users')->restrictOnDelete();
            $table->string('event_type', 32);
            $table->string('from_status', 24)->nullable();
            $table->string('to_status', 24);
            $table->dateTime('previous_scheduled_at')->nullable();
            $table->dateTime('scheduled_at')->nullable();
            $table->text('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['guidance_appointment_id', 'created_at'], 'appointment_event_timeline');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guidance_appointment_events');
        Schema::table('guidance_appointments', function (Blueprint $table): void {
            $table->dropColumn(['cancellation_reason', 'student_confirmed_at']);
        });
    }
};
