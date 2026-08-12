<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\UserSessionRevoker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

final class PasswordChangeController extends Controller
{
    public function __invoke(Request $request, UserSessionRevoker $sessions): JsonResponse
    {
        $validated = $request->validate([
            'currentPassword' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()->symbols()],
        ]);
        $user = $request->user();
        if (! Hash::check($validated['currentPassword'], $user->password)) {
            throw ValidationException::withMessages(['currentPassword' => ['The current password is incorrect.']]);
        }
        $user->update(['password' => $validated['password'], 'must_change_password' => false]);
        $sessions->revoke($user, $request->hasSession() ? $request->session()->getId() : null);

        return response()->json(['data' => ['changed' => true]]);
    }
}
