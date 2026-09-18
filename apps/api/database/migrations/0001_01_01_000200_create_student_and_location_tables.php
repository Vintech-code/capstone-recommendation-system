<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regions', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('provinces', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true)->index();
            $table->foreignId('region_id')->constrained()->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('city_municipalities', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true)->index();
            $table->string('type', 32);
            $table->foreignId('region_id')->constrained()->restrictOnDelete();
            $table->foreignId('province_id')->nullable()->constrained()->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('barangays', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true)->index();
            $table->string('status', 64)->nullable();
            $table->foreignId('city_municipality_id')->constrained()->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('location_syncs', function (Blueprint $table): void {
            $table->id();
            $table->timestamp('synced_at');
            $table->json('counts');
        });

        Schema::create('student_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('photo_path')->nullable();
            $table->text('lrn')->nullable();
            $table->string('lrn_lookup_hash', 64)->nullable()->unique();
            $table->text('birth_date')->nullable();
            $table->text('phone')->nullable();
            $table->text('address_line')->nullable();
            $table->text('barangay')->nullable();
            $table->text('municipality')->nullable();
            $table->text('province')->nullable();
            $table->string('shs_school_name')->nullable();
            $table->string('shs_strand', 120)->nullable();
            $table->unsignedSmallInteger('shs_graduation_year')->nullable();
            $table->json('strengths');
            $table->json('growth_areas');
            $table->json('learning_preferences');
            $table->foreignId('barangay_id')->nullable()->constrained()->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('student_saved_programmes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('programme_id', 96);
            $table->timestamps();
            $table->unique(['user_id', 'programme_id']);
            $table->index(['programme_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_saved_programmes');
        Schema::dropIfExists('student_profiles');
        Schema::dropIfExists('location_syncs');
        Schema::dropIfExists('barangays');
        Schema::dropIfExists('city_municipalities');
        Schema::dropIfExists('provinces');
        Schema::dropIfExists('regions');
    }
};
