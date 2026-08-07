<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommendation_runs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assessment_session_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('catalogue_reference', 96);
            $table->string('rule_reference', 96);
            $table->string('methodology_status', 64);
            $table->unsignedSmallInteger('default_count')->default(3);
            $table->unsignedSmallInteger('total_eligible');
            $table->json('ranked_courses');
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->index(['user_id', 'generated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendation_runs');
    }
};
