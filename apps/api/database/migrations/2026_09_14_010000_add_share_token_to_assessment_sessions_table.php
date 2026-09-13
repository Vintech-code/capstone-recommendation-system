<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('assessment_sessions', function (Blueprint $table): void {
            $table->string('share_token', 64)->nullable()->unique()->after('retake_reason');
            $table->timestamp('shared_at')->nullable()->after('share_token');
        });
    }

    public function down(): void
    {
        Schema::table('assessment_sessions', function (Blueprint $table): void {
            $table->dropColumn(['share_token', 'shared_at']);
        });
    }
};

