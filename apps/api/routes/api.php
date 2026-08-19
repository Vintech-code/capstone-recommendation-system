<?php

use App\Http\Controllers\Admin\AdminConfigurationController;
use App\Http\Controllers\Admin\AdminCounselorAccountController;
use App\Http\Controllers\Admin\AdminGuidanceController;
use App\Http\Controllers\Admin\AdminGuidanceRequestController;
use App\Http\Controllers\Admin\AdminProgrammeMediaController;
use App\Http\Controllers\Admin\AdminProgrammeSourceController;
use App\Http\Controllers\Admin\AdminWorkspaceController;
use App\Http\Controllers\Assessment\AssessmentSessionController;
use App\Http\Controllers\Assessment\RiasecQuestionnaireController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordChangeController;
use App\Http\Controllers\Auth\PasswordRecoveryController;
use App\Http\Controllers\Auth\PortalAccessController;
use App\Http\Controllers\Auth\RegisteredStudentController;
use App\Http\Controllers\Guidance\StudentGuidanceRequestController;
use App\Http\Controllers\Guidance\StudentGuidanceSummaryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Recommendation\StudentProgrammeController;
use App\Http\Controllers\Recommendation\StudentRecommendationController;
use App\Http\Controllers\Recommendation\StudentSavedProgrammeController;
use App\Http\Controllers\Student\StudentProfileController;
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
        Route::put('/password', PasswordChangeController::class);

        foreach (RoleSlug::cases() as $role) {
            Route::get("/authorize/{$role->value}", PortalAccessController::class)
                ->defaults('portal', $role->value)
                ->middleware("role:{$role->value}");
        }
    });
});

Route::prefix('v1/student/assessments/riasec')
    ->middleware(['auth:sanctum', 'active', 'role:student'])
    ->group(function (): void {
        Route::get('/questions', [RiasecQuestionnaireController::class, 'questions']);
        Route::post('/results', [RiasecQuestionnaireController::class, 'results']);
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

Route::prefix('v1/student/guidance-requests')
    ->middleware(['auth:sanctum', 'active', 'role:student'])
    ->group(function (): void {
        Route::get('/', [StudentGuidanceRequestController::class, 'index']);
        Route::post('/', [StudentGuidanceRequestController::class, 'store']);
        Route::post('/{guidanceRequest}/cancel', [StudentGuidanceRequestController::class, 'cancel']);
    });

Route::prefix('v1/student/saved-programmes')
    ->middleware(['auth:sanctum', 'active', 'role:student'])
    ->group(function (): void {
        Route::get('/', [StudentSavedProgrammeController::class, 'index']);
        Route::put('/{programme}', [StudentSavedProgrammeController::class, 'store']);
        Route::delete('/{programme}', [StudentSavedProgrammeController::class, 'destroy']);
    });

Route::prefix('v1/student/profile')
    ->middleware(['auth:sanctum', 'active', 'role:student'])
    ->group(function (): void {
        Route::get('/', [StudentProfileController::class, 'show']);
        Route::match(['post', 'put'], '/', [StudentProfileController::class, 'store']);
        Route::post('/photo', [StudentProfileController::class, 'storePhoto']);
        Route::get('/riasec-result', [StudentProfileController::class, 'riasec']);
    });

Route::get('v1/profile-photos/{student}', [StudentProfileController::class, 'showPhoto'])
    ->middleware(['auth:sanctum', 'active']);

Route::prefix('v1/notifications')
    ->middleware(['auth:sanctum', 'active'])
    ->group(function (): void {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/{notification}/read', [NotificationController::class, 'markRead']);
    });

Route::get('v1/student/guidance-summaries', [StudentGuidanceSummaryController::class, 'index'])
    ->middleware(['auth:sanctum', 'active', 'role:student']);

Route::prefix('v1/admin')
    ->middleware(['auth:sanctum', 'active', 'role:admin'])
    ->group(function (): void {
        Route::get('/overview', [AdminWorkspaceController::class, 'overview']);
        Route::get('/students', [AdminWorkspaceController::class, 'students']);
        Route::get('/students/{student}', [AdminWorkspaceController::class, 'student']);
        Route::get('/assessments', [AdminWorkspaceController::class, 'assessments']);
        Route::get('/counselors', [AdminWorkspaceController::class, 'counselors']);
        Route::post('/counselors', [AdminCounselorAccountController::class, 'store']);
        Route::put('/counselors/{counselor}', [AdminCounselorAccountController::class, 'update']);
        Route::post('/counselors/{counselor}/reset-password', [AdminCounselorAccountController::class, 'resetPassword']);
        Route::get('/guidance-requests', [AdminGuidanceRequestController::class, 'index']);
        Route::get('/programmes', [AdminWorkspaceController::class, 'programmes']);
        Route::post('/programmes/{programme}/media', [AdminProgrammeMediaController::class, 'store']);
        Route::get('/reports', [AdminWorkspaceController::class, 'reports']);
        Route::get('/reports/export', [AdminWorkspaceController::class, 'exportReports']);
        Route::get('/activity', [AdminWorkspaceController::class, 'activity']);
        Route::get('/configurations/{kind}', [AdminConfigurationController::class, 'index']);
        Route::post('/configurations/{kind}', [AdminConfigurationController::class, 'store']);
        Route::put('/configurations/versions/{configurationVersion}', [AdminConfigurationController::class, 'update']);
        Route::post('/configurations/versions/{configurationVersion}/preview', [AdminConfigurationController::class, 'preview']);
        Route::post('/configurations/versions/{configurationVersion}/publish', [AdminConfigurationController::class, 'publish']);
        Route::post('/configurations/versions/{configurationVersion}/rollback', [AdminConfigurationController::class, 'rollback']);
        Route::get('/programme-sources', [AdminProgrammeSourceController::class, 'index']);
        Route::put('/programme-sources/{sourceReference}', [AdminProgrammeSourceController::class, 'update']);
    });

Route::prefix('v1/counselor')
    ->middleware(['auth:sanctum', 'active', 'role:counselor'])
    ->group(function (): void {
        Route::get('/overview', [AdminWorkspaceController::class, 'overview']);
        Route::get('/students', [AdminWorkspaceController::class, 'students']);
        Route::get('/students/{student}', [AdminWorkspaceController::class, 'student']);
        Route::put('/students/{student}/guidance-case', [AdminGuidanceController::class, 'updateCase']);
        Route::post('/students/{student}/guidance-notes', [AdminGuidanceController::class, 'storeNote']);
        Route::post('/students/{student}/guidance-summaries', [AdminGuidanceController::class, 'storeSummary']);
        Route::put('/students/{student}/guidance-summaries/{guidanceSummary}', [AdminGuidanceController::class, 'updateSummary']);
        Route::post('/students/{student}/guidance-summaries/{guidanceSummary}/publish', [AdminGuidanceController::class, 'publishSummary']);
        Route::get('/counselors', [AdminWorkspaceController::class, 'counselors']);
        Route::get('/guidance-requests', [AdminGuidanceRequestController::class, 'index']);
        Route::post('/guidance-requests/{guidanceRequest}/accept', [AdminGuidanceRequestController::class, 'accept']);
        Route::post('/guidance-requests/{guidanceRequest}/decline', [AdminGuidanceRequestController::class, 'decline']);
        Route::post('/guidance-requests/{guidanceRequest}/resolve', [AdminGuidanceRequestController::class, 'resolve']);
        Route::get('/reports', [AdminWorkspaceController::class, 'reports']);
        Route::get('/reports/export', [AdminWorkspaceController::class, 'exportReports']);
    });
