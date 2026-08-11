<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_dispatches', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
            $table->string('event_type', 64);
            $table->string('subject_type', 64);
            $table->string('subject_reference', 120);
            $table->string('deduplication_key', 160)->unique();
            $table->string('open_key', 160)->nullable()->unique();
            $table->timestamp('scheduled_for');
            $table->string('status', 24)->default('pending');
            $table->json('payload');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('invalidated_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'scheduled_for']);
            $table->index(['subject_type', 'subject_reference']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_dispatches');
    }
};
