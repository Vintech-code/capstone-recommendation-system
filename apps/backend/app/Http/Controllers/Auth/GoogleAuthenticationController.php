<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AdministratorInvitation;
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
    /**
     * Redirect the browser to Google's account-selection screen.
     * Stores optional ?portal=admin hint in session for the callback.
     */
    public function redirect(Request $request): RedirectResponse
    {
        $portal = $this->normalizedPortal($request->query('portal', 'student'));
        $popupFlow = $this->requestedPopupFlow($request, $portal);

        if (! $this->isConfigured()) {
            return $this->failureRedirect('not_configured', $portal, $popupFlow);
        }

        $request->session()->put('google_auth_portal', $portal);
        if ($popupFlow) {
            $request->session()->put('google_auth_popup_flow', $popupFlow);
        } else {
            $request->session()->forget('google_auth_popup_flow');
        }

        /** @var GoogleProvider $google */
        $google = Socialite::driver('google');

        return $google
            ->scopes(['openid', 'email', 'profile'])
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $portal = $request->session()->pull('google_auth_portal', 'student');
        /** @var array{flow: string, portal: string}|null $popupFlow */
        $popupFlow = $request->session()->pull('google_auth_popup_flow');

        if (! $this->isConfigured()) {
            return $this->failureRedirect('not_configured', $portal, $popupFlow);
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
                return $this->failureRedirect('email_unverified', $portal, $popupFlow);
            }

            if ($portal === 'admin') {
                return $this->handleAdminCallback(
                    $request,
                    $googleUser,
                    $googleId,
                    $email,
                    $popupFlow,
                );
            }

            return $this->handleStudentCallback(
                $request,
                $googleUser,
                $googleId,
                $email,
                $popupFlow,
            );
        } catch (Throwable $exception) {
            report($exception);

            return $this->failureRedirect('oauth_failed', $portal, $popupFlow);
        }
    }

    private function handleAdminCallback(
        Request $request,
        mixed $googleUser,
        string $googleId,
        string $email,
        ?array $popupFlow,
    ): RedirectResponse {
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

            if (! $user) {
                return ['error' => 'portal_forbidden'];
            }

            $user->loadMissing('roles');

            if (! $user->hasRole(RoleSlug::Admin)) {
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
        });

        if (isset($result['error'])) {
            return $this->failureRedirect($result['error'], 'admin', $popupFlow);
        }

        $user = $result['user'];
        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return $this->authenticationRedirect('/admin', 'admin', $popupFlow);
    }

    private function handleStudentCallback(
        Request $request,
        mixed $googleUser,
        string $googleId,
        string $email,
        ?array $popupFlow,
    ): RedirectResponse {
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

            if (AdministratorInvitation::query()->where('pending_email', $email)->exists()) {
                return ['error' => 'portal_forbidden'];
            }

            $studentRole = Role::query()->firstOrCreate(
                ['slug' => RoleSlug::Student->value],
                ['name' => 'Student Applicant'],
            );

            $displayName = trim((string) $googleUser->getName()) ?: $email;
            $raw = $googleUser->getRaw();
            [$fallbackFirstName, $fallbackLastName] = User::splitDisplayName($displayName);
            $firstName = trim((string) ($raw['given_name'] ?? $fallbackFirstName));
            $lastName = trim((string) ($raw['family_name'] ?? $fallbackLastName));

            $user = User::query()->create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'name' => trim($firstName.' '.$lastName),
                'email' => $email,
                'password' => Str::random(64),
                'account_status' => 'active',
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
            return $this->failureRedirect($result['error'], 'student', $popupFlow);
        }

        $user = $result['user'];
        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return $this->authenticationRedirect('/student', 'student', $popupFlow);
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

    /** @param array{flow: string, portal: string}|null $popupFlow */
    private function failureRedirect(
        string $code,
        string $portal,
        ?array $popupFlow = null,
    ): RedirectResponse {
        if ($popupFlow) {
            return $this->popupCompletionRedirect($popupFlow, 'error', $code);
        }

        $path = $portal === 'admin' ? '/admin/login' : '/student/login';

        return $this->frontendRedirect($path.'?'.http_build_query(['google_error' => $code]));
    }

    private function frontendRedirect(string $path): RedirectResponse
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        return redirect()->away($frontendUrl.$path);
    }

    /** @param array{flow: string, portal: string}|null $popupFlow */
    private function authenticationRedirect(
        string $path,
        string $portal,
        ?array $popupFlow,
    ): RedirectResponse {
        if ($popupFlow) {
            return $this->popupCompletionRedirect($popupFlow, 'success');
        }

        return $this->frontendRedirect($path);
    }

    /** @param array{flow: string, portal: string} $popupFlow */
    private function popupCompletionRedirect(
        array $popupFlow,
        string $status,
        ?string $error = null,
    ): RedirectResponse {
        $query = [
            'flow' => $popupFlow['flow'],
            'portal' => $popupFlow['portal'],
            'status' => $status,
        ];
        if ($error !== null) {
            $query['google_error'] = $error;
        }

        return $this->frontendRedirect(
            '/google-auth/complete?'.http_build_query($query),
        );
    }

    private function normalizedPortal(mixed $portal): string
    {
        return $portal === 'admin' ? 'admin' : 'student';
    }

    /** @return array{flow: string, portal: string}|null */
    private function requestedPopupFlow(Request $request, string $portal): ?array
    {
        if (! $request->boolean('popup')) {
            return null;
        }

        $flow = trim((string) $request->query('flow', ''));
        if (! preg_match('/\A[A-Za-z0-9_-]{12,128}\z/', $flow)) {
            return null;
        }

        return ['flow' => $flow, 'portal' => $portal];
    }
}
