<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entrance_examination_results', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('score', 2, 1);
            $table->string('eligibility_group', 16);
            $table->string('rule_reference', 96);
            $table->timestamp('declared_at');
            $table->timestamp('superseded_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'superseded_at']);
        });

        Schema::table('assessment_sessions', function (Blueprint $table): void {
            $table->foreignId('entrance_examination_result_id')
                ->nullable()
                ->after('user_id')
                ->constrained('entrance_examination_results')
                ->restrictOnDelete();
        });

        Schema::table('recommendation_runs', function (Blueprint $table): void {
            $table->json('entrance_examination_snapshot')->nullable()->after('rule_reference');
        });
    }

    public function down(): void
    {
        Schema::table('recommendation_runs', function (Blueprint $table): void {
            $table->dropColumn('entrance_examination_snapshot');
        });

        Schema::table('assessment_sessions', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('entrance_examination_result_id');
        });

        Schema::dropIfExists('entrance_examination_results');
    }
};
