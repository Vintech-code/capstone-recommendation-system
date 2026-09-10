<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recommendation_runs', function (Blueprint $table): void {
            $table->json('unranked_programmes')->nullable()->after('ranked_courses');
        });
    }

    public function down(): void
    {
        Schema::table('recommendation_runs', function (Blueprint $table): void {
            $table->dropColumn('unranked_programmes');
        });
    }
};
