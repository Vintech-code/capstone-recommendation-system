<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programme_source_records', function (Blueprint $table): void {
            $table->id();
            $table->string('reference', 40)->unique();
            $table->text('source_url');
            $table->string('source_name', 255);
            $table->date('last_verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programme_source_records');
    }
};
