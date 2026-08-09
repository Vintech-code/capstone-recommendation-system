<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guidance_cases', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_to_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 32)->default('open');
            $table->date('follow_up_on')->nullable();
            $table->timestamps();
        });

        Schema::create('guidance_notes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('guidance_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->restrictOnDelete();
            $table->text('body');
            $table->timestamps();
            $table->index(['guidance_case_id', 'created_at']);
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
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_audit_events');
        Schema::dropIfExists('configuration_versions');
        Schema::dropIfExists('guidance_notes');
        Schema::dropIfExists('guidance_cases');
    }
};
