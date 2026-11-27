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
use PharData;
use Tests\TestCase;

class StudentEnrollmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_must_upload_cor_file_and_provide_valid_student_id(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);

        $this->actingAs($student)
            ->postJson('/api/v1/student/enrollment', [
                'enrolledProgrammeId' => 'bs-information-technology',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['studentIdNumber']);

        $this->actingAs($student)
            ->postJson('/api/v1/student/enrollment', [
                'enrolledProgrammeId' => 'bs-information-technology',
                'studentIdNumber' => '12345678901',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['studentIdNumber']);

        $this->actingAs($student)
            ->postJson('/api/v1/student/enrollment', [
                'enrolledProgrammeId' => 'bs-information-technology',
                'studentIdNumber' => '2026001234',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['corFile']);
    }

    public function test_student_can_declare_enrollment_with_cor_file_and_id_reflects_in_profile_after_admin_verification(): void
    {
        Storage::fake('local');
        $student = $this->userWithRole(RoleSlug::Student);
        $otherStudent = $this->userWithRole(RoleSlug::Student);
        $admin = $this->userWithRole(RoleSlug::Admin);

        $file = UploadedFile::fake()->create('cor.pdf', 100, 'application/pdf');

        $this->actingAs($student)
            ->post('/api/v1/student/enrollment', [
                'enrolledProgrammeId' => 'bs-criminology',
                'studentIdNumber' => '2026001234',
                'corFile' => $file,
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.enrollment.enrolledProgrammeId', 'bs-criminology')
            ->assertJsonPath('data.enrollment.studentIdNumber', '2026001234')
            ->assertJsonPath('data.enrollment.hasCorFile', true)
            ->assertJsonPath('data.enrollment.verificationStatus', 'pending');

        $this->assertNull($student->studentProfile()->first()?->id_number);

        $this->actingAs($student)->get('/api/v1/enrollment-cor/'.$student->getKey())->assertOk();
        $this->actingAs($admin)->get('/api/v1/enrollment-cor/'.$student->getKey())->assertOk();
        $this->actingAs($otherStudent)->get('/api/v1/enrollment-cor/'.$student->getKey())->assertForbidden();

        $this->actingAs($admin)
            ->putJson('/api/v1/admin/students/'.$student->getKey().'/enrollment/verification', [
                'status' => 'verified',
            ])
            ->assertOk()
            ->assertJsonPath('data.verificationStatus', 'verified')
            ->assertJsonPath('data.studentIdNumber', '2026001234');

        $this->assertSame('2026001234', $student->studentProfile()->firstOrFail()->id_number);

        $this->actingAs($student)
            ->post('/api/v1/student/enrollment', [
                'enrolledProgrammeId' => 'bs-information-technology',
                'studentIdNumber' => '2026009999',
                'corFile' => UploadedFile::fake()->create('new.pdf', 100, 'application/pdf'),
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['enrolledProgrammeId']);
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
                'studentIdNumber' => '2026001111',
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
            'studentIdNumber' => '2026002222',
            'corFile' => UploadedFile::fake()->create('aligned.pdf', 100, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertCreated();

        $this->actingAs($notAlignedStudent)->post('/api/v1/student/enrollment', [
            'enrolledProgrammeId' => 'bs-criminology',
            'studentIdNumber' => '2026003333',
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
            ->assertJsonPath('data.enrollmentAlignment.overall.verifiedEnrolled', 2)
            ->assertJsonPath('data.enrollmentAlignment.programs.0.programmeId', 'bs-information-technology')
            ->assertJsonPath('data.enrollmentAlignment.programs.0.verifiedEnrolled', 2)
            ->assertJsonPath('data.enrollmentAlignment.programs.0.aligned', 1)
            ->assertJsonPath('data.enrollmentAlignment.programs.0.notAligned', 1)
            ->assertJsonPath('data.enrollmentAlignment.programs.0.alternateEnrollments.0.programmeId', 'bs-criminology')
            ->assertJsonPath('data.enrollmentAlignment.programs.0.alternateEnrollments.0.programmeCode', 'BSCrim')
            ->assertJsonPath('data.enrollmentAlignment.programs.0.alternateEnrollments.0.count', 1)
            ->assertJsonPath('data.enrollmentAlignment.overall.alignmentRate', 33.33);
    }

    public function test_admin_can_download_the_aggregate_enrollment_alignment_word_report(): void
    {
        $admin = $this->userWithRole(RoleSlug::Admin);
        $student = $this->userWithRole(RoleSlug::Student);
        $this->createTopRecommendation($student, 'bs-information-technology');

        $response = $this->actingAs($admin)->get(
            '/api/v1/admin/reports/enrollment-alignment.docx?from='.now()->format('Y-m-d'),
        );

        $response->assertOk()
            ->assertDownload('recommendation-enrollment-alignment-report.docx')
            ->assertHeader(
                'content-type',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            );

        $generatedPath = $response->baseResponse->getFile()->getPathname();
        $templatePath = resource_path('report-templates/recommendation-enrollment-alignment.docx');
        $documentXml = $this->readDocxEntry($generatedPath, 'word/document.xml');

        $this->assertStringContainsString('Recommendation and Enrollment Alignment Report', $documentXml);
        $this->assertStringContainsString('BSIT - BS Information Technology', $documentXml);
        $this->assertStringContainsString('Actual programme chosen instead: None recorded', $documentXml);
        $this->assertStringContainsString('does not prove that the recommendation caused', $documentXml);
        $this->assertStringNotContainsString($student->email, $documentXml);
        $this->assertSame(
            $this->readDocxEntry($templatePath, 'word/header1.xml'),
            $this->readDocxEntry($generatedPath, 'word/header1.xml'),
        );
        $this->assertSame(
            $this->readDocxEntry($templatePath, 'word/footer1.xml'),
            $this->readDocxEntry($generatedPath, 'word/footer1.xml'),
        );
        $this->assertDatabaseHas('admin_audit_events', [
            'actor_id' => $admin->getKey(),
            'action' => 'report.downloaded',
            'subject_type' => 'report',
            'subject_reference' => 'recommendation-enrollment-alignment',
        ]);
    }

    public function test_word_report_download_requires_an_admin_and_valid_date_range(): void
    {
        $student = $this->userWithRole(RoleSlug::Student);
        $admin = $this->userWithRole(RoleSlug::Admin);
        $endpoint = '/api/v1/admin/reports/enrollment-alignment.docx';

        $this->getJson($endpoint)->assertUnauthorized();
        $this->actingAs($student)->getJson($endpoint)->assertForbidden();
        $this->actingAs($admin)
            ->getJson($endpoint.'?from=2026-11-28&to=2026-11-27')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['to']);
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

    private function readDocxEntry(string $documentPath, string $entryName): string
    {
        $temporaryBase = tempnam(sys_get_temp_dir(), 'docx-test-');
        $this->assertNotFalse($temporaryBase);
        @unlink($temporaryBase);
        $zipPath = $temporaryBase.'.zip';
        copy($documentPath, $zipPath);

        try {
            $archive = new PharData($zipPath);
            $contents = $archive[$entryName]->getContent();
            unset($archive);

            return $contents;
        } finally {
            @unlink($zipPath);
        }
    }
}
