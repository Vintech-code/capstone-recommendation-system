<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PortalAccessController;
use App\Models\RoleSlug;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/auth')->group(function (): void {
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/me', [AuthenticatedSessionController::class, 'show']);
        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

        foreach (RoleSlug::cases() as $role) {
            Route::get("/authorize/{$role->value}", PortalAccessController::class)
                ->defaults('portal', $role->value)
                ->middleware("role:{$role->value}");
        }
    });
});
