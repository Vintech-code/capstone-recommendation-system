<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null) {
            $user->refresh();
        }

        if ($user?->account_status !== 'active') {
            Auth::guard('web')->logout();

            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            Auth::forgetGuards();

            return new JsonResponse([
                'message' => 'This account is not currently active.',
                'error' => ['code' => 'ACCOUNT_NOT_ACTIVE'],
            ], 403);
        }

        return $next($request);
    }
}
