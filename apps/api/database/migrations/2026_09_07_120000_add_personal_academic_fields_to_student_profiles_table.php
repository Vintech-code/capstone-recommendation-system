<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table): void {
            $table->text('lrn')->nullable()->after('photo_path');
            $table->string('lrn_lookup_hash', 64)->nullable()->unique()->after('lrn');
            $table->text('birth_date')->nullable()->after('lrn_lookup_hash');
            $table->text('phone')->nullable()->after('birth_date');
            $table->text('address_line')->nullable()->after('phone');
            $table->text('barangay')->nullable()->after('address_line');
            $table->text('municipality')->nullable()->after('barangay');
            $table->text('province')->nullable()->after('municipality');
            $table->string('shs_school_name')->nullable()->after('province');
            $table->string('shs_strand', 120)->nullable()->after('shs_school_name');
            $table->unsignedSmallInteger('shs_graduation_year')->nullable()->after('shs_strand');
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table): void {
            $table->dropUnique(['lrn_lookup_hash']);
            $table->dropColumn([
                'lrn',
                'lrn_lookup_hash',
                'birth_date',
                'phone',
                'address_line',
                'barangay',
                'municipality',
                'province',
                'shs_school_name',
                'shs_strand',
                'shs_graduation_year',
            ]);
        });
    }
};
