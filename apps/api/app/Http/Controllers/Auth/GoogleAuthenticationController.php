<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Throwable;

class GoogleAuthenticationController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (! $this->isConfigured()) {
            return $this->failureRedirect('not_configured');
        }

        /** @var GoogleProvider $google */
        $google = Socialite::driver('google');

        return $google
            ->scopes(['openid', 'email', 'profile'])
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        if (! $this->isConfigured()) {
            return $this->failureRedirect('not_configured');
        }

        try {
            $googleUser = Socialite::driver('google')->user();
            $googleId = trim((string) $googleUser->getId());
            $email = mb_strtolower(trim((string) $googleUser->getEmail()));
            $raw = $googleUser->getRaw();
            $emailVerified = filter_var(
                $raw['email_verified'] ?? $raw['verified_email'] ?? false,
                FILTER_VALIDATE_BOOL,
            );

            if ($googleId === '' || $email === '' || ! $emailVerified) {
                return $this->failureRedirect('email_unverified');
            }

            /** @var array{user?: User, error?: string} $result */
            $result = DB::transaction(function () use ($googleUser, $googleId, $email): array {
                $user = User::query()
                    ->where('google_id', $googleId)
                    ->lockForUpdate()
                    ->first();

                if (! $user) {
                    $user = User::query()
                        ->whereRaw('LOWER(email) = ?', [$email])
                        ->lockForUpdate()
                        ->first();
                }

                if ($user) {
                    $user->loadMissing('roles');

                    if (! $user->hasRole(RoleSlug::Student)) {
                        return ['error' => 'portal_forbidden'];
                    }

                    if ($user->account_status !== 'active') {
                        return ['error' => 'account_inactive'];
                    }

                    if ($user->google_id !== null && $user->google_id !== $googleId) {
                        return ['error' => 'account_conflict'];
                    }

                    $user->forceFill([
                        'google_id' => $googleId,
                        'google_avatar_url' => $googleUser->getAvatar(),
                        'email_verified_at' => $user->email_verified_at ?? now(),
                    ])->save();

                    return ['user' => $user];
                }

                $studentRole = Role::query()->firstOrCreate(
                    ['slug' => RoleSlug::Student->value],
                    ['name' => 'Student Applicant'],
                );

                $user = User::query()->create([
                    'name' => trim((string) $googleUser->getName()) ?: $email,
                    'email' => $email,
                    'password' => Str::random(64),
                    'account_status' => 'active',
                    'must_change_password' => false,
                ]);
                $user->forceFill([
                    'google_id' => $googleId,
                    'google_avatar_url' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ])->save();
                $user->roles()->attach($studentRole);

                return ['user' => $user];
            });

            if (isset($result['error'])) {
                return $this->failureRedirect($result['error']);
            }

            $user = $result['user'];
            Auth::guard('web')->login($user);
            $request->session()->regenerate();

            return $this->frontendRedirect('/student');
        } catch (Throwable $exception) {
            report($exception);

            return $this->failureRedirect('oauth_failed');
        }
    }

    private function isConfigured(): bool
    {
        foreach (['client_id', 'client_secret', 'redirect'] as $key) {
            $value = config("services.google.{$key}");

            if (! is_string($value) || trim($value) === '') {
                return false;
            }
        }

        return true;
    }

    private function failureRedirect(string $code): RedirectResponse
    {
        return $this->frontendRedirect('/student/login?'.http_build_query([
            'google_error' => $code,
        ]));
    }

    private function frontendRedirect(string $path): RedirectResponse
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        return redirect()->away($frontendUrl.$path);
    }
}
