<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('counselor_availability_windows', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('counselor_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->string('timezone', 64)->default('Asia/Manila');
            $table->timestamps();

            $table->index(['counselor_id', 'weekday'], 'counselor_availability_day');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('counselor_availability_windows');
    }
};
