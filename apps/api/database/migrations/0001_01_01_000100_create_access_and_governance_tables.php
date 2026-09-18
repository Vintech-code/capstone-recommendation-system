<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table): void {
            $table->id();
            $table->enum('slug', ['student', 'admin'])->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('role_user', function (Blueprint $table): void {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['role_id', 'user_id']);
        });

        Schema::create('administrator_invitations', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('pending_email')->nullable()->unique();
            $table->char('token_hash', 64)->unique();
            $table->boolean('can_manage_administrators')->default(false);
            $table->foreignId('invited_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('expires_at');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
            $table->index(['email', 'accepted_at', 'revoked_at'], 'administrator_invitations_email_state_index');
        });

        Schema::create('configuration_versions', function (Blueprint $table): void {
            $table->id();
            $table->string('kind', 32);
            $table->unsignedInteger('version');
            $table->string('status', 24)->default('draft');
            $table->string('academic_year', 16)->nullable();
            $table->json('payload');
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('published_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->unique(['kind', 'version']);
            $table->index(['kind', 'status']);
        });

        Schema::create('admin_audit_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('actor_id')->constrained('users')->restrictOnDelete();
            $table->string('action', 80);
            $table->string('subject_type', 64);
            $table->string('subject_reference', 120);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['created_at', 'action']);
        });

        Schema::create('notifications', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

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
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('admin_audit_events');
        Schema::dropIfExists('configuration_versions');
        Schema::dropIfExists('administrator_invitations');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('roles');
    }
};
