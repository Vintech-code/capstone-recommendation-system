<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Career\EscoOccupationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

final class AdminEscoOccupationController extends Controller
{
    public function index(Request $request, EscoOccupationService $esco): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        try {
            return response()->json(['data' => $esco->search($validated['query'])]);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 502);
        }
    }

    public function show(Request $request, EscoOccupationService $esco): JsonResponse
    {
        $validated = $request->validate([
            'uri' => ['required', 'string', 'starts_with:'.EscoOccupationService::OCCUPATION_URI_PREFIX],
        ]);

        try {
            return response()->json(['data' => $esco->occupation($validated['uri'])]);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 502);
        }
    }
}
