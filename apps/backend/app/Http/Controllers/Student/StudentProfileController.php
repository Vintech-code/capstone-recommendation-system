<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\RoleSlug;
use App\Models\StudentProfile;
use App\Models\User;
use App\Services\Locations\ProfileLocation;
use App\Services\Student\StudentProfilePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class StudentProfileController extends Controller
{
    public function show(Request $request, StudentProfilePresenter $presenter): JsonResponse
    {
        return response()->json(['data' => $presenter->present($request->user())]);
    }

    public function store(Request $request, StudentProfilePresenter $presenter): JsonResponse
    {
        $validated = $request->validate([
            'lrn' => ['nullable', 'string', 'max:30'],
            'birthDate' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today', 'after:1900-01-01'],
            'phone' => ['nullable', 'string', 'max:32'],
            'addressLine' => ['nullable', 'string', 'max:255'],
            'location' => ['sometimes', 'required', 'array:regionId,provinceId,cityMunicipalityId,barangayId,code'],
            'location.regionId' => ['required_with:location', 'integer', 'min:1'],
            'location.provinceId' => ['present_with:location', 'nullable', 'integer', 'min:1'],
            'location.cityMunicipalityId' => ['required_with:location', 'integer', 'min:1'],
            'location.barangayId' => ['required_with:location', 'integer', 'min:1'],
            'location.code' => ['sometimes', 'string', 'max:10'],
            'shsSchoolName' => ['nullable', 'string', 'max:255'],
            'shsStrand' => ['nullable', 'string', 'max:120'],
            'shsGraduationYear' => ['nullable', 'integer', 'min:2000', 'max:'.(now()->year + 1)],
            'strengths' => ['required', 'array', 'max:10'],
            'strengths.*' => ['string', 'distinct', Rule::in(StudentProfilePresenter::STRENGTHS)],
            'growthAreas' => ['required', 'array', 'max:10'],
            'growthAreas.*' => ['string', 'distinct', Rule::in(StudentProfilePresenter::GROWTH_AREAS)],
            'learningPreferences' => ['required', 'array', 'max:8'],
            'learningPreferences.*' => ['string', 'distinct', Rule::in(StudentProfilePresenter::LEARNING_PREFERENCES)],
        ]);

        $location = isset($validated['location'])
            ? app(ProfileLocation::class)->attributes($validated['location'])
            : [];

        $lrn = $this->nullableText($validated['lrn'] ?? null);
        $lrnLookupHash = $lrn === null ? null : hash('sha256', mb_strtolower($lrn));
        if ($lrnLookupHash !== null && StudentProfile::query()
            ->where('lrn_lookup_hash', $lrnLookupHash)
            ->where('user_id', '!=', $request->user()->getKey())
            ->exists()) {
            throw ValidationException::withMessages([
                'lrn' => 'This learner reference number is already connected to another account.',
            ]);
        }

        StudentProfile::query()->updateOrCreate(
            ['user_id' => $request->user()->getKey()],
            [
                'lrn' => $lrn,
                'lrn_lookup_hash' => $lrnLookupHash,
                'birth_date' => $this->nullableText($validated['birthDate'] ?? null),
                'phone' => $this->nullableText($validated['phone'] ?? null),
                'address_line' => $this->nullableText($validated['addressLine'] ?? null),
                ...$location,
                'shs_school_name' => $this->nullableText($validated['shsSchoolName'] ?? null),
                'shs_strand' => $this->nullableText($validated['shsStrand'] ?? null),
                'shs_graduation_year' => $validated['shsGraduationYear'] ?? null,
                'strengths' => array_values($validated['strengths']),
                'growth_areas' => array_values($validated['growthAreas']),
                'learning_preferences' => array_values($validated['learningPreferences']),
            ],
        );

        return response()->json(['data' => $presenter->present($request->user()->fresh())]);
    }

    private function nullableText(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    public function storePhoto(Request $request, StudentProfilePresenter $presenter): JsonResponse
    {
        $validated = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:5120', 'dimensions:min_width=160,min_height=160,max_width=5000,max_height=5000'],
        ]);
        $profile = StudentProfile::query()->firstOrCreate(
            ['user_id' => $request->user()->getKey()],
            ['strengths' => [], 'growth_areas' => [], 'learning_preferences' => []],
        );
        $previousPath = $profile->photo_path;
        $path = $validated['photo']->store('student-profile-media/'.$request->user()->getKey(), 'local');
        abort_unless($path, 500, 'The profile photo could not be stored.');
        $profile->update(['photo_path' => $path]);
        if ($previousPath && $previousPath !== $path) {
            Storage::disk('local')->delete($previousPath);
        }

        return response()->json(['data' => $presenter->present($request->user()->fresh())], 201);
    }

    public function showPhoto(Request $request, User $student)
    {
        $viewer = $request->user();
        abort_unless(
            $viewer->is($student) || $viewer->hasRole(RoleSlug::Admin),
            403,
        );
        abort_unless($student->roles()->where('slug', RoleSlug::Student->value)->exists(), 404);
        $path = $student->studentProfile?->photo_path;
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }
}
