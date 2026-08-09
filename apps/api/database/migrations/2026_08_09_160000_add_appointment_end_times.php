<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guidance_appointments', function (Blueprint $table): void {
            $table->dateTime('ends_at')->nullable()->after('scheduled_at');
            $table->index(['counselor_id', 'scheduled_at', 'ends_at'], 'appointment_counselor_window');
        });

        Schema::table('guidance_appointment_events', function (Blueprint $table): void {
            $table->dateTime('previous_ends_at')->nullable()->after('previous_scheduled_at');
            $table->dateTime('ends_at')->nullable()->after('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::table('guidance_appointment_events', function (Blueprint $table): void {
            $table->dropColumn(['previous_ends_at', 'ends_at']);
        });
        Schema::table('guidance_appointments', function (Blueprint $table): void {
            $table->dropIndex('appointment_counselor_window');
            $table->dropColumn('ends_at');
        });
    }
};
