<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class AdminProgrammeMediaController extends Controller
{
    public function store(Request $request, string $programme): JsonResponse
    {
        $validated = $request->validate([
            'kind' => ['required', Rule::in(['cover', 'logo'])],
            'image' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:5120', 'dimensions:min_width=320,min_height=180,max_width=5000,max_height=5000'],
        ]);
        $safeProgramme = preg_replace('/[^a-z0-9-]/', '', strtolower($programme));
        abort_if($safeProgramme === '', 422, 'The programme identifier is invalid.');
        $path = $validated['image']->store("programme-media/{$safeProgramme}/{$validated['kind']}", 'public');

        AdminAuditEvent::query()->create([
            'actor_id' => $request->user()->getKey(),
            'action' => 'programme_media.uploaded',
            'subject_type' => 'programme',
            'subject_reference' => $safeProgramme,
            'metadata' => ['kind' => $validated['kind'], 'path' => $path],
        ]);

        return response()->json(['data' => [
            'kind' => $validated['kind'],
            'url' => '/storage/'.$path,
        ]], 201);
    }
}
