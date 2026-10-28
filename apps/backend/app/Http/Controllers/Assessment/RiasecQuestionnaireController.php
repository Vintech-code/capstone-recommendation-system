<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Services\Assessment\EntranceExaminationPolicy;
use App\Services\Assessment\RiasecQuestionnaire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class RiasecQuestionnaireController extends Controller
{
    public function questions(
        Request $request,
        RiasecQuestionnaire $questionnaire,
        EntranceExaminationPolicy $entranceExamination,
    ): JsonResponse {
        abort_if($entranceExamination->currentResult($request->user()) === null, 409, 'Declare your entrance examination result before starting the assessment.');

        return response()->json(['data' => $questionnaire->questions()]);
    }
}
