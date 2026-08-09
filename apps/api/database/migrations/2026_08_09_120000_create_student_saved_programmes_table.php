<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_saved_programmes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('programme_id', 96);
            $table->timestamps();

            $table->unique(['user_id', 'programme_id']);
            $table->index(['programme_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_saved_programmes');
    }
};
