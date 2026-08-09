<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guidance_appointments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('counselor_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->dateTime('scheduled_at');
            $table->string('topic', 160);
            $table->string('programme_code', 32)->nullable();
            $table->string('status', 24)->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['counselor_id', 'scheduled_at']);
            $table->index(['student_id', 'scheduled_at']);
            $table->index(['status', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guidance_appointments');
    }
};
