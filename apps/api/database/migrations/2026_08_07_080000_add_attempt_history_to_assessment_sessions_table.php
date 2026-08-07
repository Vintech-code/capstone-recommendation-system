<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('assessment_sessions', 'attempt_number')) {
            // MySQL may use the original composite unique index to support the
            // user foreign key. Give that foreign key a dedicated index first.
            Schema::table('assessment_sessions', function (Blueprint $table): void {
                $table->index('user_id', 'assessment_sessions_user_id_index');
            });

            Schema::table('assessment_sessions', function (Blueprint $table): void {
                $table->dropUnique(['user_id', 'instrument_code']);
                $table->unsignedSmallInteger('attempt_number')->default(1)->after('instrument_code');
                $table->boolean('is_current')->default(true)->after('status');
                $table->foreignId('previous_session_id')->nullable()->after('user_id')->constrained('assessment_sessions')->nullOnDelete();
                $table->timestamp('retake_available_at')->nullable()->after('result_available_at');
            });
        }

        Schema::table('assessment_sessions', function (Blueprint $table): void {
            if (! Schema::hasIndex('assessment_sessions', 'assessment_attempt_unique')) {
                $table->unique(['user_id', 'instrument_code', 'attempt_number'], 'assessment_attempt_unique');
            }
            if (! Schema::hasIndex('assessment_sessions', 'assessment_current_index')) {
                $table->index(['user_id', 'instrument_code', 'is_current'], 'assessment_current_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('assessment_sessions', function (Blueprint $table): void {
            $table->dropIndex('assessment_current_index');
            $table->dropUnique('assessment_attempt_unique');
            $table->dropConstrainedForeignId('previous_session_id');
            $table->dropColumn(['attempt_number', 'is_current', 'retake_available_at']);
            $table->unique(['user_id', 'instrument_code']);
            $table->dropIndex('assessment_sessions_user_id_index');
        });
    }
};
