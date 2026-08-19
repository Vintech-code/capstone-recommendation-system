<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    public function store(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->safe()->only(['email', 'password']))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        /** @var User $user */
        $user = $request->user()->load(['roles', 'studentProfile']);

        if ($user->account_status !== 'active') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => match ($user->account_status) {
                    'pending' => 'This account is awaiting activation.',
                    'suspended' => 'This account is suspended. Contact an authorized administrator.',
                    'archived' => 'This account is archived. Contact an authorized administrator.',
                    default => 'This account is not currently active.',
                },
                'error' => ['code' => 'ACCOUNT_NOT_ACTIVE'],
            ], 403);
        }

        if (! $user->hasRole($request->role())) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'This account cannot access the selected portal.',
            ], 403);
        }

        return response()->json(['user' => $this->userPayload($user)]);
    }

    public function show(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->load(['roles', 'studentProfile']);

        return response()->json(['user' => $this->userPayload($user)]);
    }

    public function destroy(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Auth::forgetGuards();

        return response()->json(['message' => 'Signed out.']);
    }

    /**
     * @return array{id: int, name: string, email: string, accountStatus: string, mustChangePassword: bool, photoUrl: string|null, roles: array<int, string>}
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'accountStatus' => $user->account_status,
            'mustChangePassword' => (bool) $user->must_change_password,
            'photoUrl' => $user->studentProfile?->photo_path
                ? '/api/v1/profile-photos/'.$user->getKey().'?v='.$user->studentProfile->updated_at?->getTimestamp()
                : null,
            'roles' => $user->roles->pluck('slug')->values()->all(),
        ];
    }
}
