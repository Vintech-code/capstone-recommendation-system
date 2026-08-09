<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guidance_requests', function (Blueprint $table): void {
            $table->string('concern_category', 48)->default('general_guidance')->after('programme_id');
            $table->string('preferred_format', 24)->default('in_person')->after('message');
            $table->date('preferred_date')->nullable()->after('preferred_format');
            $table->foreignId('accepted_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->timestamp('accepted_at')->nullable()->after('accepted_by');
            $table->timestamp('closed_at')->nullable()->after('appointment_id');
            $table->text('resolution_reason')->nullable()->after('closed_at');
            $table->index(['accepted_by', 'status'], 'guidance_request_owner_status');
        });

        Schema::create('guidance_request_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('guidance_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('users')->restrictOnDelete();
            $table->string('event_type', 32);
            $table->string('from_status', 24)->nullable();
            $table->string('to_status', 24);
            $table->text('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['guidance_request_id', 'created_at'], 'guidance_request_timeline');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guidance_request_events');
        Schema::table('guidance_requests', function (Blueprint $table): void {
            $table->dropIndex('guidance_request_owner_status');
            $table->dropConstrainedForeignId('accepted_by');
            $table->dropColumn(['concern_category', 'preferred_format', 'preferred_date', 'accepted_at', 'closed_at', 'resolution_reason']);
        });
    }
};
