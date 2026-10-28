<?php

namespace App\Http\Middleware;

use App\Models\RoleSlug;
use App\Models\User;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string $requiredRole): Response
    {
        $role = RoleSlug::tryFrom($requiredRole);
        /** @var User|null $user */
        $user = $request->user();

        if ($role === null || $user === null || ! $user->loadMissing('roles')->hasRole($role)) {
            return $this->forbiddenResponse();
        }

        return $next($request);
    }

    private function forbiddenResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'You do not have permission to access this portal.',
            'error' => [
                'code' => 'ROLE_FORBIDDEN',
                'message' => 'You do not have permission to access this portal.',
            ],
        ], 403);
    }
}
