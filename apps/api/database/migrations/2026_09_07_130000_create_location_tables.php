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
        Schema::table('student_profiles', function (Blueprint $table): void {
            $table->foreignId('barangay_id')->nullable()->constrained()->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', fn (Blueprint $table) => $table->dropConstrainedForeignId('barangay_id'));
        Schema::dropIfExists('location_syncs');
        Schema::dropIfExists('barangays');
        Schema::dropIfExists('city_municipalities');
        Schema::dropIfExists('provinces');
        Schema::dropIfExists('regions');
    }
};
