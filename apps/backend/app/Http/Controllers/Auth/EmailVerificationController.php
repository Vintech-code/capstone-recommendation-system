<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function verify(Request $request, int $id, string $hash): RedirectResponse
    {
        $user = User::query()->findOrFail($id);
        abort_unless(hash_equals($hash, sha1($user->getEmailForVerification())), 403);

        if (! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        $frontend = rtrim((string) config('app.frontend_url'), '/');

        return redirect()->away($frontend.'/student/login?email_verified=1');
    }

    public function resend(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => ['required', 'email', 'max:255']]);
        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [mb_strtolower(trim((string) $validated['email']))])
            ->first();

        if ($user && ! $user->hasVerifiedEmail() && $user->account_status === 'active') {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => 'If an unverified account matches that email, a new verification link has been sent.',
        ]);
    }
}
