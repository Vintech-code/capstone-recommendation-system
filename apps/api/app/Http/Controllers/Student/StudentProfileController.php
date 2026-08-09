<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\RoleSlug;
use App\Models\StudentProfile;
use App\Models\User;
use App\Services\Student\StudentProfilePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

final class StudentProfileController extends Controller
{
    public function show(Request $request, StudentProfilePresenter $presenter): JsonResponse
    {
        return response()->json(['data' => $presenter->present($request->user())]);
    }

    public function store(Request $request, StudentProfilePresenter $presenter): JsonResponse
    {
        $validated = $request->validate([
            'strengths' => ['required', 'array', 'max:10'],
            'strengths.*' => ['string', 'distinct', Rule::in(StudentProfilePresenter::STRENGTHS)],
            'growthAreas' => ['required', 'array', 'max:10'],
            'growthAreas.*' => ['string', 'distinct', Rule::in(StudentProfilePresenter::GROWTH_AREAS)],
            'learningPreferences' => ['required', 'array', 'max:8'],
            'learningPreferences.*' => ['string', 'distinct', Rule::in(StudentProfilePresenter::LEARNING_PREFERENCES)],
        ]);

        StudentProfile::query()->updateOrCreate(
            ['user_id' => $request->user()->getKey()],
            [
                'strengths' => array_values($validated['strengths']),
                'growth_areas' => array_values($validated['growthAreas']),
                'learning_preferences' => array_values($validated['learningPreferences']),
            ],
        );

        return response()->json(['data' => $presenter->present($request->user()->fresh())]);
    }

    public function riasec(Request $request, StudentProfilePresenter $presenter): JsonResponse
    {
        $result = $presenter->currentRiasec($request->user());

        return response()->json(['data' => [
            'status' => $result ? 'available' : 'not_available',
            'result' => $result,
        ]]);
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
            $viewer->is($student) || $viewer->hasRole(RoleSlug::Admin) || $viewer->hasRole(RoleSlug::Counselor),
            403,
        );
        abort_unless($student->roles()->where('slug', RoleSlug::Student->value)->exists(), 404);
        $path = $student->studentProfile?->photo_path;
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }
}
