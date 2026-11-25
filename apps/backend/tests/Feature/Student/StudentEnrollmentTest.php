<?php

namespace Tests\Feature\Student;

use App\Models\AssessmentSession;
use App\Models\RecommendationRun;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentEnrollmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_must_upload_cor_file(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);

        $this->actingAs($student)
            ->postJson('/api/v1/student/enrollment', [
                'enrolledProgrammeId' => 'bs-information-technology',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['corFile']);
    }

    public function test_student_can_declare_enrollment_with_cor_file_and_authorized_users_can_view_it(): void
    {
        Storage::fake('local');
        $student = $this->userWithRole(RoleSlug::Student);
        $otherStudent = $this->userWithRole(RoleSlug::Student);
        $admin = $this->userWithRole(RoleSlug::Admin);

        $file = UploadedFile::fake()->create('cor.pdf', 100, 'application/pdf');

        $this->actingAs($student)
            ->post('/api/v1/student/enrollment', [
                'enrolledProgrammeId' => 'bs-criminology',
                'corFile' => $file,
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.enrollment.enrolledProgrammeId', 'bs-criminology')
            ->assertJsonPath('data.enrollment.hasCorFile', true)
            ->assertJsonPath('data.enrollment.verificationStatus', 'pending');

        $this->actingAs($student)->get('/api/v1/enrollment-cor/'.$student->getKey())->assertOk();
        $this->actingAs($admin)->get('/api/v1/enrollment-cor/'.$student->getKey())->assertOk();
        $this->actingAs($otherStudent)->get('/api/v1/enrollment-cor/'.$student->getKey())->assertForbidden();
    }

    public function test_admin_can_mark_programme_full_and_student_cannot_enroll_in_it(): void
    {
        Storage::fake('local');
        $admin = $this->userWithRole(RoleSlug::Admin);
        $student = $this->userWithRole(RoleSlug::Student);

        $this->actingAs($admin)
            ->putJson('/api/v1/admin/programmes/bs-information-technology/availability', [
                'isEnrollmentOpen' => false,
                'statusNote' => 'Slots full for A.Y. 2026-2027',
            ])
            ->assertOk()
            ->assertJsonPath('data.isEnrollmentOpen', false)
            ->assertJsonPath('data.availabilityNote', 'Slots full for A.Y. 2026-2027');

        $file = UploadedFile::fake()->create('cor.pdf', 100, 'application/pdf');
        $this->actingAs($student)
            ->post('/api/v1/student/enrollment', [
                'enrolledProgrammeId' => 'bs-information-technology',
                'corFile' => $file,
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['enrolledProgrammeId']);
    }

    public function test_admin_reports_computes_enrollment_alignment_statistics(): void
    {
        Storage::fake('local');
        $admin = $this->userWithRole(RoleSlug::Admin);
        $alignedStudent = $this->userWithRole(RoleSlug::Student);
        $notAlignedStudent = $this->userWithRole(RoleSlug::Student);
        $unallocatedStudent = $this->userWithRole(RoleSlug::Student);

        $this->createTopRecommendation($alignedStudent, 'bs-information-technology');
        $this->createTopRecommendation($notAlignedStudent, 'bs-information-technology');
        $this->createTopRecommendation($unallocatedStudent, 'bs-information-technology');

        $this->actingAs($alignedStudent)->post('/api/v1/student/enrollment', [
            'enrolledProgrammeId' => 'bs-information-technology',
            'corFile' => UploadedFile::fake()->create('aligned.pdf', 100, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertCreated();

        $this->actingAs($notAlignedStudent)->post('/api/v1/student/enrollment', [
            'enrolledProgrammeId' => 'bs-criminology',
            'corFile' => UploadedFile::fake()->create('other.pdf', 100, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertCreated();

        // Pending enrollments remain unallocated until verified by an Administrator
        $this->actingAs($admin)->getJson('/api/v1/admin/reports')
            ->assertOk()
            ->assertJsonPath('data.enrollmentAlignment.overall.recommended', 3)
            ->assertJsonPath('data.enrollmentAlignment.overall.aligned', 0)
            ->assertJsonPath('data.enrollmentAlignment.overall.notAligned', 0)
            ->assertJsonPath('data.enrollmentAlignment.overall.unallocated', 3);

        $this->actingAs($admin)->putJson('/api/v1/admin/students/'.$alignedStudent->getKey().'/enrollment/verification', [
            'status' => 'verified',
        ])->assertOk();

        $this->actingAs($admin)->putJson('/api/v1/admin/students/'.$notAlignedStudent->getKey().'/enrollment/verification', [
            'status' => 'verified',
        ])->assertOk();

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/reports');
        $response->assertOk()
            ->assertJsonPath('data.enrollmentAlignment.overall.recommended', 3)
            ->assertJsonPath('data.enrollmentAlignment.overall.aligned', 1)
            ->assertJsonPath('data.enrollmentAlignment.overall.notAligned', 1)
            ->assertJsonPath('data.enrollmentAlignment.overall.unallocated', 1)
            ->assertJsonPath('data.enrollmentAlignment.overall.alignmentRate', 33.33);
    }

    private function userWithRole(RoleSlug $slug): User
    {
        $user = User::factory()->create();
        $role = Role::query()->firstOrCreate(['slug' => $slug->value], ['name' => ucfirst($slug->value)]);
        $user->roles()->attach($role->getKey());

        return $user;
    }

    private function createTopRecommendation(User $student, string $programmeId): void
    {
        $session = AssessmentSession::query()->create([
            'user_id' => $student->getKey(),
            'instrument_code' => 'riasec-uhcc-30',
            'attempt_number' => 1,
            'status' => 'result_available',
            'is_current' => true,
            'answers' => [],
            'current_question' => 30,
            'started_at' => now()->subMinutes(10),
            'submitted_at' => now()->subMinutes(2),
            'result_available_at' => now(),
        ]);

        RecommendationRun::query()->create([
            'user_id' => $student->getKey(),
            'assessment_session_id' => $session->getKey(),
            'catalogue_reference' => 'tcc-2026-2027-v1',
            'rule_reference' => 'SELF-DECLARED-TCC-ENTRANCE-2026-01',
            'methodology_status' => 'provisional',
            'default_count' => 3,
            'total_eligible' => 13,
            'ranked_courses' => [
                ['id' => $programmeId, 'code' => 'BSIT', 'name' => 'BS Information Technology', 'match' => 90, 'rank' => 1],
            ],
            'generated_at' => now(),
        ]);
    }
}
