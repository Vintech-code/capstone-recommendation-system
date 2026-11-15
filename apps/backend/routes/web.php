<?php

use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\GoogleAuthenticationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'service' => 'TCC Course Recommendation API',
        'health' => url('/up'),
    ]);
});

Route::middleware('throttle:10,1')->group(function (): void {
    Route::get('/auth/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('signed')
        ->name('verification.verify');
    Route::get('/auth/google/redirect', [GoogleAuthenticationController::class, 'redirect'])
        ->name('google.redirect');
    Route::get('/auth/google/callback', [GoogleAuthenticationController::class, 'callback'])
        ->name('google.callback');
});
