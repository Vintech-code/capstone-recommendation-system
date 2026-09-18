<?php

namespace Tests\Feature\Admin;

use App\Models\NotificationDispatch;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\StudentSavedProgramme;
use App\Models\User;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
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
        $draft['payload']['programmes'][0]['display_name'] = 'Unsupported renamed programme';
        $draft['payload']['programmes'][0]['description'] = 'Unsupported replacement description.';
        $draft['payload']['programmes'][0]['riasec_profile'] = ['A', 'S', 'E'];
        $draft['payload']['programmes'][0]['recommended_strands'] = ['STEM', 'TVL-ICT'];
        $draft['payload']['programmes'][0]['cover_image_position'] = ['x' => 65, 'y' => 40, 'zoom' => 1.3];
        $draft['payload']['programmes'][0]['duration'] = ['display' => '99 years'];
        $draft['payload']['programmes'][0]['eligibility_group'] = 'board';

        $this->actingAs($admin)->postJson("/api/v1/admin/configurations/versions/{$draft['id']}/preview", [
            'payload' => $draft['payload'],
        ])->assertOk()
            ->assertJsonPath('data.hasChanges', true)
            ->assertJsonPath('data.changedProgrammeCount', 1)
            ->assertJsonPath('data.programmeChanges.0.programmeId', 'bs-information-technology')
            ->assertJsonFragment(['field' => 'recommended_strands', 'after' => ['STEM', 'TVL-ICT']])
            ->assertJsonFragment(['field' => 'cover_image_position', 'after' => ['x' => 65, 'y' => 40, 'zoom' => 1.3]])
            ->assertJsonMissing(['field' => 'display_name', 'after' => 'Unsupported renamed programme'])
            ->assertJsonMissing(['field' => 'description', 'after' => 'Unsupported replacement description.'])
            ->assertJsonMissing(['field' => 'riasec_profile', 'after' => ['A', 'S', 'E']])
            ->assertJsonMissing(['field' => 'duration', 'after' => ['display' => '99 years']])
            ->assertJsonMissing(['field' => 'eligibility_group', 'after' => 'board']);
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

    public function test_catalogue_rejects_changed_programme_identifiers(): void
    {
        $admin = $this->admin();
        $draft = $this->actingAs($admin)->postJson('/api/v1/admin/configurations/catalogue')
            ->assertCreated()->json('data');
        $draft['payload']['programmes'][0]['id'] = 'replacement-programme';

        $this->actingAs($admin)->putJson("/api/v1/admin/configurations/versions/{$draft['id']}", [
            'payload' => $draft['payload'],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('payload.programmes');
    }

    public function test_published_catalogue_applies_only_editable_enrichment_fields(): void
    {
        $admin = $this->admin();
        $draft = $this->actingAs($admin)->postJson('/api/v1/admin/configurations/catalogue')
            ->assertCreated()->json('data');
        $draft['payload']['programmes'][0]['display_name'] = 'Unsupported renamed programme';
        $draft['payload']['programmes'][0]['description'] = 'Unsupported replacement description.';
        $draft['payload']['programmes'][0]['recommended_strands'] = ['STEM'];

        $this->actingAs($admin)->putJson("/api/v1/admin/configurations/versions/{$draft['id']}", [
            'payload' => $draft['payload'],
        ])->assertOk();
        $this->postJson("/api/v1/admin/configurations/versions/{$draft['id']}/publish")->assertOk();

        $programmes = collect($this->app->make(TccProgrammeCatalogueRepository::class)->current()['programmes'])->keyBy('id');
        $programme = $programmes['bs-information-technology'];

        $this->assertSame('BS Information Technology', $programme['display_name']);
        $this->assertStringStartsWith('Studies hardware and software technologies', $programme['description']);
        $this->assertSame(['STEM'], $programme['recommended_strands']);
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
        $draft['payload']['programmes'][0]['recommended_strands'] = ['STEM'];
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
