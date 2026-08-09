<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\GuidanceCase;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    private function ensureStudent(User $student): void
    {
        abort_unless($student->roles()->where('slug', RoleSlug::Student->value)->exists(), 404);
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
