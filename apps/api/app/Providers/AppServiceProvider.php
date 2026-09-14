<?php

namespace App\Providers;

use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Password::defaults(static fn (): Password => Password::min(12)
            ->max(255)
            ->letters()
            ->mixedCase()
            ->numbers()
            ->symbols());

        ResetPassword::createUrlUsing(static function (object $notifiable, string $token): string {
            $base = rtrim((string) config('app.frontend_url', config('app.url')), '/');
            $portal = $notifiable instanceof User
                && $notifiable->loadMissing('roles')->hasRole(RoleSlug::Admin)
                    ? 'admin'
                    : 'student';
            $query = http_build_query([
                'email' => (string) $notifiable->getEmailForPasswordReset(),
                'portal' => $portal,
            ], '', '&', PHP_QUERY_RFC3986);

            return $base.'/reset-password/'.$token.'?'.$query;
        });

        RateLimiter::for('login', function (Request $request): Limit {
            $email = strtolower((string) $request->input('email'));

            return Limit::perMinute(5)->by($email.'|'.$request->ip());
        });
    }
}
