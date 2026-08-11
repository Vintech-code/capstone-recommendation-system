<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assessment_sessions', function (Blueprint $table): void {
            $table->text('retake_reason')->nullable()->after('previous_session_id');
        });
    }

    public function down(): void
    {
        Schema::table('assessment_sessions', function (Blueprint $table): void {
            $table->dropColumn('retake_reason');
        });
    }
};
