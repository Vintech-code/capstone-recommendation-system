<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assessment_sessions', function (Blueprint $table): void {
            $table->string('processing_error_code', 64)->nullable()->after('result_available_at');
            $table->timestamp('processing_failed_at')->nullable()->after('processing_error_code');
        });
    }

    public function down(): void
    {
        Schema::table('assessment_sessions', function (Blueprint $table): void {
            $table->dropColumn(['processing_error_code', 'processing_failed_at']);
        });
    }
};
