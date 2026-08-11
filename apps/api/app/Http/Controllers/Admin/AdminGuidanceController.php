<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\GuidanceCase;
use App\Models\GuidanceSummary;
use App\Models\RoleSlug;
use App\Models\User;
use App\Services\Notifications\PathwaysNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class AdminGuidanceController extends Controller
{
    public function updateCase(Request $request, User $student): JsonResponse
    {
        $this->ensureStudent($student);
        abort_unless($request->user()->hasRole(RoleSlug::Counselor), 403);
        $validated = $request->validate([
            'status' => ['required', 'in:open,follow_up,closed'],
            'followUpOn' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $case = GuidanceCase::query()->firstOrNew(['student_id' => $student->getKey()]);
        if ($case->exists && $case->assigned_to_id !== null && $case->assigned_to_id !== $request->user()->getKey()) {
            abort(403, 'This counseling record is owned by another counselor.');
        }
        $case->fill([
            'assigned_to_id' => $request->user()->getKey(),
            'status' => $validated['status'],
            'follow_up_on' => $validated['followUpOn'] ?? null,
        ])->save();

        $this->audit($request, 'guidance_case.updated', 'guidance_case', (string) $case->getKey(), [
            'student_id' => $student->getKey(),
            'status' => $case->status,
            'follow_up_on' => $case->follow_up_on?->toDateString(),
            'assigned_to_id' => $case->assigned_to_id,
        ]);

        return response()->json(['data' => $this->casePayload($case->load('assignedTo:id,name'))]);
    }

    public function storeNote(Request $request, User $student): JsonResponse
    {
        abort_unless($request->user()->hasRole(RoleSlug::Counselor), 403);
        $this->ensureStudent($student);
        $validated = $request->validate(['body' => ['required', 'string', 'min:2', 'max:4000']]);
        $case = GuidanceCase::query()->firstOrCreate(
            ['student_id' => $student->getKey()],
            ['assigned_to_id' => $request->user()->hasRole(RoleSlug::Counselor) ? $request->user()->getKey() : null, 'status' => 'open'],
        );
        abort_if($case->assigned_to_id !== null && $case->assigned_to_id !== $request->user()->getKey(), 403, 'This counseling record is owned by another counselor.');
        $note = $case->notes()->create([
            'author_id' => $request->user()->getKey(),
            'body' => trim($validated['body']),
        ]);

        $this->audit($request, 'guidance_note.created', 'guidance_note', (string) $note->getKey(), [
            'student_id' => $student->getKey(),
            'guidance_case_id' => $case->getKey(),
        ]);

        return response()->json(['data' => [
            'id' => $note->getKey(),
            'body' => $note->body,
            'author' => $request->user()->name,
            'createdAt' => $note->created_at?->toAtomString(),
        ]], 201);
    }

    public function storeSummary(Request $request, User $student): JsonResponse
    {
        abort_unless($request->user()->hasRole(RoleSlug::Counselor), 403);
        $this->ensureStudent($student);
        $validated = $request->validate(['body' => ['required', 'string', 'min:2', 'max:4000']]);
        $case = $this->ownedCase($request, $student);
        $summary = $case->summaries()->whereNull('published_at')->latest()->first();
        $created = $summary === null;
        if ($summary === null) {
            $summary = $case->summaries()->create([
                'author_id' => $request->user()->getKey(),
                'body' => trim($validated['body']),
            ]);
        } else {
            $summary->update(['body' => trim($validated['body'])]);
        }

        $this->audit($request, $created ? 'guidance_summary.draft_created' : 'guidance_summary.draft_updated', 'guidance_summary', (string) $summary->getKey(), [
            'student_id' => $student->getKey(),
            'guidance_case_id' => $case->getKey(),
        ]);

        return response()->json(['data' => $this->summaryPayload($summary->load(['author:id,name', 'publishedBy:id,name']))], $created ? 201 : 200);
    }

    public function updateSummary(Request $request, User $student, GuidanceSummary $guidanceSummary): JsonResponse
    {
        abort_unless($request->user()->hasRole(RoleSlug::Counselor), 403);
        $this->ensureStudent($student);
        $validated = $request->validate(['body' => ['required', 'string', 'min:2', 'max:4000']]);
        abort_unless($guidanceSummary->guidanceCase()->where('student_id', $student->getKey())->exists(), 404);
        $case = $this->ownedCase($request, $student);
        abort_unless($guidanceSummary->guidance_case_id === $case->getKey(), 404);
        abort_if($guidanceSummary->published_at !== null, 409, 'Published guidance summaries are immutable.');
        $guidanceSummary->update(['body' => trim($validated['body'])]);

        $this->audit($request, 'guidance_summary.draft_updated', 'guidance_summary', (string) $guidanceSummary->getKey(), [
            'student_id' => $student->getKey(),
            'guidance_case_id' => $case->getKey(),
        ]);

        return response()->json(['data' => $this->summaryPayload($guidanceSummary->load(['author:id,name', 'publishedBy:id,name']))]);
    }

    public function publishSummary(Request $request, User $student, GuidanceSummary $guidanceSummary, PathwaysNotifier $notifier): JsonResponse
    {
        abort_unless($request->user()->hasRole(RoleSlug::Counselor), 403);
        $this->ensureStudent($student);
        abort_unless($guidanceSummary->guidanceCase()->where('student_id', $student->getKey())->exists(), 404);
        $case = $this->ownedCase($request, $student);
        abort_unless($guidanceSummary->guidance_case_id === $case->getKey(), 404);

        $guidanceSummary = DB::transaction(function () use ($guidanceSummary, $request): GuidanceSummary {
            $locked = GuidanceSummary::query()->lockForUpdate()->findOrFail($guidanceSummary->getKey());
            abort_if($locked->published_at !== null, 409, 'This guidance summary has already been published.');
            $locked->update([
                'published_by' => $request->user()->getKey(),
                'published_at' => now(),
            ]);

            return $locked;
        });

        $this->audit($request, 'guidance_summary.published', 'guidance_summary', (string) $guidanceSummary->getKey(), [
            'student_id' => $student->getKey(),
            'guidance_case_id' => $case->getKey(),
        ]);
        $notifier->notify(
            $student,
            'guidance_summary_published',
            'Guidance summary available',
            'Your counselor published guidance and next steps for you to review.',
            ['guidanceSummaryId' => $guidanceSummary->getKey()],
        );

        return response()->json(['data' => $this->summaryPayload($guidanceSummary->load(['author:id,name', 'publishedBy:id,name']))]);
    }

    private function ensureStudent(User $student): void
    {
        abort_unless($student->roles()->where('slug', RoleSlug::Student->value)->exists(), 404);
    }

    private function ownedCase(Request $request, User $student): GuidanceCase
    {
        $case = GuidanceCase::query()->firstOrCreate(
            ['student_id' => $student->getKey()],
            ['assigned_to_id' => $request->user()->getKey(), 'status' => 'open'],
        );
        abort_if($case->assigned_to_id !== null && $case->assigned_to_id !== $request->user()->getKey(), 403, 'This counseling record is owned by another counselor.');
        if ($case->assigned_to_id === null) {
            $case->update(['assigned_to_id' => $request->user()->getKey()]);
        }

        return $case;
    }

    /** @return array<string, mixed> */
    private function summaryPayload(GuidanceSummary $summary): array
    {
        return [
            'id' => $summary->getKey(),
            'body' => $summary->body,
            'author' => $summary->author?->name,
            'status' => $summary->published_at === null ? 'draft' : 'published',
            'publishedBy' => $summary->publishedBy?->name,
            'publishedAt' => $summary->published_at?->toAtomString(),
            'createdAt' => $summary->created_at?->toAtomString(),
            'updatedAt' => $summary->updated_at?->toAtomString(),
        ];
    }

    /** @return array<string, mixed> */
    private function casePayload(GuidanceCase $case): array
    {
        return [
            'id' => $case->getKey(),
            'status' => $case->status,
            'followUpOn' => $case->follow_up_on?->toDateString(),
            'assignedTo' => $case->assignedTo?->name,
            'assignedToId' => $case->assigned_to_id,
        ];
    }

    /** @param array<string, mixed> $metadata */
    private function audit(Request $request, string $action, string $type, string $reference, array $metadata): void
    {
        AdminAuditEvent::query()->create([
            'actor_id' => $request->user()->getKey(),
            'action' => $action,
            'subject_type' => $type,
            'subject_reference' => $reference,
            'metadata' => $metadata,
        ]);
    }
}
