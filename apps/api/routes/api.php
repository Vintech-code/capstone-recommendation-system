<?php

use App\Http\Controllers\Admin\AdminConfigurationController;
use App\Http\Controllers\Admin\AdminEscoOccupationController;
use App\Http\Controllers\Admin\AdministratorAccountController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\AdminProgrammeMediaController;
use App\Http\Controllers\Admin\AdminWorkspaceController;
use App\Http\Controllers\Assessment\AssessmentSessionController;
use App\Http\Controllers\Assessment\EntranceExaminationResultController;
use App\Http\Controllers\Assessment\RiasecQuestionnaireController;
use App\Http\Controllers\Assessment\SharedResultController;
use App\Http\Controllers\Auth\AdministratorInvitationController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordChangeController;
use App\Http\Controllers\Auth\PasswordRecoveryController;
use App\Http\Controllers\Auth\PortalAccessController;
use App\Http\Controllers\Auth\RegisteredStudentController;
use App\Http\Controllers\LocationController;
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
    Route::get('/session', [AuthenticatedSessionController::class, 'session'])
        ->middleware('throttle:120,1');
    Route::post('/admin-invitation/preview', [AdministratorInvitationController::class, 'show'])
        ->middleware('throttle:12,1');
    Route::post('/admin-invitation/accept', [AdministratorInvitationController::class, 'store'])
        ->middleware('throttle:6,1');

    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
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
        Route::get('/session', [AssessmentSessionController::class, 'current']);
        Route::post('/sessions', [AssessmentSessionController::class, 'store']);
        Route::patch('/sessions/{assessmentSession}', [AssessmentSessionController::class, 'update']);
        Route::post('/sessions/{assessmentSession}/submit', [AssessmentSessionController::class, 'submit']);
        Route::post('/sessions/{assessmentSession}/retry-result', [AssessmentSessionController::class, 'retryResult']);
        Route::post('/sessions/{assessmentSession}/share', [AssessmentSessionController::class, 'share']);
        Route::get('/sessions/{assessmentSession}/card', [AssessmentSessionController::class, 'card']);
        Route::get('/history', [AssessmentSessionController::class, 'history']);
    });

Route::get('v1/shared/results/{shareToken}', [SharedResultController::class, 'show'])
    ->middleware('throttle:60,1');

Route::prefix('v1/student/entrance-examination')
    ->middleware(['auth:sanctum', 'active', 'role:student'])
    ->group(function (): void {
        Route::get('/', [EntranceExaminationResultController::class, 'show']);
        Route::post('/', [EntranceExaminationResultController::class, 'store']);
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
        Route::put('/', [StudentProfileController::class, 'store']);
        Route::post('/photo', [StudentProfileController::class, 'storePhoto']);
    });

Route::get('v1/profile-photos/{student}', [StudentProfileController::class, 'showPhoto'])
    ->middleware(['auth:sanctum', 'active']);

Route::prefix('v1/notifications')
    ->middleware(['auth:sanctum', 'active'])
    ->group(function (): void {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/{notification}/read', [NotificationController::class, 'markRead']);
    });

Route::prefix('v1/admin')
    ->middleware(['auth:sanctum', 'active', 'role:admin'])
    ->group(function (): void {
        Route::get('/overview', [AdminWorkspaceController::class, 'overview']);
        Route::get('/students', [AdminWorkspaceController::class, 'students']);
        Route::get('/students/{student}', [AdminWorkspaceController::class, 'student']);
        Route::get('/students/{student}/attempts/{assessmentSession}/card', [AdminWorkspaceController::class, 'studentResultCard']);
        Route::get('/programmes', [AdminWorkspaceController::class, 'programmes']);
        Route::get('/esco/occupations', [AdminEscoOccupationController::class, 'index'])->middleware('throttle:30,1');
        Route::get('/esco/occupation', [AdminEscoOccupationController::class, 'show'])->middleware('throttle:30,1');
        Route::post('/programmes/{programme}/media', [AdminProgrammeMediaController::class, 'store']);
        Route::get('/reports', [AdminWorkspaceController::class, 'reports']);
        Route::get('/activity', [AdminWorkspaceController::class, 'activity']);
        Route::get('/configurations/{kind}', [AdminConfigurationController::class, 'index']);
        Route::post('/configurations/{kind}', [AdminConfigurationController::class, 'store']);
        Route::put('/configurations/versions/{configurationVersion}', [AdminConfigurationController::class, 'update']);
        Route::post('/configurations/versions/{configurationVersion}/preview', [AdminConfigurationController::class, 'preview']);
        Route::post('/configurations/versions/{configurationVersion}/publish', [AdminConfigurationController::class, 'publish']);

        Route::post('/profile/photo', [AdminProfileController::class, 'storePhoto']);
        Route::delete('/profile/photo', [AdminProfileController::class, 'destroyPhoto']);
        Route::get('/profile/photo', [AdminProfileController::class, 'showPhoto']);
        Route::get('/administrators/{administrator}/photo', [AdminProfileController::class, 'showAdministratorPhoto']);

        Route::prefix('administrators')->middleware(['manages_admins', 'throttle:20,1'])->group(function (): void {
            Route::get('/', [AdministratorAccountController::class, 'index']);
            Route::post('/invitations', [AdministratorAccountController::class, 'store']);
            Route::post('/invitations/{administratorInvitation}/resend', [AdministratorAccountController::class, 'resend']);
            Route::delete('/invitations/{administratorInvitation}', [AdministratorAccountController::class, 'revoke']);
            Route::put('/{administrator}/status', [AdministratorAccountController::class, 'status']);
            Route::put('/{administrator}/permission', [AdministratorAccountController::class, 'permission']);
            Route::post('/{administrator}/sessions/revoke', [AdministratorAccountController::class, 'revokeSessions']);
        });
    });

Route::prefix('v1/locations')->middleware(['auth:sanctum', 'active', 'throttle:120,1'])->group(function (): void {
    Route::get('/regions', [LocationController::class, 'regions']);
    Route::get('/regions/{region}/provinces', [LocationController::class, 'provinces']);
    Route::get('/regions/{region}/independent-cities', [LocationController::class, 'independentCities']);
    Route::get('/provinces/{province}/cities-municipalities', [LocationController::class, 'cities']);
    Route::get('/cities-municipalities/{cityMunicipality}/barangays', [LocationController::class, 'barangays']);
});
