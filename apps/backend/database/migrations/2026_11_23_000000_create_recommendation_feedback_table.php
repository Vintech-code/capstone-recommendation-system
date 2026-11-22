<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommendation_feedback', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recommendation_run_id')->constrained()->cascadeOnDelete();
            $table->string('programme_id', 128);
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(
                ['user_id', 'recommendation_run_id', 'programme_id'],
                'recommendation_feedback_student_run_programme_unique',
            );
            $table->index(['recommendation_run_id', 'programme_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendation_feedback');
    }
};
