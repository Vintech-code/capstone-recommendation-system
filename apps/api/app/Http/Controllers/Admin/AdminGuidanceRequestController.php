<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\GuidanceRequest;
use App\Models\GuidanceRequestEvent;
use App\Models\RoleSlug;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class AdminGuidanceRequestController extends Controller
{
    public function index(Request $request, TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $programmes = collect($catalogues->current()['programmes'] ?? [])->keyBy('id');
        $requests = GuidanceRequest::query()
            ->with(['student:id,name,email', 'acceptedBy:id,name', 'events.actor:id,name'])
            ->when($request->user()->hasRole(RoleSlug::Counselor), function ($query) use ($request): void {
                $query->where(function ($ownership) use ($request): void {
                    $ownership->where('status', 'pending')->orWhere('accepted_by', $request->user()->getKey());
                });
            })
            ->orderByRaw("case when status = 'pending' then 0 else 1 end")
            ->latest()
            ->get()
            ->map(function (GuidanceRequest $guidanceRequest) use ($programmes): array {
                $programme = $programmes->get($guidanceRequest->programme_id);

                return [
                    'id' => $guidanceRequest->getKey(),
                    'studentId' => $guidanceRequest->student_id,
                    'studentName' => $guidanceRequest->student?->name,
                    'studentEmail' => $guidanceRequest->student?->email,
                    'programmeId' => $guidanceRequest->programme_id,
                    'programmeCode' => $programme['short_label'] ?? null,
                    'programmeName' => $programme['display_name'] ?? null,
                    'concernCategory' => $guidanceRequest->concern_category,
                    'message' => $guidanceRequest->message,
                    'preferredFormat' => $guidanceRequest->preferred_format,
                    'preferredDate' => $guidanceRequest->preferred_date?->toDateString(),
                    'status' => $guidanceRequest->status,
                    'acceptedById' => $guidanceRequest->accepted_by,
                    'acceptedBy' => $guidanceRequest->acceptedBy?->name,
                    'acceptedAt' => $guidanceRequest->accepted_at?->toAtomString(),
                    'appointmentId' => $guidanceRequest->appointment_id,
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
            });

        return response()->json(['data' => $requests]);
    }

    public function decline(Request $request, GuidanceRequest $guidanceRequest): JsonResponse
    {
        $validated = $request->validate(['reason' => ['required', 'string', 'min:3', 'max:1000']]);

        $guidanceRequest = DB::transaction(function () use ($request, $guidanceRequest, $validated): GuidanceRequest {
            $locked = GuidanceRequest::query()->lockForUpdate()->findOrFail($guidanceRequest->getKey());
            abort_unless($locked->status === 'pending', 409, 'This guidance request has already been handled.');
            $locked->update([
                'status' => 'declined',
                'closed_at' => now(),
                'resolution_reason' => trim($validated['reason']),
            ]);
            $locked->events()->create([
                'actor_id' => $request->user()->getKey(),
                'event_type' => 'declined',
                'from_status' => 'pending',
                'to_status' => 'declined',
                'reason' => $locked->resolution_reason,
            ]);
            AdminAuditEvent::query()->create([
                'actor_id' => $request->user()->getKey(),
                'action' => 'guidance_request.declined',
                'subject_type' => 'guidance_request',
                'subject_reference' => (string) $locked->getKey(),
                'metadata' => ['student_id' => $locked->student_id, 'status' => 'declined'],
            ]);

            return $locked;
        });

        $guidanceRequest->load(['student:id,name,email', 'acceptedBy:id,name', 'events.actor:id,name']);

        return response()->json(['data' => [
            'id' => $guidanceRequest->getKey(),
            'studentId' => $guidanceRequest->student_id,
            'studentName' => $guidanceRequest->student?->name,
            'studentEmail' => $guidanceRequest->student?->email,
            'programmeId' => $guidanceRequest->programme_id,
            'concernCategory' => $guidanceRequest->concern_category,
            'message' => $guidanceRequest->message,
            'preferredFormat' => $guidanceRequest->preferred_format,
            'preferredDate' => $guidanceRequest->preferred_date?->toDateString(),
            'status' => $guidanceRequest->status,
            'acceptedById' => $guidanceRequest->accepted_by,
            'acceptedBy' => $guidanceRequest->acceptedBy?->name,
            'acceptedAt' => $guidanceRequest->accepted_at?->toAtomString(),
            'appointmentId' => $guidanceRequest->appointment_id,
            'resolutionReason' => $guidanceRequest->resolution_reason,
            'closedAt' => $guidanceRequest->closed_at?->toAtomString(),
            'createdAt' => $guidanceRequest->created_at?->toAtomString(),
            'statusHistory' => $guidanceRequest->events->map(static fn (GuidanceRequestEvent $event): array => [
                'eventType' => $event->event_type,
                'fromStatus' => $event->from_status,
                'toStatus' => $event->to_status,
                'reason' => $event->reason,
                'actor' => $event->actor?->name,
                'createdAt' => $event->created_at?->toAtomString(),
            ])->values()->all(),
        ]]);
    }
}
