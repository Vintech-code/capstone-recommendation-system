<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assessment\RiasecQuestionnaireResultsRequest;
use App\Services\Assessment\RiasecQuestionnaire;
use Illuminate\Http\JsonResponse;

final class RiasecQuestionnaireController extends Controller
{
    public function questions(RiasecQuestionnaire $questionnaire): JsonResponse
    {
        return response()->json(['data' => $questionnaire->questions()]);
    }

    public function results(
        RiasecQuestionnaireResultsRequest $request,
        RiasecQuestionnaire $questionnaire,
    ): JsonResponse {
        /** @var array<int, int> $answers */
        $answers = $request->validated('answers');

        return response()->json(['data' => $questionnaire->results($answers)]);
    }
}
