<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Existing LRN and self-reported learning-profile values cannot be mapped truthfully to the replacement contract.
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table): void {
            $table->dropUnique('student_profiles_lrn_lookup_hash_unique');
            $table->dropColumn([
                'lrn',
                'lrn_lookup_hash',
                'strengths',
                'growth_areas',
                'learning_preferences',
            ]);
        });

        Schema::table('student_profiles', function (Blueprint $table): void {
            $table->text('id_number')->nullable()->after('photo_path');
            $table->string('id_number_lookup_hash', 64)->nullable()->unique()->after('id_number');
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table): void {
            $table->dropUnique('student_profiles_id_number_lookup_hash_unique');
            $table->dropColumn(['id_number', 'id_number_lookup_hash']);
        });

        Schema::table('student_profiles', function (Blueprint $table): void {
            $table->text('lrn')->nullable()->after('photo_path');
            $table->string('lrn_lookup_hash', 64)->nullable()->unique()->after('lrn');
            $table->json('strengths')->nullable();
            $table->json('growth_areas')->nullable();
            $table->json('learning_preferences')->nullable();
        });
    }
};
