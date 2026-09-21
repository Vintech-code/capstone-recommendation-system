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
            $this->assertNotEmpty($programme['career_directions'], $programme['id']);
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
    public function it_records_exact_cmo_sources_without_promoting_unsupported_programmes(): void
    {
        $catalogue = $this->app->make(TccProgrammeCatalogueRepository::class)->current();
        $programmes = collect($catalogue['programmes'])->keyBy('id');
        $sourced = [
            'bs-information-technology',
            'bs-business-administration',
            'bs-hospitality-management',
            'bachelor-elementary-education',
            'bs-midwifery',
            'bachelor-library-information-science',
            'bs-sociology',
        ];

        foreach ($sourced as $id) {
            $programme = $programmes[$id];
            $this->assertSame('ched_psg_sourced', $programme['content_status'], $id);
            $this->assertNotEmpty($programme['content_source']['source_name'], $id);
            $this->assertNotEmpty($programme['content_source']['reference'], $id);
            $documentPath = dirname(base_path(), 2).DIRECTORY_SEPARATOR.str_replace(
                '/',
                DIRECTORY_SEPARATOR,
                $programme['content_source']['document_path'],
            );
            $this->assertFileExists($documentPath, $id);
        }

        $this->assertSame('pending_local_cmo', $programmes['bs-criminology']['content_status']);
        foreach ([
            'bachelor-secondary-education-english',
            'bachelor-secondary-education-filipino',
            'bachelor-secondary-education-social-studies',
        ] as $id) {
            $this->assertSame('pending_local_cmo', $programmes[$id]['content_status']);
        }
        $this->assertSame('pending_local_cmo', $programmes['bachelor-physical-education']['content_status']);
        $this->assertSame('pending_exact_psg', $programmes['bs-community-development']['content_status']);
        $this->assertSame('BA Sociology', $programmes['bs-sociology']['display_name']);
        $this->assertSame('CHED CMO No. 40, series of 2017', $programmes['bs-sociology']['content_source']['source_name']);
    }

    #[Test]
    public function it_preserves_the_approved_catalogue_with_psg_informed_profiles_and_one_pending_programme(): void
    {
        $catalogue = json_decode(
            file_get_contents(resource_path('data/tcc-programme-catalogue-v1.json')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        $programmes = $catalogue['programmes'];

        $this->assertSame('approved_current_scope', $catalogue['catalogue_status']);
        $this->assertSame(4, $catalogue['catalogue_version']);
        $this->assertSame('2026-2027', $catalogue['academic_year']);
        $this->assertSame(['R', 'I', 'A', 'S', 'E', 'C'], $catalogue['riasec_dimensions']);
        $this->assertCount(13, $programmes);
        $this->assertCount(13, array_unique(array_column($programmes, 'id')));
        $this->assertSame(8, collect($programmes)->where('eligibility_group', 'board')->count());
        $this->assertSame(5, collect($programmes)->where('eligibility_group', 'non_board')->count());

        $this->assertSame([
            'BS Information Technology',
            'BS Business Administration - Financial Management',
            'BS Criminology',
            'BS Hospitality Management',
            'Bachelor of Elementary Education',
            'Bachelor of Secondary Education major in English',
            'Bachelor of Secondary Education major in Filipino',
            'Bachelor of Secondary Education major in Social Studies / Araling Panlipunan',
            'BS Midwifery',
            'Bachelor of Library and Information Science',
            'BA Sociology',
            'BS Community Development',
            'Bachelor of Physical Education',
        ], array_column($programmes, 'display_name'));

        $this->assertSame([
            ['I', 'R', 'C'],
            ['E', 'C', 'I'],
            ['I', 'R', 'S'],
            ['E', 'S', 'C'],
            ['S', 'A', 'C'],
            ['S', 'A', 'I'],
            ['S', 'A', 'I'],
            ['S', 'I', 'E'],
            ['S', 'I', 'R'],
            ['C', 'I', 'S'],
            ['I', 'S', 'A'],
            [],
            ['S', 'R', 'E'],
        ], array_column($programmes, 'riasec_profile'));
        $this->assertCount(
            11,
            collect($programmes)
                ->pluck('riasec_profile')
                ->filter()
                ->map(static fn (array $profile): string => implode('', $profile))
                ->unique()
                ->values(),
            'The workbook records 11 distinct ordered three-code profiles; English and Filipino share SAI.',
        );

        foreach ($programmes as $programme) {
            $expectedStatus = $programme['id'] === 'bs-community-development'
                ? 'pending_authoritative_psg_basis'
                : 'psg_informed_analytical_classification';
            $this->assertSame($expectedStatus, $programme['riasec_profile_status']);
            $this->assertSame('PSG-MATRIX-2026-09-10', $programme['profile_version']);
            $this->assertNotEmpty($programme['profile_rationale']);
            $this->assertNull($programme['profile_approved_by']);
            $this->assertNull($programme['profile_approved_on']);
        }
    }

    #[Test]
    public function it_keeps_bped_and_each_workbook_classified_bsed_major_separately_rankable(): void
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
        $expected = [
            'bachelor-secondary-education-english' => [['English'], ['S', 'A', 'I']],
            'bachelor-secondary-education-filipino' => [['Filipino'], ['S', 'A', 'I']],
            'bachelor-secondary-education-social-studies' => [['Social Studies / Araling Panlipunan'], ['S', 'I', 'E']],
        ];

        foreach ($expected as $id => [$majors, $profile]) {
            $this->assertSame($majors, $programmes[$id]['majors'], $id);
            $this->assertSame($profile, $programmes[$id]['riasec_profile'], $id);
            $this->assertSame('approved_current_scope', $programmes[$id]['major_confirmation_status'], $id);
            $this->assertSame('bachelor-secondary-education', $programmes[$id]['content_reference_id'], $id);
        }
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
        $this->assertSame('researcher_proposed_psg_informed_runtime', $policy['approval_status']);
        $this->assertTrue($policy['runtime_enabled']);
        $this->assertSame('capstone_researchers', $policy['proposed_by']);
        $this->assertSame('Jason D. Ang', $policy['designated_reviewer']);
        $this->assertSame('pending', $policy['review_status']);
        $this->assertNull($policy['approval_date']);
        $this->assertSame('equal_membership_profile_mean', $policy['formula']['name']);
        $this->assertSame('proposed', $policy['formula']['status']);
        $this->assertSame(3, $policy['formula']['profile_size_min']);
        $this->assertSame(3, $policy['formula']['profile_size_max']);
        $this->assertSame(0, $policy['normalization']['output_min']);
        $this->assertSame(100, $policy['normalization']['output_max']);
        $this->assertSame(0, $policy['normalization']['instrument_min']);
        $this->assertSame(7, $policy['normalization']['instrument_max']);
        $this->assertSame('proposed_local_binary_count_range', $policy['normalization']['status']);
        $this->assertTrue($policy['eligibility']['catalogue_programmes_only']);
        $this->assertFalse($policy['eligibility']['required_criteria_must_be_met']);
        $this->assertSame('approved_self_declared_entrance_group_v1', $policy['eligibility']['programme_criteria_status']);
        $this->assertSame('SELF-DECLARED-TCC-ENTRANCE-2026-01', $policy['eligibility']['entrance_examination_rule_reference']);
        $this->assertSame('catalogue_programmes_with_psg_classification', $policy['eligibility']['ranking_scope']);
        $this->assertSame('separate_guidance', $policy['eligibility']['eligibility_applied_as']);
        $this->assertSame('competition_rank', $policy['tie_break']['rank_policy']);
        $this->assertSame('display_name', $policy['tie_break']['field']);
        $this->assertSame('ascending', $policy['tie_break']['direction']);
        $this->assertSame(3, $policy['display']['default_count']);
        $this->assertTrue($policy['display']['allow_view_all']);
    }
}
