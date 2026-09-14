<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCanManageAdministrators
{
    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();
        if ($user === null || ! $user->can_manage_administrators) {
            return new JsonResponse([
                'message' => 'You do not have permission to manage Administrator accounts.',
                'error' => ['code' => 'ADMINISTRATOR_MANAGEMENT_FORBIDDEN'],
            ], 403);
        }

        return $next($request);
    }
}
