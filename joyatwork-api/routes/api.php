<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Imports des contrôleurs
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\CompanyAppointmentController;
use App\Http\Controllers\PractitionerController;
use App\Http\Controllers\PraticienDiplomesController;
use App\Http\Controllers\PraticienCertificationsController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\ChallengePackController;
use App\Http\Controllers\ChallengeCitationController;
use App\Http\Controllers\ChallengeCitationThemeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\UsageController;
use App\Http\Controllers\PayoutController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\KpiCompanyHealthController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\AdminAnalyticsController;
use App\Http\Controllers\AdminComplianceController;
use App\Http\Controllers\Admin\ConsentController;
use App\Http\Controllers\Admin\RgpdAuditController;
use App\Http\Controllers\LibraryContentController;
use App\Http\Controllers\QuestionnaireTemplateController;

// AUTH
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// USERS
Route::get('/users', [UserController::class, 'index']);
Route::post('/users/admin', [UserController::class, 'storeAdmin']);
Route::patch('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// ENTREPRISES / CHALLENGES / CONTENU
Route::apiResource('companies', CompanyController::class);
Route::apiResource('challenges', ChallengeController::class);
Route::apiResource('contents', LibraryContentController::class);

// DIAGNOSTICS (Correction ici : Ajout de withoutMiddleware pour éviter l'écran blanc)
Route::prefix('diagnostics')->group(function () {
    Route::get('/global-stats', [DiagnosticController::class, 'get_global_stats'])->withoutMiddleware(['auth:sanctum']);
    Route::get('/user-health', [DiagnosticController::class, 'get_users_health_per_month'])->withoutMiddleware(['auth:sanctum']);
    Route::get('/company-health', [DiagnosticController::class, 'get_company_health_per_month'])->withoutMiddleware(['auth:sanctum']);
});
Route::apiResource('diagnostics', DiagnosticController::class)->only(['index', 'store'])->withoutMiddleware(['auth:sanctum']);

// ADMIN ANALYTICS
Route::prefix('admin')->group(function () {
    Route::get('/usage-by-company', [AdminAnalyticsController::class, 'usageByCompany'])->withoutMiddleware(['auth:sanctum']);
    Route::get('/churn-risk', [AdminAnalyticsController::class, 'churnRisk'])->withoutMiddleware(['auth:sanctum']);
    Route::get('/compliance', [AdminComplianceController::class, 'index']);
    Route::get('/rgpd-audit', [RgpdAuditController::class, 'index']);
});