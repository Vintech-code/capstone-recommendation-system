<?php

namespace App\Http\Controllers\Guidance;

use App\Http\Controllers\Controller;
use App\Models\GuidanceSummary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class StudentGuidanceSummaryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $summaries = GuidanceSummary::query()
            ->whereHas('guidanceCase', fn ($query) => $query->where('student_id', $request->user()->getKey()))
            ->whereNotNull('published_at')
            ->with(['author:id,name', 'publishedBy:id,name'])
            ->latest('published_at')
            ->get()
            ->map(static fn (GuidanceSummary $summary): array => [
                'id' => $summary->getKey(),
                'body' => $summary->body,
                'counselor' => $summary->author?->name,
                'publishedBy' => $summary->publishedBy?->name,
                'publishedAt' => $summary->published_at?->toAtomString(),
            ]);

        return response()->json(['data' => $summaries]);
    }
}
