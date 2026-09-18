<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BackendCleanBaselineTest extends TestCase
{
    use RefreshDatabase;

    public function test_clean_schema_excludes_superseded_role_and_workflow_storage(): void
    {
        $this->assertTrue(Schema::hasTable('roles'));
        $this->assertTrue(Schema::hasTable('assessment_sessions'));
        $this->assertFalse(Schema::hasColumn('users', 'must_change_password'));

        foreach ([
            'personal_access_tokens',
            'programme_source_records',
            'guidance_cases',
            'guidance_appointments',
            'guidance_requests',
            'counselor_availability_windows',
        ] as $removedTable) {
            $this->assertFalse(Schema::hasTable($removedTable), $removedTable.' should not exist.');
        }
    }

    public function test_removed_duplicate_endpoints_are_not_routable(): void
    {
        $this->getJson('/api/v1/auth/me')->assertNotFound();
        $this->postJson('/api/v1/student/assessments/riasec/results')->assertNotFound();
        $this->getJson('/api/v1/student/profile/riasec-result')->assertNotFound();
        $this->getJson('/api/v1/admin/programme-sources')->assertNotFound();
        $this->postJson('/api/v1/admin/configurations/versions/1/rollback')->assertNotFound();
    }
}
