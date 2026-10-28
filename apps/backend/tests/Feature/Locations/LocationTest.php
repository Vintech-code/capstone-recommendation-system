<?php

namespace Tests\Feature\Locations;

use App\Models\Barangay;
use App\Models\Role;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LocationTest extends TestCase
{
    use RefreshDatabase;

    // Synthetic records shaped like the documented PSGC v2 resources; not production seed data.
    private function source(bool $invalid = false, int $barangayCount = 2): void
    {
        $region = ['code' => '0100000000', 'name' => 'Test region'];
        $province = ['code' => '0100100000', 'name' => 'Test province', 'region' => $region];
        $city = ['code' => '0100101000', 'name' => 'Test municipality', 'type' => 'Municipality', 'region' => $region, 'province' => $province];
        $independent = ['code' => '0100201000', 'name' => 'Independent test city', 'type' => 'City', 'region' => $region, 'province' => null];
        Http::swap(new Factory);
        $province['region'] = $region['name'];
        $city['region'] = $region['name'];
        $city['province'] = $province['name'];
        $independent['region'] = $region['name'];
        Http::preventStrayRequests();
        Http::fake([
            '*/regions' => Http::response(['data' => [$region]]),
            '*/provinces' => Http::response(['data' => [$province]]),
            '*/cities-municipalities' => Http::response(['data' => [$city, $independent]]),
            '*/regions/0100000000' => Http::response(['data' => [...$region, 'barangays_count' => $barangayCount]]),
            '*/regions/0100000000/barangays' => Http::response(['data' => [
                ['code' => '0100101001', 'name' => 'Test barangay', 'status' => 'Active', 'region' => $region['name'], 'province' => $province['name'], 'city_municipality' => $invalid ? 'Unknown test city' : $city['name']],
                ['code' => '0100201001', 'name' => 'Independent test barangay', 'status' => 'Active', 'region' => $region['name'], 'province' => null, 'city_municipality' => $independent['name']],
            ]]),
        ]);
    }

    private function student(): User
    {
        $student = User::factory()->create(['account_status' => 'active']);
        $role = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student Applicant']);
        $student->roles()->attach($role);

        return $student;
    }

    public function test_sync_is_idempotent_and_ttl_avoids_upstream_requests(): void
    {
        $this->source();
        $this->artisan('locations:sync')->assertSuccessful();
        $ids = Barangay::pluck('id', 'code')->all();
        $this->artisan('locations:sync')->assertSuccessful();
        Http::assertSentCount(5);
        $this->artisan('locations:sync --force')->assertSuccessful();
        $this->assertSame($ids, Barangay::pluck('id', 'code')->all());
        $this->assertDatabaseCount('regions', 1);
        $this->assertDatabaseCount('barangays', 2);
    }

    public function test_bad_ancestry_rolls_back_every_table_and_sync_version(): void
    {
        $this->source();
        $this->artisan('locations:sync')->assertSuccessful();
        DB::table('regions')->update(['name' => 'Previously synced']);
        $this->source(true);
        $this->artisan('locations:sync --force')->assertFailed();
        $this->assertDatabaseHas('regions', ['name' => 'Previously synced', 'is_active' => true]);
        $this->assertDatabaseCount('location_syncs', 1);
    }

    public function test_upstream_failure_keeps_local_api_available(): void
    {
        $this->source();
        $this->artisan('locations:sync')->assertSuccessful();
        Http::swap(new Factory);
        Http::fake(['*' => Http::response(['message' => 'Unavailable'], 503)]);
        $this->artisan('locations:sync --force')->assertFailed();
        $this->actingAs($this->student())->getJson('/api/v1/locations/regions')->assertOk()->assertJsonCount(1, 'data');
        $this->assertDatabaseCount('location_syncs', 1);
    }

    public function test_empty_or_paginated_payload_cannot_replace_the_catalogue(): void
    {
        foreach ([['data' => []], ['data' => [['code' => '0100000000', 'name' => 'Test']], 'links' => ['next' => 'https://psgc.cloud/api/v2/regions?page=2']]] as $payload) {
            Http::fake(['*' => Http::response($payload)]);
            $this->artisan('locations:sync --force')->assertFailed();
            $this->assertDatabaseCount('regions', 0);
        }
    }

    public function test_local_endpoints_filter_parents_and_never_call_upstream(): void
    {
        $this->source();
        $this->artisan('locations:sync')->assertSuccessful();
        Http::fake();
        $this->getJson('/api/v1/locations/regions')->assertUnauthorized();
        $this->actingAs($this->student());
        $barangay = Barangay::where('code', '0100101001')->firstOrFail();
        $city = $barangay->cityMunicipality;
        $this->getJson('/api/v1/locations/regions')->assertOk();
        $this->getJson('/api/v1/locations/regions/'.$city->region_id.'/provinces')->assertOk()->assertJsonPath('data.hasIndependentCities', true)->assertJsonCount(1, 'data.items');
        $this->getJson('/api/v1/locations/provinces/'.$city->province_id.'/cities-municipalities')->assertOk()->assertJsonPath('data.0.id', $city->id)->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/locations/regions/'.$city->region_id.'/independent-cities')->assertOk()->assertJsonPath('data.0.name', 'Independent test city');
        $this->getJson('/api/v1/locations/cities-municipalities/'.$city->id.'/barangays')->assertOk()->assertJsonPath('data.0.code', $barangay->code)->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/locations/regions/9999/provinces')->assertNotFound();
        Http::assertNothingSent();
    }

    public function test_unsynced_catalogue_has_recoverable_error_and_cache_failure_uses_database(): void
    {
        $this->actingAs($this->student())->getJson('/api/v1/locations/regions')->assertServiceUnavailable();
        $this->source();
        $this->artisan('locations:sync')->assertSuccessful();
        Cache::shouldReceive('remember')->once()->andThrow(new \RuntimeException('Cache unavailable'));
        $this->getJson('/api/v1/locations/regions')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_sync_changes_cache_version_and_retains_removed_ids_as_inactive(): void
    {
        $this->source();
        $this->artisan('locations:sync')->assertSuccessful();
        DB::table('regions')->update(['name' => 'Old name']);
        $this->actingAs($this->student())->getJson('/api/v1/locations/regions')->assertJsonPath('data.0.name', 'Old name');
        $removed = Barangay::create(['code' => '0100101999', 'name' => 'Removed test barangay', 'city_municipality_id' => Barangay::firstOrFail()->city_municipality_id]);
        $this->artisan('locations:sync --force')->assertSuccessful();
        $this->getJson('/api/v1/locations/regions')->assertJsonPath('data.0.name', 'Test region');
        $this->assertDatabaseHas('barangays', ['id' => $removed->id, 'is_active' => false]);
        $this->getJson('/api/v1/locations/cities-municipalities/'.$removed->city_municipality_id.'/barangays')->assertJsonCount(1, 'data');
    }

    public function test_an_existing_sync_lock_prevents_upstream_requests(): void
    {
        Http::fake();
        $lock = Cache::lock('locations:sync', 3600);
        $this->assertTrue($lock->get());
        $this->artisan('locations:sync')->assertFailed();
        Http::assertNothingSent();
        $this->assertFalse(Cache::lock('locations:sync', 3600)->get());
        $lock->release();
    }

    public function test_regional_barangay_count_prevents_silent_truncation(): void
    {
        $this->source(false, 500);
        $this->artisan('locations:sync')->assertFailed();
        $this->assertDatabaseCount('location_syncs', 0);
        $this->assertDatabaseCount('barangays', 0);
    }

    public function test_cross_region_province_is_normalized_only_when_the_region_has_no_provinces(): void
    {
        // Regression for the observed live NCR/Sarangani conflict, with synthetic labels.
        Http::fake([
            '*/regions/0100000000' => Http::response(['data' => ['code' => '0100000000', 'barangays_count' => 1]]),
            '*/regions/0200000000' => Http::response(['data' => ['code' => '0200000000', 'barangays_count' => 1]]),
            '*/regions/0100000000/barangays' => Http::response(['data' => [['code' => '0100101001', 'name' => 'Ordinary barangay', 'status' => 'Active', 'region' => 'Test region', 'province' => 'Test province', 'city_municipality' => 'Ordinary city']]]),
            '*/regions/0200000000/barangays' => Http::response(['data' => [['code' => '0200101001', 'name' => 'Conflicting barangay', 'status' => 'Active', 'region' => 'Other region', 'province' => 'Test province', 'city_municipality' => 'Conflicting city']]]),
            '*/regions' => Http::response(['data' => [['code' => '0100000000', 'name' => 'Test region'], ['code' => '0200000000', 'name' => 'Other region']]]),
            '*/provinces' => Http::response(['data' => [['code' => '0100100000', 'name' => 'Test province', 'region' => 'Test region']]]),
            '*/cities-municipalities' => Http::response(['data' => [
                ['code' => '0100101000', 'name' => 'Ordinary city', 'type' => 'City', 'region' => 'Test region', 'province' => 'Test province'],
                ['code' => '0200101000', 'name' => 'Conflicting city', 'type' => 'City', 'region' => 'Other region', 'province' => 'Test province'],
            ]]),
        ]);
        $this->artisan('locations:sync')->assertSuccessful();
        $this->assertDatabaseHas('city_municipalities', ['code' => '0100101000', 'province_id' => 1]);
        $this->assertDatabaseHas('city_municipalities', ['code' => '0200101000', 'province_id' => null]);
        $this->assertDatabaseCount('location_syncs', 1);
        Http::assertSentCount(7);
    }

    public function test_profile_validates_hierarchy_and_stores_ids_and_server_names(): void
    {
        $this->source();
        $this->artisan('locations:sync')->assertSuccessful();
        $student = $this->student();
        $this->actingAs($student);
        $barangay = Barangay::where('code', '0100101001')->firstOrFail();
        $city = $barangay->cityMunicipality;
        $location = ['regionId' => $city->region_id, 'provinceId' => $city->province_id, 'cityMunicipalityId' => $city->id, 'barangayId' => $barangay->id];
        $payload = ['strengths' => ['Creativity'], 'growthAreas' => ['Writing'], 'learningPreferences' => ['Reading'], 'location' => $location, 'barangay' => 'Forged name'];
        $this->putJson('/api/v1/student/profile', $payload)->assertOk()->assertJsonPath('data.personalAcademic.location.code', $barangay->code)->assertJsonPath('data.personalAcademic.barangay', $barangay->name);
        $this->assertDatabaseHas('student_profiles', ['user_id' => $student->id, 'barangay_id' => $barangay->id]);
        foreach (['regionId', 'provinceId', 'cityMunicipalityId', 'barangayId'] as $key) {
            $this->putJson('/api/v1/student/profile', [...$payload, 'location' => [...$location, $key => 99999]])->assertUnprocessable()->assertJsonValidationErrors('location.barangayId');
        }
        $independent = Barangay::where('code', '0100201001')->firstOrFail();
        $this->putJson('/api/v1/student/profile', [...$payload, 'location' => [...$location, 'provinceId' => null, 'cityMunicipalityId' => $independent->city_municipality_id, 'barangayId' => $independent->id]])->assertOk()->assertJsonPath('data.personalAcademic.province', null);
        $this->assertSame($independent->id, StudentProfile::where('user_id', $student->id)->firstOrFail()->barangay_id);
    }
}
