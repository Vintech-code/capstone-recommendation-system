<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\GuidanceRequest;
use App\Models\GuidanceRequestEvent;
use App\Models\RoleSlug;
use App\Services\Notifications\PathwaysNotifier;
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

    public function accept(Request $request, GuidanceRequest $guidanceRequest, PathwaysNotifier $notifier): JsonResponse
    {
        $guidanceRequest = DB::transaction(function () use ($request, $guidanceRequest): GuidanceRequest {
            $locked = GuidanceRequest::query()->lockForUpdate()->findOrFail($guidanceRequest->getKey());
            abort_unless($locked->status === 'pending', 409, 'This guidance request has already been handled.');
            $locked->update([
                'status' => 'accepted',
                'accepted_by' => $request->user()->getKey(),
                'accepted_at' => now(),
            ]);
            $locked->events()->create([
                'actor_id' => $request->user()->getKey(),
                'event_type' => 'accepted',
                'from_status' => 'pending',
                'to_status' => 'accepted',
            ]);
            AdminAuditEvent::query()->create([
                'actor_id' => $request->user()->getKey(),
                'action' => 'guidance_request.accepted',
                'subject_type' => 'guidance_request',
                'subject_reference' => (string) $locked->getKey(),
                'metadata' => ['student_id' => $locked->student_id, 'status' => 'accepted'],
            ]);

            return $locked;
        });

        $guidanceRequest->loadMissing('student:id,name,email');
        if ($guidanceRequest->student !== null) {
            $notifier->notify(
                $guidanceRequest->student,
                'guidance_request_accepted',
                'Guidance request accepted',
                'A counselor has accepted your guidance concern and will review your recorded information.',
                ['guidanceRequestId' => $guidanceRequest->getKey()],
            );
        }

        return $this->response($guidanceRequest);
    }

    public function resolve(Request $request, GuidanceRequest $guidanceRequest, PathwaysNotifier $notifier): JsonResponse
    {
        $validated = $request->validate(['summary' => ['required', 'string', 'min:3', 'max:1000']]);
        $guidanceRequest = DB::transaction(function () use ($request, $guidanceRequest, $validated): GuidanceRequest {
            $locked = GuidanceRequest::query()->lockForUpdate()->findOrFail($guidanceRequest->getKey());
            abort_unless($locked->status === 'accepted' && $locked->accepted_by === $request->user()->getKey(), 409, 'Only the counselor handling this active concern can resolve it.');
            $locked->update([
                'status' => 'closed',
                'closed_at' => now(),
                'resolution_reason' => trim($validated['summary']),
            ]);
            $locked->events()->create([
                'actor_id' => $request->user()->getKey(),
                'event_type' => 'resolved',
                'from_status' => 'accepted',
                'to_status' => 'closed',
                'reason' => $locked->resolution_reason,
            ]);
            AdminAuditEvent::query()->create([
                'actor_id' => $request->user()->getKey(),
                'action' => 'guidance_request.resolved',
                'subject_type' => 'guidance_request',
                'subject_reference' => (string) $locked->getKey(),
                'metadata' => ['student_id' => $locked->student_id, 'status' => 'closed'],
            ]);

            return $locked;
        });

        $guidanceRequest->loadMissing('student:id,name,email');
        if ($guidanceRequest->student !== null) {
            $notifier->notify(
                $guidanceRequest->student,
                'guidance_request_resolved',
                'Guidance concern resolved',
                'Your counselor has completed this guidance concern. Review your published guidance summary for next steps.',
                ['guidanceRequestId' => $guidanceRequest->getKey()],
            );
        }

        return $this->response($guidanceRequest);
    }

    public function decline(Request $request, GuidanceRequest $guidanceRequest, PathwaysNotifier $notifier): JsonResponse
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
        if ($guidanceRequest->student !== null) {
            $notifier->notify(
                $guidanceRequest->student,
                'guidance_request_declined',
                'Guidance request update',
                'Your guidance request was declined. Review the recorded reason in your guidance request.',
                ['guidanceRequestId' => $guidanceRequest->getKey()],
            );
        }

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

    private function response(GuidanceRequest $guidanceRequest): JsonResponse
    {
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
