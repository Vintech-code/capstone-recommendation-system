<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Models\AssessmentSession;
use App\Services\Assessment\ResultCardPresenter;
use Illuminate\Http\JsonResponse;

final class SharedResultController extends Controller
{
    public function __construct(private readonly ResultCardPresenter $presenter)
    {
    }

    public function show(string $shareToken): JsonResponse
    {
        abort_if(strlen($shareToken) < 16 || strlen($shareToken) > 64, 404, 'Invalid share token.');

        $session = AssessmentSession::query()
            ->where('share_token', $shareToken)
            ->first();

        abort_if($session === null || $session->status !== 'result_available', 404, 'Shared assessment result not found or unavailable.');

        return response()->json([
            'data' => $this->presenter->present($session),
        ]);
    }
}

