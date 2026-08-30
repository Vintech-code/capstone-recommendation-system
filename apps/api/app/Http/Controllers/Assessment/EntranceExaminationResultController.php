<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Models\AssessmentSession;
use App\Models\EntranceExaminationResult;
use App\Models\User;
use App\Services\Assessment\EntranceExaminationPolicy;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class EntranceExaminationResultController extends Controller
{
    public function show(Request $request, EntranceExaminationPolicy $policy): JsonResponse
    {
        $result = $policy->currentResult($request->user());

        return response()->json(['data' => [
            'status' => $result === null ? 'required' : 'declared',
            'result' => $result === null ? null : $this->resource($result),
            'policy' => $policy->definition(),
        ]]);
    }

    public function store(Request $request, EntranceExaminationPolicy $policy): JsonResponse
    {
        $validated = $request->validate(['score' => ['required', 'numeric', 'between:1,5']]);
        $score = (float) $validated['score'];

        try {
            $group = $policy->classify($score);
        } catch (DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => ['score' => [$exception->getMessage()]],
            ], 422);
        }

        $result = DB::transaction(function () use ($request, $score, $group): EntranceExaminationResult {
            /** @var User $student */
            $student = User::query()->lockForUpdate()->findOrFail($request->user()->getKey());
            $current = app(EntranceExaminationPolicy::class)->currentResult($student);

            if ($current !== null && $current->assessmentSessions()->exists()) {
                abort(409, 'The declared result is already attached to an assessment and cannot be replaced.');
            }

            if ($current !== null) {
                $current->forceFill(['superseded_at' => now()])->save();
            }

            $result = EntranceExaminationResult::query()->create([
                'user_id' => $student->getKey(),
                'score' => number_format($score, 1, '.', ''),
                'eligibility_group' => $group,
                'rule_reference' => EntranceExaminationPolicy::RULE_REFERENCE,
                'declared_at' => now(),
            ]);

            AssessmentSession::query()
                ->whereBelongsTo($student)
                ->where('is_current', true)
                ->whereNull('entrance_examination_result_id')
                ->whereIn('status', ['in_progress', 'preparing_result', 'result_failed'])
                ->update(['entrance_examination_result_id' => $result->getKey()]);

            return $result;
        });

        return response()->json(['data' => [
            'status' => 'declared',
            'result' => $this->resource($result),
            'policy' => $policy->definition(),
        ]], 201);
    }

    /** @return array<string, mixed> */
    private function resource(EntranceExaminationResult $result): array
    {
        return [
            'id' => $result->getKey(),
            'score' => (float) $result->score,
            'eligibilityGroup' => $result->eligibility_group,
            'ruleReference' => $result->rule_reference,
            'source' => 'student_self_declared',
            'declaredAt' => $result->declared_at?->toAtomString(),
        ];
    }
}
