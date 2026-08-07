<?php

use App\Http\Controllers\Assessment\AssessmentSessionController;
use App\Http\Controllers\Assessment\OnetInterestProfilerController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordRecoveryController;
use App\Http\Controllers\Auth\PortalAccessController;
use App\Http\Controllers\Auth\RegisteredStudentController;
use App\Http\Controllers\Recommendation\StudentProgrammeController;
use App\Http\Controllers\Recommendation\StudentRecommendationController;
use App\Models\RoleSlug;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/auth')->group(function (): void {
    Route::post('/register', [RegisteredStudentController::class, 'store'])
        ->middleware('throttle:6,1');

    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login');
    Route::post('/forgot-password', [PasswordRecoveryController::class, 'requestLink'])
        ->middleware('throttle:6,1');
    Route::post('/reset-password', [PasswordRecoveryController::class, 'reset'])
        ->middleware('throttle:6,1');

    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
        Route::get('/me', [AuthenticatedSessionController::class, 'show']);
        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

        foreach (RoleSlug::cases() as $role) {
            Route::get("/authorize/{$role->value}", PortalAccessController::class)
                ->defaults('portal', $role->value)
                ->middleware("role:{$role->value}");
        }
    });
});

Route::prefix('v1/student/assessments/onet-mini-ip')
    ->middleware(['auth:sanctum', 'active', 'role:student'])
    ->group(function (): void {
        Route::get('/questions', [OnetInterestProfilerController::class, 'questions']);
        Route::post('/results', [OnetInterestProfilerController::class, 'results']);
        Route::get('/session', [AssessmentSessionController::class, 'current']);
        Route::post('/sessions', [AssessmentSessionController::class, 'store']);
        Route::patch('/sessions/{assessmentSession}', [AssessmentSessionController::class, 'update']);
        Route::post('/sessions/{assessmentSession}/submit', [AssessmentSessionController::class, 'submit']);
        Route::post('/sessions/{assessmentSession}/retry-result', [AssessmentSessionController::class, 'retryResult']);
        Route::get('/history', [AssessmentSessionController::class, 'history']);
    });

Route::prefix('v1/student/recommendations')
    ->middleware(['auth:sanctum', 'active', 'role:student'])
    ->group(function (): void {
        Route::get('/latest', [StudentRecommendationController::class, 'latest']);
        Route::get('/attempts/{assessmentSession}', [StudentRecommendationController::class, 'show']);
    });

Route::prefix('v1/student/programmes')
    ->middleware(['auth:sanctum', 'active', 'role:student'])
    ->group(function (): void {
        Route::get('/', [StudentProgrammeController::class, 'index']);
        Route::get('/{programme}', [StudentProgrammeController::class, 'show']);
    });
