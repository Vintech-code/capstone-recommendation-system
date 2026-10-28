<?php

namespace App\Http\Controllers\Recommendation;

use App\Http\Controllers\Controller;
use App\Models\StudentSavedProgramme;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class StudentSavedProgrammeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $programmeIds = StudentSavedProgramme::query()
            ->where('user_id', $request->user()->getKey())
            ->latest()
            ->pluck('programme_id')
            ->values();

        return response()->json(['data' => ['programmeIds' => $programmeIds]]);
    }

    public function store(Request $request, string $programme, TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $exists = collect($catalogues->current()['programmes'] ?? [])->contains('id', $programme);
        abort_unless($exists, 404, 'Programme not found.');

        StudentSavedProgramme::query()->firstOrCreate([
            'user_id' => $request->user()->getKey(),
            'programme_id' => $programme,
        ]);

        return response()->json(['data' => ['programmeId' => $programme, 'saved' => true]], 201);
    }

    public function destroy(Request $request, string $programme): JsonResponse
    {
        StudentSavedProgramme::query()
            ->where('user_id', $request->user()->getKey())
            ->where('programme_id', $programme)
            ->delete();

        return response()->json(['data' => ['programmeId' => $programme, 'saved' => false]]);
    }
}
