<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class EscoOccupationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::clear();
    }

    public function test_administrator_can_search_and_load_an_esco_occupation(): void
    {
        Http::fake([
            '*/search*' => Http::response([
                '_embedded' => ['results' => [[
                    'uri' => 'http://data.europa.eu/esco/occupation/software-developer',
                    'title' => 'software developer',
                    'code' => '2512.3',
                    'broaderIscoGroup' => ['http://data.europa.eu/esco/isco/C2512'],
                ]]],
            ]),
            '*/resource/occupation*' => Http::response([
                'uri' => 'http://data.europa.eu/esco/occupation/software-developer',
                'title' => 'software developer',
                'code' => '2512.3',
                'description' => ['en' => ['literal' => 'Builds software systems from specifications.']],
                '_links' => [
                    'broaderIscoGroup' => [['code' => '2512']],
                    'hasEssentialSkill' => [
                        ['title' => 'analyse software specifications'],
                        ['title' => 'use software design patterns'],
                    ],
                ],
            ]),
        ]);

        $this->actingAs($this->userWithRole(RoleSlug::Admin))
            ->getJson('/api/v1/admin/esco/occupations?query=software')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'software developer')
            ->assertJsonPath('data.0.iscoCode', '2512');

        $uri = urlencode('http://data.europa.eu/esco/occupation/software-developer');
        $this->getJson("/api/v1/admin/esco/occupation?uri={$uri}")
            ->assertOk()
            ->assertJsonPath('data.label', 'software developer')
            ->assertJsonPath('data.skills.0', 'analyse software specifications')
            ->assertJsonPath('data.source', 'esco')
            ->assertJsonPath('data.sourceVersion', 'v1.2.0')
            ->assertJsonPath('data.reviewStatus', 'proposed');
    }

    public function test_student_cannot_access_admin_esco_lookup(): void
    {
        Http::fake();

        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->getJson('/api/v1/admin/esco/occupations?query=software')
            ->assertForbidden();
    }

    private function userWithRole(RoleSlug $slug): User
    {
        $role = Role::query()->firstOrCreate(['slug' => $slug->value], ['name' => $slug->name]);
        $user = User::factory()->create(['account_status' => 'active']);
        $user->roles()->attach($role);

        return $user;
    }
}
