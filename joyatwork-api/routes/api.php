<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// Controllers
use App\Http\Controllers\{
    AuthController,
    UserController,
    CompanyController,
    ContractController,
    AppointmentController,
    CompanyAppointmentController,
    PractitionerController,
    PraticienDiplomesController,
    PraticienCertificationsController,
    ChallengeController,
    ChallengePackController,
    ChallengeCitationController,
    ChallengeCitationThemeController,
    OrderController,
    UsageController,
    PayoutController,
    InvoiceController,
    BillingController,
    WalletController,
    CreditController,
    KpiCompanyHealthController,
    DiagnosticController,
    AdminAnalyticsController,
    AdminComplianceController,
    ConsentController,
    RgpdAuditController,
    LibraryContentController,
    QuestionnaireTemplateController
};

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/
Route::get('/users', [UserController::class, 'index']);
Route::post('/users/admin', [UserController::class, 'storeAdmin']);
Route::patch('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

/*
|--------------------------------------------------------------------------
| DIAGNOSTICS (FIX IMPORTANT)
|--------------------------------------------------------------------------
*/
Route::get('/diagnostics/global-stats', [DiagnosticController::class, 'get_global_stats']);
Route::get('/diagnostics/user-health', [DiagnosticController::class, 'get_users_health_per_month']);
Route::get('/diagnostics/company-health', [DiagnosticController::class, 'get_company_health_per_month']);

Route::delete('/diagnostics/user-health', [DiagnosticController::class, 'delete_user_health_entry']);
Route::delete('/diagnostics/company-health', [DiagnosticController::class, 'delete_company_health_entry']);

Route::apiResource('diagnostics', DiagnosticController::class)->only(['index', 'store']);

/*
|--------------------------------------------------------------------------
| ADMIN (SECURISÉ = IMPORTANT)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {

    Route::get('/usage-by-company', [AdminAnalyticsController::class, 'usageByCompany']);
    Route::get('/churn-risk', [AdminAnalyticsController::class, 'churnRisk']);

    Route::get('/compliance', [AdminComplianceController::class, 'index']);
    Route::post('/compliance', [AdminComplianceController::class, 'store']);

    Route::get('/rgpd-audit', [RgpdAuditController::class, 'index']);

    Route::get('/consents', [ConsentController::class, 'index']);
    Route::post('/consents', [ConsentController::class, 'store']);
    Route::patch('/consents/{id}/revoke', [ConsentController::class, 'revoke']);

    Route::delete('/users/{id}/anonymize', [ConsentController::class, 'anonymize']);
});

/*
|--------------------------------------------------------------------------
| CHALLENGES
|--------------------------------------------------------------------------
*/
Route::get('/challenges/trashed', [ChallengeController::class, 'trashed']);
Route::post('/challenges/{id}/restore', [ChallengeController::class, 'restore']);
Route::get('/challenges/{id}/participants', [ChallengeController::class, 'participantsParDefi']);
Route::apiResource('challenges', ChallengeController::class);

Route::apiResource('challenge-packs', ChallengePackController::class);
Route::apiResource('challenge-citations', ChallengeCitationController::class);
Route::apiResource('challenge-citation-themes', ChallengeCitationThemeController::class);

/*
|--------------------------------------------------------------------------
| CONTENT
|--------------------------------------------------------------------------
*/
Route::apiResource('contents', LibraryContentController::class);

/*
|--------------------------------------------------------------------------
| QUESTIONNAIRE
|--------------------------------------------------------------------------
*/
Route::get('/questionnaire-templates/{id}/duplicate', [QuestionnaireTemplateController::class, 'duplicate']);
Route::apiResource('questionnaire-templates', QuestionnaireTemplateController::class);