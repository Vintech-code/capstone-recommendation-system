<?php

namespace Tests\Unit;

use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TccProgrammeCatalogueTest extends TestCase
{
    #[Test]
    public function it_provides_complete_student_guidance_for_every_programme(): void
    {
        $catalogue = $this->app->make(TccProgrammeCatalogueRepository::class)->current();

        foreach ($catalogue['programmes'] as $programme) {
            $this->assertNotEmpty($programme['description'], $programme['id']);
            $this->assertCount(4, $programme['learning_areas'], $programme['id']);
            $this->assertCount(4, $programme['learning_area_descriptions'], $programme['id']);
            $this->assertCount(4, $programme['learning_area_topics'], $programme['id']);
            foreach ($programme['learning_area_topics'] as $topics) {
                $this->assertCount(3, $topics, $programme['id']);
            }
            $this->assertCount(3, $programme['career_directions'], $programme['id']);
            $this->assertNotEmpty($programme['recommended_strands'], $programme['id']);
            $this->assertNotEmpty($programme['strand_guidance'], $programme['id']);
            $this->assertNotEmpty($programme['readiness_prompt'], $programme['id']);
        }

        $programmes = collect($catalogue['programmes'])->keyBy('id');
        $this->assertSame(
            ['STEM', 'TVL-ICT', 'GAS'],
            $programmes['bs-information-technology']['recommended_strands'],
        );
        $this->assertSame(
            ['Sports Track', 'HUMSS', 'GAS'],
            $programmes['bachelor-physical-education']['recommended_strands'],
        );
    }

    #[Test]
    public function it_preserves_the_approved_catalogue_with_temporary_research_profiles(): void
    {
        $catalogue = json_decode(
            file_get_contents(resource_path('data/tcc-programme-catalogue-v1.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        $programmes = $catalogue['programmes'];

        $this->assertSame('approved_current_scope', $catalogue['catalogue_status']);
        $this->assertSame('2026-2027', $catalogue['academic_year']);
        $this->assertSame(['R', 'I', 'A', 'S', 'E', 'C'], $catalogue['riasec_dimensions']);
        $this->assertCount(11, $programmes);
        $this->assertCount(11, array_unique(array_column($programmes, 'id')));

        $this->assertSame([
            'BS Information Technology',
            'BS Business Administration',
            'BS Criminology',
            'BS Hospitality Management',
            'Bachelor of Elementary Education',
            'Bachelor of Secondary Education',
            'BS Midwifery',
            'Bachelor of Library and Information Science',
            'BS Sociology',
            'BS Community Development',
            'Bachelor of Physical Education',
        ], array_column($programmes, 'display_name'));

        $this->assertSame([
            ['I', 'C', 'R'],
            ['E', 'C', 'S'],
            ['I', 'S', 'R'],
            ['E', 'S', 'C'],
            ['S', 'A', 'C'],
            ['S', 'A', 'I'],
            ['S', 'I', 'R'],
            ['C', 'I', 'S'],
            ['I', 'S', 'A'],
            ['S', 'E', 'A'],
            ['S', 'R', 'E'],
        ], array_column($programmes, 'riasec_profile'));

        foreach ($programmes as $programme) {
            $this->assertSame('researcher_proposed_temporary', $programme['riasec_profile_status']);
            $this->assertSame('TEMP-2026-01', $programme['profile_version']);
            $this->assertStringContainsString('Temporary researcher-proposed', $programme['profile_rationale']);
            $this->assertNull($programme['profile_approved_by']);
            $this->assertNull($programme['profile_approved_on']);
        }
    }

    #[Test]
    public function it_keeps_bped_separate_and_records_the_approved_bsed_majors(): void
    {
        $catalogue = json_decode(
            file_get_contents(resource_path('data/tcc-programme-catalogue-v1.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        $programmes = collect($catalogue['programmes'])->keyBy('id');

        $this->assertSame(
            'separate_degree_confirmed',
            $programmes['bachelor-physical-education']['major_confirmation_status'],
        );
        $this->assertSame([
            'English',
            'Filipino',
            'Social Studies / Araling Panlipunan',
        ], $programmes['bachelor-secondary-education']['majors']);
        $this->assertSame(
            'approved_current_scope',
            $programmes['bachelor-secondary-education']['major_confirmation_status'],
        );
    }

    #[Test]
    public function it_records_the_proposed_unweighted_matching_and_result_presentation_policy(): void
    {
        $catalogue = json_decode(
            file_get_contents(resource_path('data/tcc-programme-catalogue-v1.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        $policy = $catalogue['matching_policy'];

        $this->assertSame('unweighted_riasec_profile_matching', $policy['method']);
        $this->assertFalse($policy['percentage_weights_used']);
        $this->assertSame('researcher_proposed_temporary_runtime', $policy['approval_status']);
        $this->assertTrue($policy['runtime_enabled']);
        $this->assertSame('capstone_researchers', $policy['proposed_by']);
        $this->assertSame('Jason D. Ang', $policy['designated_reviewer']);
        $this->assertSame('pending', $policy['review_status']);
        $this->assertNull($policy['approval_date']);
        $this->assertSame('equal_membership_profile_mean', $policy['formula']['name']);
        $this->assertSame('proposed', $policy['formula']['status']);
        $this->assertSame(0, $policy['normalization']['output_min']);
        $this->assertSame(100, $policy['normalization']['output_max']);
        $this->assertSame(5, $policy['normalization']['instrument_min']);
        $this->assertSame(25, $policy['normalization']['instrument_max']);
        $this->assertSame('proposed_pending_instrument_version_validation', $policy['normalization']['status']);
        $this->assertTrue($policy['eligibility']['catalogue_programmes_only']);
        $this->assertTrue($policy['eligibility']['required_criteria_must_be_met']);
        $this->assertSame('pending_definition', $policy['eligibility']['programme_criteria_status']);
        $this->assertSame('display_name', $policy['tie_break']['field']);
        $this->assertSame('ascending', $policy['tie_break']['direction']);
        $this->assertSame(3, $policy['display']['default_count']);
        $this->assertTrue($policy['display']['allow_view_all']);
    }
}
