<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assessment\OnetMiniIpResultsRequest;
use App\Services\Onet\OnetInterestProfilerClient;
use Illuminate\Http\JsonResponse;

class OnetInterestProfilerController extends Controller
{
    public function questions(OnetInterestProfilerClient $client): JsonResponse
    {
        return response()->json(['data' => $client->questions()]);
    }

    public function results(
        OnetMiniIpResultsRequest $request,
        OnetInterestProfilerClient $client,
    ): JsonResponse {
        /** @var array<int, int> $answers */
        $answers = $request->validated('answers');

        return response()->json(['data' => $client->results($answers)]);
    }
}
