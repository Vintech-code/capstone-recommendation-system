<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_enrollments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('recommendation_run_id')->nullable()->constrained()->nullOnDelete();
            $table->string('enrolled_programme_id', 120);
            $table->string('cor_reference', 120)->nullable();
            $table->string('cor_file_path', 255)->nullable();
            $table->string('cor_original_name', 255)->nullable();
            $table->timestamp('declared_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_enrollments');
    }
};
