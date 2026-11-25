<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programme_availabilities', function (Blueprint $table): void {
            $table->id();
            $table->string('programme_id', 120)->unique();
            $table->boolean('is_enrollment_open')->default(true);
            $table->string('status_note', 255)->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programme_availabilities');
    }
};
