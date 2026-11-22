<?php

namespace App\Http\Controllers\Recommendation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Recommendation\StoreRecommendationFeedbackRequest;
use App\Models\RecommendationFeedback;
use App\Models\RecommendationRun;
use Illuminate\Http\JsonResponse;

final class StudentRecommendationFeedbackController extends Controller
{
    public function store(
        StoreRecommendationFeedbackRequest $request,
        string $recommendationReference,
        string $programme,
    ): JsonResponse {
        $runId = $this->runId($recommendationReference);
        $run = RecommendationRun::query()
            ->whereKey($runId)
            ->whereBelongsTo($request->user())
            ->firstOrFail();

        $programmeExists = collect($run->ranked_courses ?? [])->contains(
            static fn (mixed $course): bool => is_array($course)
                && ($course['id'] ?? null) === $programme,
        );
        abort_unless($programmeExists, 404, 'Programme recommendation not found.');

        $validated = $request->validated();
        $feedback = RecommendationFeedback::query()->firstOrNew([
            'user_id' => $request->user()->getKey(),
            'recommendation_run_id' => $run->getKey(),
            'programme_id' => $programme,
        ]);
        $created = ! $feedback->exists;
        $feedback->fill([
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ])->save();

        return response()->json(['data' => [
            'rating' => $feedback->rating,
            'comment' => $feedback->comment,
            'updatedAt' => $feedback->updated_at?->toAtomString(),
        ]], $created ? 201 : 200);
    }

    private function runId(string $reference): int
    {
        abort_unless(preg_match('/^REC-(\d{6,})$/', $reference, $matches) === 1, 404);

        return (int) $matches[1];
    }
}
