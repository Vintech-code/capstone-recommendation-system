<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class PasswordRecoveryController extends Controller
{
    public function requestLink(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => ['required', 'email']]);
        $activeAccountExists = User::query()
            ->where('email', $validated['email'])
            ->where('account_status', 'active')
            ->exists();
        if ($activeAccountExists) {
            Password::sendResetLink($validated);
        }

        return response()->json([
            'message' => 'If an active account matches that email, a password reset link has been sent.',
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        if (! User::query()->where('email', $validated['email'])->where('account_status', 'active')->exists()) {
            return response()->json([
                'message' => 'This password reset link is invalid or has expired.',
                'errors' => ['email' => ['Request a new password reset link.']],
            ], 422);
        }

        $status = Password::reset($validated, function (User $user, string $password): void {
            $user->forceFill([
                'password' => Hash::make($password),
                'remember_token' => Str::random(60),
            ])->save();
            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'This password reset link is invalid or has expired.',
                'errors' => ['email' => ['Request a new password reset link.']],
            ], 422);
        }

        return response()->json(['message' => 'Your password has been reset.']);
    }
}
