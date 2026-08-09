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

        if ($user->must_change_password && ! str_contains($request->path(), 'auth/authorize/')) {
            return response()->json([
                'message' => 'Change the temporary password before using this workspace.',
                'error' => ['code' => 'PASSWORD_CHANGE_REQUIRED'],
            ], 409);
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
