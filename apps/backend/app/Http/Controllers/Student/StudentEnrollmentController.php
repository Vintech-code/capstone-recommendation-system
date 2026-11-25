<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ProgrammeAvailability;
use App\Models\RoleSlug;
use App\Models\StudentEnrollment;
use App\Models\User;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class StudentEnrollmentController extends Controller
{
    public function show(Request $request, TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $catalogue = $catalogues->current();
        $programmes = collect($catalogue['programmes'] ?? []);
        $availabilities = ProgrammeAvailability::query()->get()->keyBy('programme_id');
        $user = $request->user();
        $enrollment = $user->enrollment;

        return response()->json([
            'data' => [
                'hasRecommendation' => $user->recommendationRuns()->exists(),
                'enrollment' => $enrollment ? $this->present($enrollment, $programmes) : null,
                'programmes' => $programmes->map(static function (array $programme) use ($availabilities): array {
                    $id = (string) $programme['id'];
                    $availability = $availabilities->get($id);

                    return [
                        'id' => $id,
                        'code' => (string) ($programme['short_label'] ?? $id),
                        'name' => (string) ($programme['display_name'] ?? $id),
                        'isEnrollmentOpen' => $availability?->is_enrollment_open ?? true,
                        'availabilityNote' => $availability?->status_note,
                    ];
                })->values()->all(),
            ],
        ]);
    }

    public function store(Request $request, TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $validated = $request->validate([
            'enrolledProgrammeId' => ['required', 'string', 'max:120'],
            'corFile' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $catalogue = $catalogues->current();
        $programmes = collect($catalogue['programmes'] ?? []);
        $programme = $programmes->firstWhere('id', $validated['enrolledProgrammeId']);

        if (! is_array($programme)) {
            throw ValidationException::withMessages([
                'enrolledProgrammeId' => ['Select a valid programme from the TCC catalogue.'],
            ]);
        }

        $user = $request->user();
        $existing = $user->enrollment;

        $availability = ProgrammeAvailability::query()
            ->where('programme_id', $validated['enrolledProgrammeId'])
            ->first();
        $isChangingToClosed = $availability !== null
            && ! $availability->is_enrollment_open
            && $existing?->enrolled_programme_id !== $validated['enrolledProgrammeId'];

        if ($isChangingToClosed) {
            throw ValidationException::withMessages([
                'enrolledProgrammeId' => ['This programme is currently marked as full and closed for new enrollment.'],
            ]);
        }

        $uploadedFile = $request->file('corFile');
        $hasFileAfterSave = $uploadedFile !== null || ($existing?->cor_file_path !== null && Storage::disk('local')->exists($existing->cor_file_path));

        if (! $hasFileAfterSave) {
            throw ValidationException::withMessages([
                'corFile' => ['Please upload your Certificate of Registration (COR) file.'],
            ]);
        }

        $filePath = $existing?->cor_file_path;
        $originalName = $existing?->cor_original_name;

        if ($uploadedFile !== null) {
            $newPath = $uploadedFile->store('student-cor-media/'.$user->getKey(), 'local');
            abort_unless($newPath !== false, 500, 'The COR file could not be stored.');
            if ($filePath && $filePath !== $newPath) {
                Storage::disk('local')->delete($filePath);
            }
            $filePath = $newPath;
            $originalName = $uploadedFile->getClientOriginalName();
        }

        $latestRun = $user->recommendationRuns()->latest('generated_at')->first();

        $enrollment = StudentEnrollment::query()->updateOrCreate(
            ['user_id' => $user->getKey()],
            [
                'recommendation_run_id' => $latestRun?->getKey(),
                'enrolled_programme_id' => (string) $programme['id'],
                'cor_reference' => null,
                'cor_file_path' => $filePath,
                'cor_original_name' => $originalName,
                'declared_at' => now(),
                'verification_status' => 'pending',
                'verification_note' => null,
                'verified_at' => null,
                'verified_by' => null,
            ],
        );

        return response()->json([
            'data' => [
                'enrollment' => $this->present($enrollment, $programmes),
            ],
        ], $existing ? 200 : 201);
    }

    public function showFile(Request $request, User $student)
    {
        $viewer = $request->user();
        abort_unless(
            $viewer->is($student) || $viewer->hasRole(RoleSlug::Admin),
            403,
        );
        abort_unless($student->roles()->where('slug', RoleSlug::Student->value)->exists(), 404);

        $enrollment = $student->enrollment;
        $path = $enrollment?->cor_file_path;
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path, $enrollment->cor_original_name ?? 'cor');
    }

    /**
     * @param \Illuminate\Support\Collection<int, array<string, mixed>> $programmes
     * @return array<string, mixed>
     */
    private function present(StudentEnrollment $enrollment, $programmes): array
    {
        $programme = $programmes->firstWhere('id', $enrollment->enrolled_programme_id);

        return [
            'enrolledProgrammeId' => $enrollment->enrolled_programme_id,
            'enrolledProgrammeCode' => (string) ($programme['short_label'] ?? $enrollment->enrolled_programme_id),
            'enrolledProgrammeName' => (string) ($programme['display_name'] ?? $enrollment->enrolled_programme_id),
            'corReference' => $enrollment->cor_reference,
            'hasCorFile' => $enrollment->cor_file_path !== null,
            'corOriginalName' => $enrollment->cor_original_name,
            'corFileUrl' => $enrollment->cor_file_path !== null
                ? '/api/v1/enrollment-cor/'.$enrollment->user_id.'?v='.$enrollment->updated_at?->getTimestamp()
                : null,
            'declaredAt' => $enrollment->declared_at->toAtomString(),
            'verificationStatus' => $enrollment->verification_status ?? 'pending',
            'verificationNote' => $enrollment->verification_note,
            'verifiedAt' => $enrollment->verified_at?->toAtomString(),
        ];
    }
}
