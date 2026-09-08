<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_instruments', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 64)->unique();
            $table->string('version', 64);
            $table->string('name');
            $table->text('instructions');
            $table->string('scoring_method', 64);
            $table->string('status', 32)->default('proposed');
            $table->string('source_name')->nullable();
            $table->string('source_asset')->nullable();
            $table->text('source_url')->nullable();
            $table->date('source_accessed_on')->nullable();
            $table->json('scoring_config')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::create('assessment_questions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('assessment_instrument_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('position');
            $table->unsignedSmallInteger('source_number');
            $table->char('riasec_code', 1);
            $table->text('prompt');
            $table->timestamps();

            $table->unique(
                ['assessment_instrument_id', 'position'],
                'assessment_questions_instrument_position_unique',
            );
            $table->unique(
                ['assessment_instrument_id', 'source_number'],
                'assessment_questions_instrument_source_unique',
            );
        });

        $now = now();
        $instrumentId = DB::table('assessment_instruments')->insertGetId([
            'code' => 'tcc-uhcc-riasec-42-v1',
            'version' => 'riasec-assessment-asset-v1',
            'name' => 'RIASEC Interest Checklist',
            'instructions' => 'Read each statement and choose whether you agree. There are no right or wrong answers; answer honestly based on your interests.',
            'scoring_method' => 'binary-category-count',
            'status' => 'proposed',
            'source_name' => 'University of Hawai‘i Community Colleges Career Explorer',
            'source_asset' => 'apps/web/src/assets/questionnaires/riasec-assessment.png',
            'source_url' => 'https://careerexplorer.hawaii.edu/assessments/riasec_multiLang.php',
            'source_accessed_on' => '2026-09-08',
            'scoring_config' => json_encode([
                'agree_value' => 1,
                'do_not_agree_value' => 2,
                'minimum_per_area' => 0,
                'maximum_per_area' => 7,
                'formula' => 'For each RIASEC area, count 1 for every mapped statement answered Agree and 0 for Do not agree.',
            ], JSON_THROW_ON_ERROR),
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $questions = [
            [1, 'R', 'I like to work on cars'],
            [2, 'I', 'I like to do puzzles'],
            [3, 'A', 'I am good at working independently'],
            [4, 'S', 'I like to work in teams'],
            [5, 'E', 'I am an ambitious person, I set goals for myself'],
            [6, 'C', 'I like to organize things (files, desks/offices)'],
            [7, 'R', 'I like to build things'],
            [8, 'A', 'I like to read about art and music'],
            [9, 'C', 'I like to have clear instructions to follow'],
            [10, 'E', 'I like to try to influence or persuade people'],
            [11, 'I', 'I like to do experiments'],
            [12, 'S', 'I like to teach or train people'],
            [13, 'S', 'I like trying to help people solve their problems'],
            [14, 'R', 'I like to take care of animals'],
            [15, 'C', "I wouldn't mind working 8 hours per day in an office"],
            [16, 'E', 'I like selling things'],
            [17, 'A', 'I enjoy creative writing'],
            [18, 'I', 'I enjoy science'],
            [19, 'E', 'I am quick to take on new responsibilities'],
            [20, 'S', 'I am interested in healing people'],
            [21, 'I', 'I enjoy trying to figure out how things work'],
            [22, 'R', 'I like putting things together or assembling things'],
            [23, 'A', 'I am a creative person'],
            [24, 'C', 'I pay attention to details'],
            [25, 'C', 'I like to do filing or typing'],
            [26, 'I', 'I like to analyze things (problems/situations)'],
            [27, 'A', 'I like to play instruments or sing'],
            [28, 'S', 'I enjoy learning about other cultures'],
            [29, 'E', 'I would like to start my own business'],
            [30, 'R', 'I like to cook'],
            [31, 'A', 'I like acting in plays'],
            [32, 'R', 'I am a practical person'],
            [33, 'I', 'I like working with numbers or charts'],
            [34, 'S', 'I like to get into discussions about issues'],
            [35, 'C', 'I am good at keeping records of my work'],
            [36, 'E', 'I like to lead'],
            [37, 'R', 'I like working outdoors'],
            [38, 'C', 'I would like to work in an office'],
            [39, 'I', "I'm good at math"],
            [40, 'S', 'I like helping people'],
            [41, 'A', 'I like to draw'],
            [42, 'E', 'I like to give speeches'],
        ];

        DB::table('assessment_questions')->insert(array_map(
            static fn (array $question, int $offset): array => [
                'assessment_instrument_id' => $instrumentId,
                'position' => $offset + 1,
                'source_number' => $question[0],
                'riasec_code' => $question[1],
                'prompt' => $question[2],
                'created_at' => $now,
                'updated_at' => $now,
            ],
            $questions,
            array_keys($questions),
        ));
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_questions');
        Schema::dropIfExists('assessment_instruments');
    }
};
