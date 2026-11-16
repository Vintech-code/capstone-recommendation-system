<?php

namespace Tests\Feature\Student;

use App\Models\Barangay;
use App\Models\CityMunicipality;
use App\Models\Province;
use App\Models\Region;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_avatar_is_the_profile_photo_fallback(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);
        $student->forceFill([
            'google_avatar_url' => 'https://example.test/google-avatar.png',
        ])->save();

        $this->actingAs($student)
            ->getJson('/api/v1/student/profile')
            ->assertOk()
            ->assertJsonPath(
                'data.student.photoUrl',
                'https://example.test/google-avatar.png',
            );
    }

    public function test_student_can_create_and_update_only_their_own_profile(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);
        $other = $this->userWithRole(RoleSlug::Student);
        StudentProfile::query()->create([
            'user_id' => $other->getKey(),
            'id_number' => '87654321',
            'id_number_lookup_hash' => hash('sha256', '87654321'),
        ]);

        $region = Region::create(['code' => '0100000000', 'name' => 'Test region']);
        $province = Province::create(['code' => '0100100000', 'name' => 'Test province', 'region_id' => $region->id]);
        $city = CityMunicipality::create(['code' => '0100101000', 'name' => 'Test city', 'type' => 'City', 'region_id' => $region->id, 'province_id' => $province->id]);
        $barangay = Barangay::create(['code' => '0100101001', 'name' => 'Test barangay', 'city_municipality_id' => $city->id]);

        $payload = [
            'firstName' => 'Clark',
            'lastName' => 'Cabatuan',
            'location' => ['regionId' => $region->id, 'provinceId' => $province->id, 'cityMunicipalityId' => $city->id, 'barangayId' => $barangay->id],
            'idNumber' => '12345678',
            'birthDate' => '2007-04-18',
            'phone' => '+63 917 842 1928',
            'addressLine' => 'Zone 2',
            'barangay' => 'Poblacion',
            'municipality' => 'Tagoloan',
            'province' => 'Misamis Oriental',
        ];

        $this->actingAs($student)
            ->putJson('/api/v1/student/profile', $payload)
            ->assertOk()
            ->assertJsonPath('data.personalAcademic.complete', true)
            ->assertJsonPath('data.personalAcademic.idNumber', '12345678')
            ->assertJsonMissingPath('data.personalAcademic.shsStrand')
            ->assertJsonPath('data.student.id', $student->getKey())
            ->assertJsonPath('data.student.firstName', 'Clark')
            ->assertJsonPath('data.student.lastName', 'Cabatuan')
            ->assertJsonPath('data.student.name', 'Clark Cabatuan')
            ->assertJsonPath('data.riasec', null)
            ->assertJsonMissingPath('data.questionnaire')
            ->assertJsonMissingPath('data.options')
            ->assertJsonMissingPath('data.careerInterests')
            ->assertJsonMissingPath('data.about');

        $this->putJson('/api/v1/student/profile', [
            ...$payload,
            'phone' => '+63 917 000 0000',
        ])->assertOk()->assertJsonPath('data.personalAcademic.phone', '+63 917 000 0000');

        $this->getJson('/api/v1/student/profile')
            ->assertOk()
            ->assertJsonPath('data.student.email', $student->email);

        $this->assertDatabaseHas('student_profiles', ['user_id' => $student->getKey()]);
        $this->assertDatabaseHas('users', [
            'id' => $student->getKey(),
            'first_name' => 'Clark',
            'last_name' => 'Cabatuan',
            'name' => 'Clark Cabatuan',
        ]);
        $stored = StudentProfile::query()->where('user_id', $student->getKey())->firstOrFail();
        $this->assertSame('12345678', $stored->id_number);
        $this->assertNotSame('12345678', $stored->getRawOriginal('id_number'));
        $this->assertNotSame('+63 917 000 0000', $stored->getRawOriginal('phone'));
        $this->assertArrayNotHasKey('shs_gwa', $stored->getAttributes());
        $this->assertDatabaseHas('student_profiles', ['user_id' => $other->getKey()]);
        $this->assertSame('87654321', $other->studentProfile()->firstOrFail()->id_number);
    }

    public function test_removed_shs_fields_are_rejected(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);

        $this->actingAs($student)->putJson('/api/v1/student/profile', [
            'idNumber' => '12345678',
            'shsStrand' => 'STEM',
        ])->assertUnprocessable()->assertJsonValidationErrors('shsStrand');
    }

    public function test_id_number_is_required_and_cannot_be_connected_to_multiple_student_accounts(): void
    {
        $first = $this->userWithRole(RoleSlug::Student);
        $second = $this->userWithRole(RoleSlug::Student);
        $payload = [
            'firstName' => $first->first_name,
            'lastName' => $first->last_name,
            'idNumber' => '12345678',
        ];

        $this->actingAs($first)->putJson('/api/v1/student/profile', $payload)->assertOk();
        $this->actingAs($second)
            ->putJson('/api/v1/student/profile', [
                ...$payload,
                'firstName' => $second->first_name,
                'lastName' => $second->last_name,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('idNumber');

        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->putJson('/api/v1/student/profile', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('idNumber');
    }

    public function test_profile_submission_rejects_malformed_id_and_removed_fields(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);

        $this->actingAs($student)
            ->putJson('/api/v1/student/profile', [
                'firstName' => '   ',
                'lastName' => '',
                'idNumber' => '1234ABCD',
                'strengths' => ['Clinically gifted'],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['firstName', 'lastName', 'idNumber', 'strengths']);

        $this->assertDatabaseCount('student_profiles', 0);
    }

    public function test_profile_empty_state_is_truthful(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);

        $this->actingAs($student)
            ->getJson('/api/v1/student/profile')
            ->assertOk()
            ->assertJsonPath('data.personalAcademic.complete', false)
            ->assertJsonPath('data.personalAcademic.idNumber', null)
            ->assertJsonMissingPath('data.questionnaire')
            ->assertJsonPath('data.riasec', null);

    }

    public function test_guest_cannot_read_or_write_student_profiles(): void
    {
        $this->getJson('/api/v1/student/profile')->assertUnauthorized();
        $this->putJson('/api/v1/student/profile', [])->assertUnauthorized();
    }

    public function test_student_can_upload_and_replace_only_their_own_valid_profile_photo(): void
    {
        Storage::fake('local');
        $student = $this->userWithRole(RoleSlug::Student);
        $response = $this->actingAs($student)
            ->postJson('/api/v1/student/profile/photo', ['photo' => UploadedFile::fake()->image('profile.jpg', 640, 640)])
            ->assertCreated();
        $firstPath = StudentProfile::query()->where('user_id', $student->getKey())->value('photo_path');
        $this->assertStringStartsWith(
            '/api/v1/profile-photos/'.$student->getKey().'?v=',
            (string) $response->json('data.student.photoUrl'),
        );
        Storage::disk('local')->assertExists($firstPath);
        $this->get('/api/v1/profile-photos/'.$student->getKey())->assertOk();
        $this->actingAs($this->userWithRole(RoleSlug::Student))
            ->get('/api/v1/profile-photos/'.$student->getKey())
            ->assertForbidden();
        $this->actingAs($this->userWithRole(RoleSlug::Admin))
            ->get('/api/v1/profile-photos/'.$student->getKey())
            ->assertOk();
        $this->actingAs($student);

        $this->postJson('/api/v1/student/profile/photo', ['photo' => UploadedFile::fake()->image('replacement.png', 500, 500)])
            ->assertCreated();
        Storage::disk('local')->assertMissing($firstPath);

        $this->postJson('/api/v1/student/profile/photo', ['photo' => UploadedFile::fake()->create('profile.pdf', 20, 'application/pdf')])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('photo');
    }

    private function userWithRole(RoleSlug $slug): User
    {
        $role = Role::query()->firstOrCreate(['slug' => $slug->value], ['name' => $slug->value]);
        $user = User::factory()->create(['account_status' => 'active']);
        $user->roles()->attach($role);

        return $user;
    }
}
