<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_enrollments', function (Blueprint $table): void {
            $table->string('verification_status', 24)->default('pending')->after('declared_at');
            $table->text('verification_note')->nullable()->after('verification_status');
            $table->timestamp('verified_at')->nullable()->after('verification_note');
            $table->foreignId('verified_by')->nullable()->after('verified_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('student_enrollments', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('verified_by');
            $table->dropColumn(['verification_status', 'verification_note', 'verified_at']);
        });
    }
};
