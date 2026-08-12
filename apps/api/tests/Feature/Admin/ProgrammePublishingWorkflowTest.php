<?php

namespace Tests\Feature\Admin;

use App\Models\AdminAuditEvent;
use App\Models\NotificationDispatch;
use App\Models\ProgrammeSourceRecord;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\StudentSavedProgramme;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgrammePublishingWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_previews_exact_catalogue_changes_before_publishing(): void
    {
        $admin = $this->admin();
        $draft = $this->actingAs($admin)->postJson('/api/v1/admin/configurations/catalogue')
            ->assertCreated()->json('data');
        $draft['payload']['programmes'][0]['description'] = 'Reviewed student-visible description.';
        $draft['payload']['programmes'][0]['cover_image_position'] = ['x' => 65, 'y' => 40, 'zoom' => 1.3];
        $draft['payload']['programmes'][0]['duration'] = ['display' => '99 years'];

        $this->actingAs($admin)->postJson("/api/v1/admin/configurations/versions/{$draft['id']}/preview", [
            'payload' => $draft['payload'],
        ])->assertOk()
            ->assertJsonPath('data.hasChanges', true)
            ->assertJsonPath('data.changedProgrammeCount', 1)
            ->assertJsonPath('data.programmeChanges.0.programmeId', 'bs-information-technology')
            ->assertJsonFragment(['field' => 'description', 'after' => 'Reviewed student-visible description.'])
            ->assertJsonFragment(['field' => 'cover_image_position', 'after' => ['x' => 65, 'y' => 40, 'zoom' => 1.3]])
            ->assertJsonMissing(['field' => 'duration', 'after' => ['display' => '99 years']]);
    }

    public function test_catalogue_rejects_invalid_media_framing_values(): void
    {
        $admin = $this->admin();
        $draft = $this->actingAs($admin)->postJson('/api/v1/admin/configurations/catalogue')
            ->assertCreated()->json('data');
        $draft['payload']['programmes'][0]['cover_image_position'] = ['x' => 120, 'y' => 50, 'zoom' => 4];

        $this->actingAs($admin)->putJson("/api/v1/admin/configurations/versions/{$draft['id']}", [
            'payload' => $draft['payload'],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('payload.programmes.cover_image_position');
    }

    public function test_rollback_creates_an_auditable_new_draft_without_rewriting_history(): void
    {
        $admin = $this->admin();
        $versionOne = $this->actingAs($admin)->postJson('/api/v1/admin/configurations/catalogue')
            ->assertCreated()->json('data');
        $this->actingAs($admin)->postJson("/api/v1/admin/configurations/versions/{$versionOne['id']}/publish")->assertOk();

        $versionTwo = $this->actingAs($admin)->postJson('/api/v1/admin/configurations/catalogue', [
            'sourceVersionId' => $versionOne['id'],
        ])->assertCreated()->json('data');
        $versionTwo['payload']['programmes'][0]['description'] = 'Second published version.';
        $this->actingAs($admin)->putJson("/api/v1/admin/configurations/versions/{$versionTwo['id']}", ['payload' => $versionTwo['payload']])->assertOk();
        $this->actingAs($admin)->postJson("/api/v1/admin/configurations/versions/{$versionTwo['id']}/publish")->assertOk();

        $restored = $this->actingAs($admin)->postJson("/api/v1/admin/configurations/versions/{$versionOne['id']}/rollback")
            ->assertCreated()
            ->assertJsonPath('data.version', 3)
            ->assertJsonPath('data.status', 'draft')
            ->json('data');

        $this->assertSame($versionOne['payload'], $restored['payload']);
        $this->assertDatabaseHas('configuration_versions', ['id' => $versionOne['id'], 'status' => 'archived']);
        $this->assertDatabaseHas('configuration_versions', ['id' => $versionTwo['id'], 'status' => 'published']);
        $this->assertDatabaseHas('admin_audit_events', [
            'action' => 'configuration.rollback_draft_created',
            'subject_reference' => 'catalogue-v3',
        ]);
    }

    public function test_source_registry_uses_recorded_catalogue_metadata_and_audits_verification_date(): void
    {
        $admin = $this->admin();
        $sources = $this->actingAs($admin)->getJson('/api/v1/admin/programme-sources')
            ->assertOk()
            ->assertJsonFragment(['sourceName' => 'CHED CMO No. 25, series of 2015'])
            ->json('data');
        $source = collect($sources)->firstWhere('sourceName', 'CHED CMO No. 25, series of 2015');
        $this->assertSame('not_verified', $source['reviewStatus']);
        $this->assertSame(180, $source['reviewIntervalDays']);

        $this->actingAs($admin)->putJson("/api/v1/admin/programme-sources/{$source['reference']}", [
            'lastVerifiedAt' => '2026-08-11',
        ])->assertOk()
            ->assertJsonPath('data.lastVerifiedAt', '2026-08-11')
            ->assertJsonPath('data.verifiedBy', $admin->name)
            ->assertJsonPath('data.reviewIntervalDays', 180)
            ->assertJsonPath('data.reviewStatus', 'current')
            ->assertJsonPath('data.nextReviewAt', '2027-02-07');

        $this->assertDatabaseHas('programme_source_records', [
            'reference' => $source['reference'],
            'source_name' => $source['sourceName'],
            'last_verified_at' => '2026-08-11 00:00:00',
        ]);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'programme_source.verified']);
        $this->assertSame(1, ProgrammeSourceRecord::query()->count());
        $this->assertGreaterThanOrEqual(1, AdminAuditEvent::query()->count());
    }

    public function test_only_publishing_a_changed_saved_programme_queues_a_batched_student_notification(): void
    {
        $admin = $this->admin();
        $studentRole = Role::query()->updateOrCreate(['slug' => RoleSlug::Student->value], ['name' => RoleSlug::Student->name]);
        $student = User::factory()->create(['account_status' => 'active']);
        $student->roles()->attach($studentRole);

        $baseline = $this->actingAs($admin)->postJson('/api/v1/admin/configurations/catalogue')->assertCreated()->json('data');
        $this->postJson("/api/v1/admin/configurations/versions/{$baseline['id']}/publish")->assertOk();
        $programmeId = $baseline['payload']['programmes'][0]['id'];
        StudentSavedProgramme::query()->create(['user_id' => $student->getKey(), 'programme_id' => $programmeId]);

        $draft = $this->postJson('/api/v1/admin/configurations/catalogue', ['sourceVersionId' => $baseline['id']])->assertCreated()->json('data');
        $draft['payload']['programmes'][0]['description'] = 'A published update for affected students.';
        $this->putJson("/api/v1/admin/configurations/versions/{$draft['id']}", ['payload' => $draft['payload']])->assertOk();
        $this->assertDatabaseCount('notification_dispatches', 0);

        $this->postJson("/api/v1/admin/configurations/versions/{$draft['id']}/publish")->assertOk();
        $this->assertDatabaseHas('notification_dispatches', [
            'recipient_id' => $student->getKey(),
            'event_type' => 'programme_updated',
            'subject_reference' => $programmeId,
            'status' => 'pending',
        ]);
        $this->assertSame(1, NotificationDispatch::query()->count());
    }

    private function admin(): User
    {
        $role = Role::query()->updateOrCreate(['slug' => RoleSlug::Admin->value], ['name' => RoleSlug::Admin->name]);
        $admin = User::factory()->create();
        $admin->roles()->attach($role);

        return $admin->load('roles');
    }
}
