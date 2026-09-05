<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProgrammeGovernanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalogue_media_and_editable_content_publish_while_api_facts_remain_locked(): void
    {
        Storage::fake('public');
        $admin = $this->userWithRole(RoleSlug::Admin);
        $student = $this->userWithRole(RoleSlug::Student);
        $draft = $this->actingAs($admin)->postJson('/api/v1/admin/configurations/catalogue')
            ->assertCreated()->json('data');

        $media = $this->post('/api/v1/admin/programmes/bs-information-technology/media', [
            'kind' => 'cover',
            'image' => UploadedFile::fake()->image('cover.jpg', 1200, 675),
        ], ['Accept' => 'application/json'])->assertCreated()->json('data');

        $draft['payload']['programmes'][0]['description'] = 'Updated student-facing programme description.';
        $draft['payload']['programmes'][0]['career_opportunities'] = [[
            'label' => 'software developer',
            'description' => 'Builds software systems from specifications and designs.',
            'escoUri' => 'http://data.europa.eu/esco/occupation/test-software-developer',
            'escoCode' => '2512.3',
            'iscoCode' => '2512',
            'skills' => ['analyse software specifications'],
            'source' => 'esco',
            'sourceLanguage' => 'en',
            'sourceVersion' => 'v1.2.0',
            'retrievedAt' => '2026-09-06T12:00:00+08:00',
            'reviewStatus' => 'proposed',
        ]];
        $draft['payload']['programmes'][0]['cover_image_url'] = $media['url'];
        $draft['payload']['programmes'][0]['degree_type'] = 'Tampered value';
        $draft['payload']['programmes'][0]['duration'] = ['display' => '99 years'];

        $saved = $this->putJson("/api/v1/admin/configurations/versions/{$draft['id']}", [
            'payload' => $draft['payload'],
        ])->assertOk()
            ->assertJsonPath('data.payload.programmes.0.degree_type', "Bachelor's degree")
            ->assertJsonPath('data.payload.programmes.0.duration.display', '4 years')
            ->json('data');

        $this->postJson("/api/v1/admin/configurations/versions/{$saved['id']}/publish")->assertOk();
        $this->actingAs($student)->getJson('/api/v1/student/programmes/bs-information-technology')
            ->assertOk()
            ->assertJsonPath('data.description', 'Updated student-facing programme description.')
            ->assertJsonPath('data.coverImageUrl', $media['url'])
            ->assertJsonPath('data.careerDirections.0', 'Software and application development')
            ->assertJsonPath('data.careerOpportunities.0.label', 'software developer')
            ->assertJsonPath('data.careerOpportunities.0.iscoCode', '2512')
            ->assertJsonPath('data.degreeType', "Bachelor's degree")
            ->assertJsonPath('data.duration.display', '4 years');
    }

    private function userWithRole(RoleSlug $slug): User
    {
        $role = Role::query()->firstOrCreate(['slug' => $slug->value], ['name' => $slug->name]);
        $user = User::factory()->create(['account_status' => 'active']);
        $user->roles()->attach($role);

        return $user;
    }
}
