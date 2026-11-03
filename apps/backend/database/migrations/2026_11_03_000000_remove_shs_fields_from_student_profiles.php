<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table): void {
            $table->dropColumn(['shs_school_name', 'shs_strand', 'shs_graduation_year']);
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table): void {
            $table->string('shs_school_name')->nullable();
            $table->string('shs_strand', 120)->nullable();
            $table->unsignedSmallInteger('shs_graduation_year')->nullable();
        });
    }
};
