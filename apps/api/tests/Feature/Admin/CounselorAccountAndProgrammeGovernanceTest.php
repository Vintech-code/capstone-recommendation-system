<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CounselorAccountAndProgrammeGovernanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_provisions_and_resets_an_individual_counselor_account(): void
    {
        $admin = $this->userWithRole(RoleSlug::Admin);

        $created = $this->actingAs($admin)->postJson('/api/v1/admin/counselors', [
            'name' => 'Maria Counselor',
            'email' => 'maria.counselor@example.test',
        ])->assertCreated()
            ->assertJsonPath('data.mustChangePassword', true)
            ->json('data');

        $counselor = User::query()->where('email', 'maria.counselor@example.test')->firstOrFail();
        $this->assertNotSame($created['temporaryPassword'], $counselor->password);
        $this->assertTrue(Hash::check($created['temporaryPassword'], $counselor->password));
        $this->assertTrue($counselor->hasRole(RoleSlug::Counselor));

        $this->actingAs($counselor)->getJson('/api/v1/counselor/overview')
            ->assertStatus(409)
            ->assertJsonPath('error.code', 'PASSWORD_CHANGE_REQUIRED');

        $this->actingAs($counselor)->putJson('/api/v1/auth/password', [
            'currentPassword' => $created['temporaryPassword'],
            'password' => 'Private!Counselor2026',
            'password_confirmation' => 'Private!Counselor2026',
        ])->assertOk()->assertJsonPath('data.changed', true);

        $this->assertFalse((bool) $counselor->fresh()->must_change_password);
        $this->actingAs($counselor->fresh())->getJson('/api/v1/counselor/overview')->assertOk();

        $reset = $this->actingAs($admin)->postJson("/api/v1/admin/counselors/{$counselor->getKey()}/reset-password")
            ->assertOk()
            ->assertJsonPath('data.mustChangePassword', true)
            ->json('data');
        $this->assertTrue(Hash::check($reset['temporaryPassword'], $counselor->fresh()->password));
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'counselor_account.created']);
        $this->assertDatabaseHas('admin_audit_events', ['action' => 'counselor_account.password_reset']);
    }

    public function test_catalogue_media_and_editable_content_publish_while_api_facts_remain_locked(): void
    {
        Storage::fake('public');
        $admin = $this->userWithRole(RoleSlug::Admin);
        $student = $this->userWithRole(RoleSlug::Student);
        $draft = $this->actingAs($admin)->postJson('/api/v1/admin/configurations/catalogue')
            ->assertCreated()->json('data');

        $media = $this->actingAs($admin)->post('/api/v1/admin/programmes/bs-information-technology/media', [
            'kind' => 'cover',
            'image' => UploadedFile::fake()->image('cover.jpg', 1200, 675),
        ], ['Accept' => 'application/json'])->assertCreated()->json('data');

        $draft['payload']['programmes'][0]['description'] = 'Updated student-facing programme description.';
        $draft['payload']['programmes'][0]['cover_image_url'] = $media['url'];
        $draft['payload']['programmes'][0]['degree_type'] = 'Tampered value';
        $draft['payload']['programmes'][0]['duration'] = ['display' => '99 years'];

        $saved = $this->actingAs($admin)->putJson("/api/v1/admin/configurations/versions/{$draft['id']}", [
            'payload' => $draft['payload'],
        ])->assertOk()
            ->assertJsonPath('data.payload.programmes.0.degree_type', "Bachelor's degree")
            ->assertJsonPath('data.payload.programmes.0.duration.display', '4 years')
            ->json('data');

        $this->actingAs($admin)->postJson("/api/v1/admin/configurations/versions/{$saved['id']}/publish")->assertOk();
        $this->actingAs($student)->getJson('/api/v1/student/programmes/bs-information-technology')
            ->assertOk()
            ->assertJsonPath('data.description', 'Updated student-facing programme description.')
            ->assertJsonPath('data.coverImageUrl', $media['url'])
            ->assertJsonPath('data.degreeType', "Bachelor's degree")
            ->assertJsonPath('data.duration.display', '4 years');
    }

    private function userWithRole(RoleSlug $slug): User
    {
        $role = Role::query()->updateOrCreate(['slug' => $slug->value], ['name' => $slug->name]);
        $user = User::factory()->create();
        $user->roles()->attach($role);

        return $user->load('roles');
    }
}
