<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('instrument_code', 64);
            $table->string('status', 32)->default('in_progress');
            $table->json('answers')->nullable();
            $table->unsignedSmallInteger('current_question')->default(1);
            $table->json('result_payload')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('saved_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('result_available_at')->nullable();
            $table->timestamps();

            // One current instrument attempt per Student. A later retake policy
            // must explicitly change this constraint and preserve history.
            $table->unique(['user_id', 'instrument_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_sessions');
    }
};
