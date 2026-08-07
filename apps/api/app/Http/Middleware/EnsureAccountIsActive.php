<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->account_status !== 'active') {
            return new JsonResponse([
                'message' => 'This account is not currently active.',
                'error' => ['code' => 'ACCOUNT_NOT_ACTIVE'],
            ], 403);
        }

        return $next($request);
    }
}
