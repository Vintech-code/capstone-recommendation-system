<?php

use App\Exceptions\OnetServiceException;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\EnsureUserHasRole;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'active' => EnsureAccountIsActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (OnetServiceException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $response = response()->json([
                'message' => $exception->getMessage(),
                'error' => [
                    'code' => $exception->errorCode(),
                    'message' => $exception->getMessage(),
                ],
            ], $exception->status());

            if ($exception->retryAfterSeconds() !== null) {
                $response->headers->set('Retry-After', (string) $exception->retryAfterSeconds());
            }

            return $response;
        });

        $exceptions->render(function (
            AuthenticationException $exception,
            Request $request,
        ) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'message' => 'Unauthenticated.',
                'error' => [
                    'code' => 'AUTHENTICATION_REQUIRED',
                    'message' => 'Your session is missing or has expired.',
                ],
            ], 401);
        });
    })->create();
