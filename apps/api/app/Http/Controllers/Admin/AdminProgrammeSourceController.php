<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\ProgrammeSourceRecord;
use App\Services\Recommendation\ProgrammeSourceRegistry;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AdminProgrammeSourceController extends Controller
{
    public function index(TccProgrammeCatalogueRepository $catalogues, ProgrammeSourceRegistry $registry): JsonResponse
    {
        return response()->json(['data' => $registry->entries($catalogues->current())]);
    }

    public function update(
        Request $request,
        string $sourceReference,
        TccProgrammeCatalogueRepository $catalogues,
        ProgrammeSourceRegistry $registry,
    ): JsonResponse {
        $validated = $request->validate(['lastVerifiedAt' => ['required', 'date', 'before_or_equal:today']]);
        $source = $registry->find($catalogues->current(), $sourceReference);
        abort_if($source === null, 404, 'The programme source was not found in the current catalogue.');

        $record = ProgrammeSourceRecord::query()->updateOrCreate(
            ['reference' => $sourceReference],
            [
                'source_url' => $source['sourceUrl'],
                'source_name' => $source['sourceName'],
                'last_verified_at' => $validated['lastVerifiedAt'],
                'verified_by' => $request->user()->getKey(),
            ],
        );

        AdminAuditEvent::query()->create([
            'actor_id' => $request->user()->getKey(),
            'action' => 'programme_source.verified',
            'subject_type' => 'programme_source',
            'subject_reference' => $sourceReference,
            'metadata' => ['sourceName' => $source['sourceName'], 'lastVerifiedAt' => $validated['lastVerifiedAt']],
        ]);

        return response()->json(['data' => $registry->find($catalogues->current(), $record->reference)]);
    }
}
