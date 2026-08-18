<?php

namespace App\Http\Controllers\Guidance;

use App\Http\Controllers\Controller;
use App\Models\GuidanceRequest;
use App\Models\GuidanceRequestEvent;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

final class StudentGuidanceRequestController extends Controller
{
    public function index(Request $request, TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $programmes = collect($catalogues->current()['programmes'] ?? [])->keyBy('id');
        $requests = GuidanceRequest::query()
            ->where('student_id', $request->user()->getKey())
            ->with(['acceptedBy:id,name', 'events.actor:id,name'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (GuidanceRequest $guidanceRequest): array => $this->payload($guidanceRequest, $programmes->get($guidanceRequest->programme_id)));

        return response()->json(['data' => $requests]);
    }

    public function store(Request $request, TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $programmeIds = collect($catalogues->current()['programmes'] ?? [])->pluck('id')->all();
        $validated = $request->validate([
            'programmeId' => ['nullable', 'string', Rule::in($programmeIds)],
            'concernCategory' => ['required', Rule::in(['programme_comparison', 'programme_fit', 'course_requirements', 'career_direction', 'general_guidance'])],
            'message' => ['required', 'string', 'min:10', 'max:1000'],
            'preferredFormat' => ['required', Rule::in(['in_person', 'video_call', 'phone'])],
            'preferredDate' => ['nullable', 'date', 'after_or_equal:today'],
        ]);

        $guidanceRequest = GuidanceRequest::query()->create([
            'student_id' => $request->user()->getKey(),
            'programme_id' => $validated['programmeId'] ?? null,
            'concern_category' => $validated['concernCategory'],
            'message' => trim($validated['message']),
            'preferred_format' => $validated['preferredFormat'],
            'preferred_date' => $validated['preferredDate'] ?? null,
            'status' => 'pending',
        ]);
        $guidanceRequest->events()->create([
            'actor_id' => $request->user()->getKey(),
            'event_type' => 'submitted',
            'from_status' => null,
            'to_status' => 'pending',
        ]);
        $programme = collect($catalogues->current()['programmes'] ?? [])->firstWhere('id', $guidanceRequest->programme_id);

        return response()->json(['data' => $this->payload($guidanceRequest->load(['acceptedBy:id,name', 'events.actor:id,name']), $programme)], 201);
    }

    public function cancel(Request $request, GuidanceRequest $guidanceRequest, TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        abort_unless($guidanceRequest->student_id === $request->user()->getKey(), 404);
        $validated = $request->validate(['reason' => ['required', 'string', 'min:3', 'max:1000']]);

        $guidanceRequest = DB::transaction(function () use ($request, $guidanceRequest, $validated): GuidanceRequest {
            $locked = GuidanceRequest::query()->lockForUpdate()->findOrFail($guidanceRequest->getKey());
            abort_unless($locked->status === 'pending', 409, 'Only a pending guidance request can be cancelled.');
            $locked->update([
                'status' => 'cancelled',
                'closed_at' => now(),
                'resolution_reason' => trim($validated['reason']),
            ]);
            $locked->events()->create([
                'actor_id' => $request->user()->getKey(),
                'event_type' => 'cancelled',
                'from_status' => 'pending',
                'to_status' => 'cancelled',
                'reason' => $locked->resolution_reason,
            ]);

            return $locked;
        });
        $programme = collect($catalogues->current()['programmes'] ?? [])->firstWhere('id', $guidanceRequest->programme_id);

        return response()->json(['data' => $this->payload($guidanceRequest->load(['acceptedBy:id,name', 'events.actor:id,name']), $programme)]);
    }

    /** @param array<string, mixed>|null $programme */
    private function payload(GuidanceRequest $guidanceRequest, ?array $programme): array
    {
        return [
            'id' => $guidanceRequest->getKey(),
            'programmeId' => $guidanceRequest->programme_id,
            'programmeCode' => $programme['short_label'] ?? null,
            'programmeName' => $programme['display_name'] ?? null,
            'concernCategory' => $guidanceRequest->concern_category,
            'message' => $guidanceRequest->message,
            'preferredFormat' => $guidanceRequest->preferred_format,
            'preferredDate' => $guidanceRequest->preferred_date?->toDateString(),
            'status' => $guidanceRequest->status,
            'acceptedBy' => $guidanceRequest->acceptedBy?->name,
            'acceptedAt' => $guidanceRequest->accepted_at?->toAtomString(),
            'closedAt' => $guidanceRequest->closed_at?->toAtomString(),
            'resolutionReason' => $guidanceRequest->resolution_reason,
            'createdAt' => $guidanceRequest->created_at?->toAtomString(),
            'statusHistory' => $guidanceRequest->events->map(static fn (GuidanceRequestEvent $event): array => [
                'eventType' => $event->event_type,
                'fromStatus' => $event->from_status,
                'toStatus' => $event->to_status,
                'reason' => $event->reason,
                'actor' => $event->actor?->name,
                'createdAt' => $event->created_at?->toAtomString(),
            ])->values()->all(),
        ];
    }
}
