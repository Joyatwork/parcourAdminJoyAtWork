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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==========================================
// AUTH & USER
// ==========================================
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Gestion des utilisateurs
Route::get('/users', [UserController::class, 'index']);
Route::post('/users/admin', [UserController::class, 'storeAdmin']);
Route::patch('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// ==========================================
// ENTREPRISES & CONTRATS
// ==========================================
Route::get('/companies-stats', [CompanyController::class, 'stats']);
Route::apiResource('companies', CompanyController::class);

Route::get('/contracts-stats', [ContractController::class, 'stats']);
Route::apiResource('contracts', ContractController::class);

// ==========================================
// FACTURATION / WALLET / USAGES
// ==========================================
Route::get('/wallets/find-by-entreprise', [WalletController::class, 'findByEntreprise']);
Route::get('/wallets/{wallet}', [WalletController::class, 'show']);
Route::get('/wallets/{wallet}/transactions', [WalletController::class, 'transactions']);
Route::get('/wallets/{wallet}/stats', [WalletController::class, 'stats']);

Route::apiResource('orders', OrderController::class)->only(['index', 'store', 'show']);
Route::apiResource('usages', UsageController::class)->only(['index', 'store']);

Route::post('/payouts/generate', [PayoutController::class, 'generate']);
Route::put('/payouts/{payout}/mark-paid', [PayoutController::class, 'markPaid']);
Route::apiResource('payouts', PayoutController::class)->only(['index', 'show']);

Route::post('/invoices/recharge', [InvoiceController::class, 'storeRecharge']);
Route::put('/invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid']);
Route::apiResource('invoices', InvoiceController::class)->only(['index', 'show']);

Route::post('/billing/generate-monthly', [BillingController::class, 'generateMonthly']);
Route::apiResource('credits', CreditController::class)->only(['index', 'show']);

// ==========================================
// PRATICIENS
// ==========================================
Route::post('practitioners/{practitioner}/suspendre', [PractitionerController::class, 'suspend']);
Route::post('practitioners/{practitioner}/reactivate', [PractitionerController::class, 'reactivate']);
Route::post('practitioners/{practitioner}/verify', [PractitionerController::class, 'verify']);
Route::get('practitioners/{practitioner}/appointments', [AppointmentController::class, 'getAppointmentsByPractitioner']);
Route::apiResource('practitioners', PractitionerController::class);

// Diplômes et Certifications
Route::get('praticien-diplomes/{praticienId}', [PraticienDiplomesController::class, 'getDiplomesByPraticien']);
Route::post('praticien-diplomes/{id}/verifier', [PraticienDiplomesController::class, 'verifier_diplome']);
Route::post('praticien-diplomes/{id}/deverifier', [PraticienDiplomesController::class, 'deverifier_diplome']);
Route::delete('/praticien-diplomes/{id}', [PraticienDiplomesController::class, 'destroy']);

Route::get('praticien-certifications/{praticienId}', [PraticienCertificationsController::class, 'getCertificationsByPraticien']);
Route::post('praticien-certifications/{id}/verifier', [PraticienCertificationsController::class, 'verifier_certification']);
Route::post('praticien-certifications/{id}/deverifier', [PraticienCertificationsController::class, 'deverifier_certfification']);
Route::delete('/praticien-certifications/{id}', [PraticienCertificationsController::class, 'destroy']);

// ==========================================
// RENDEZ-VOUS
// ==========================================
Route::post('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);
Route::apiResource('appointments', AppointmentController::class);

Route::apiResource('company-appointments', CompanyAppointmentController::class);

// ==========================================
// CHALLENGES
// ==========================================
// Les routes spécifiques (trashed, restore) DOIVENT être avant l'apiResource
Route::get('/challenges/trashed', [ChallengeController::class, 'trashed']);
Route::post('/challenges/{id}/restore', [ChallengeController::class, 'restore']);
Route::get('/challenges/{id}/participants', [ChallengeController::class, 'participantsParDefi']);
Route::apiResource('challenges', ChallengeController::class);

Route::apiResource('challenge-packs', ChallengePackController::class);
Route::apiResource('challenge-citations', ChallengeCitationController::class);
Route::apiResource('challenge-citation-themes', ChallengeCitationThemeController::class);

// ==========================================
// CONTENU & DIAGNOSTICS
// ==========================================
Route::apiResource('contents', LibraryContentController::class);

Route::get('/kpi-company-health/global-health', [KpiCompanyHealthController::class, 'get_global_health']);

Route::get('/diagnostics/global-stats', [DiagnosticController::class, 'get_global_stats']);
Route::get('/diagnostics/user-health', [DiagnosticController::class, 'get_users_health_per_month']);
Route::get('/diagnostics/company-health', [DiagnosticController::class, 'get_company_health_per_month']);
Route::delete('/diagnostics/user-health', [DiagnosticController::class, 'delete_user_health_entry']);
Route::delete('/diagnostics/company-health', [DiagnosticController::class, 'delete_company_health_entry']);
Route::apiResource('diagnostics', DiagnosticController::class)->only(['index', 'store']);

Route::get('/questionnaire-templates/{id}/duplicate', [QuestionnaireTemplateController::class, 'duplicate']);
Route::apiResource('questionnaire-templates', QuestionnaireTemplateController::class);

// ==========================================
// ADMINISTRATION (Analytics, Compliance, RGPD)
// ==========================================
Route::prefix('admin')->group(function () {
    // Analytics
    Route::get('/usage-by-company', [AdminAnalyticsController::class, 'usageByCompany'])->withoutMiddleware(['auth:sanctum']);
    Route::get('/churn-risk', [AdminAnalyticsController::class, 'churnRisk'])->withoutMiddleware(['auth:sanctum']);

    // RGPD & Consents
    Route::get('/consents', [ConsentController::class, 'index']);
    Route::post('/consents', [ConsentController::class, 'store']);
    Route::patch('/consents/{id}/revoke', [ConsentController::class, 'revoke']);
    Route::get('/users/{id}/export', [ConsentController::class, 'exportUserData']);
    Route::delete('/users/{id}/anonymize', [ConsentController::class, 'anonymize']); // Changé pour éviter conflit avec delete users global

    // Compliance
    Route::get('/compliance', [AdminComplianceController::class, 'index']);
    Route::post('/compliance', [AdminComplianceController::class, 'store']);

    // Audit
    Route::get('/rgpd-audit', [RgpdAuditController::class, 'index']);
});