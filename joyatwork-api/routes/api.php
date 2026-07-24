<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\CompanyAppointmentController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\UsageController;
use App\Http\Controllers\PayoutController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PractitionerController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\ChallengePackController;
use App\Http\Controllers\ChallengeCitationController;
use App\Http\Controllers\ChallengeCitationThemeController;
use App\Http\Controllers\PraticienDiplomesController;
use App\Http\Controllers\PraticienCertificationsController;
use App\Http\Controllers\UserChallengeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\KpiCompanyHealthController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\AdminAnalyticsController;
use App\Http\Controllers\AdminComplianceController;
use App\Http\Controllers\Admin\ConsentController;
use App\Http\Controllers\Admin\RgpdAuditController;
use App\Http\Controllers\Admin\LegalDocumentController; // ⭐ AJOUT ICI
use App\Http\Controllers\LibraryContentController;
use App\Http\Controllers\QuestionnaireTemplateController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// ==========================================
// AUTH
// ==========================================
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);
// Alias admin login (compatibilité UI qui appelle /api/admin/login)
Route::post('/admin/login', [AuthController::class, 'login']);
Route::get('/users', [UserController::class, 'index']);
Route::post('/users/admin', [UserController::class, 'storeAdmin']);
Route::patch('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// ==========================================
// ENTREPRISES
// ==========================================
Route::apiResource('companies', CompanyController::class);
Route::get('/companies-stats', [CompanyController::class, 'stats']);

// ==========================================
// CONTRATS
// ==========================================
Route::apiResource('contracts', ContractController::class);
Route::get('/contracts-stats', [ContractController::class, 'stats']);

// ==========================================
// FACTURATION / WALLET / USAGES
// ==========================================
Route::get('/wallets/find-by-entreprise', [WalletController::class, 'findByEntreprise']);
Route::get('/wallets/{wallet}', [WalletController::class, 'show']);
Route::get('/wallets/{wallet}/transactions', [WalletController::class, 'transactions']);
Route::get('/wallets/{wallet}/stats', [WalletController::class, 'stats']);

Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{order}', [OrderController::class, 'show']);

Route::get('/usages', [UsageController::class, 'index']);
Route::post('/usages', [UsageController::class, 'store']);

Route::get('/payouts', [PayoutController::class, 'index']);
Route::get('/payouts/{payout}', [PayoutController::class, 'show']);
Route::post('/payouts/generate', [PayoutController::class, 'generate']);
Route::put('/payouts/{payout}/mark-paid', [PayoutController::class, 'markPaid']);

Route::get('/invoices', [InvoiceController::class, 'index']);
Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
Route::post('/invoices/recharge', [InvoiceController::class, 'storeRecharge']);
Route::put('/invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid']);

Route::post('/billing/generate-monthly', [BillingController::class, 'generateMonthly']);

Route::get('/credits', [CreditController::class, 'index']);
Route::get('/credits/{credit}', [CreditController::class, 'show']);

// ==========================================
// PRATICIENS
// ==========================================
Route::apiResource('practitioners', PractitionerController::class);
Route::post('practitioners/{practitioner}/suspendre', [PractitionerController::class, 'suspend']);
Route::post('practitioners/{practitioner}/reactivate', [PractitionerController::class, 'reactivate']);
Route::post('practitioners/{practitioner}/verify', [PractitionerController::class, 'verify']);

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
Route::apiResource('appointments', AppointmentController::class);
Route::post('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);
Route::get('practitioners/{practitioner}/appointments', [AppointmentController::class, 'getAppointmentsByPractitioner']);

Route::get('company-appointments', [CompanyAppointmentController::class, 'index']);
Route::post('company-appointments', [CompanyAppointmentController::class, 'store']);
Route::put('company-appointments/{appointment}', [CompanyAppointmentController::class, 'update']);
Route::delete('company-appointments/{appointment}', [CompanyAppointmentController::class, 'destroy']);

// ==========================================
// CHALLENGES
// ==========================================
Route::get('/challenges/trashed', [ChallengeController::class, 'trashed']);
Route::post('/challenges/{id}/restore', [ChallengeController::class, 'restore']);
Route::apiResource('challenges', ChallengeController::class);
Route::get('/challenges/{id}/participants', [ChallengeController::class, 'participantsParDefi']);

Route::apiResource('challenge-packs', ChallengePackController::class);
Route::apiResource('challenge-citations', ChallengeCitationController::class);
Route::apiResource('challenge-citation-themes', ChallengeCitationThemeController::class);

// Simple endpoints for frontend expectations (challenge categories / types / intensities)
Route::get('/challenge-categories', function () {
    return DB::table('challenge_category')->get();
});

Route::get('/challenge-types', function () {
    return DB::table('challenge_type')->get();
});

Route::get('/challenge-intensities', function () {
    return DB::table('challenge_intensity')->get();
});

// ==========================================
// CONTENT LIBRARY
// ==========================================
Route::apiResource('contents', LibraryContentController::class);

// ==========================================
// KPI & DIAGNOSTICS
// ==========================================
Route::get('/kpi-company-health/global-health', [KpiCompanyHealthController::class, 'get_global_health']);

Route::get('/diagnostics/user-health', [DiagnosticController::class, 'get_users_health_per_month']);
Route::get('/diagnostics/company-health', [DiagnosticController::class, 'get_company_health_per_month']);
Route::delete('/diagnostics/user-health', [DiagnosticController::class, 'delete_user_health_entry']);
Route::delete('/diagnostics/company-health', [DiagnosticController::class, 'delete_company_health_entry']);
Route::post('/diagnostics', [DiagnosticController::class, 'store']);
Route::get('/diagnostics', function() {
    return \App\Models\Diagnostic::latest()->get();
});
Route::get('/diagnostics/global-stats', [DiagnosticController::class, 'get_global_stats']);

// ==========================================
// QUESTIONNAIRE TEMPLATES
// ==========================================
Route::get('/questionnaire-templates', [QuestionnaireTemplateController::class, 'index']);
Route::post('/questionnaire-templates', [QuestionnaireTemplateController::class, 'store']);
Route::put('/questionnaire-templates/{id}', [QuestionnaireTemplateController::class, 'update']);
Route::delete('/questionnaire-templates/{id}', [QuestionnaireTemplateController::class, 'destroy']);
Route::post('/questionnaire-templates/{id}/duplicate', [QuestionnaireTemplateController::class, 'duplicate']);

// ==========================================
// ADMIN ANALYTICS — ADOPTION & CHURN
// ==========================================
Route::prefix('admin')->group(function () {
    Route::get('/usage-by-company', [AdminAnalyticsController::class, 'usageByCompany'])
        ->withoutMiddleware(['auth:sanctum']);
    Route::get('/churn-risk', [AdminAnalyticsController::class, 'churnRisk'])
        ->withoutMiddleware(['auth:sanctum']);
});

// ==========================================
// ADMIN — RGPD
// ==========================================
Route::prefix('admin')->group(function () {

    Route::get('/consents', [ConsentController::class, 'index']);
    Route::post('/consents', [ConsentController::class, 'store']);
    Route::patch('/consents/{id}/revoke', [ConsentController::class, 'revoke']);
    Route::delete('/users/{id}', [ConsentController::class, 'anonymize'])->whereNumber('id');
    Route::get('/users/{id}/export', [ConsentController::class, 'exportUserData'])->whereNumber('id');
    Route::post('/rgpd/upload-docs', [\App\Http\Controllers\Admin\RgpdDocsController::class, 'uploadDocs']);
    Route::get('/rgpd/export-pdf', [\App\Http\Controllers\Admin\RgpdDocsController::class, 'exportPdf']);
    // Alias for frontend: allow creating admin users under /api/admin/users/admin
    Route::post('/users/admin', [\App\Http\Controllers\UserController::class, 'storeAdmin']);
});

// ==========================================
// ADMIN — COMPLIANCE
// ==========================================
Route::prefix('admin')->group(function () {
    Route::get('/compliance', [AdminComplianceController::class, 'index']);
    Route::post('/compliance', [AdminComplianceController::class, 'store']);
});

// ==========================================
// ADMIN — RGPD AUDIT
// ==========================================
Route::prefix('admin')->group(function () {
    Route::get('/rgpd-audit', [RgpdAuditController::class, 'index']);
});

// ==========================================
// ⭐ ADMIN — LEGAL DOCUMENTS (AJOUT COMPLET)
// ==========================================
Route::prefix('admin')->group(function () {
    Route::get('/legal-documents', [LegalDocumentController::class, 'index']);
    Route::post('/legal-documents/upload', [LegalDocumentController::class, 'upload']);
    Route::delete('/legal-documents/{id}', [LegalDocumentController::class, 'destroy']);
    Route::post('/legal-documents/{id}/update', [LegalDocumentController::class, 'update']);
});

// Temporary debug route: returns challenge packs or error details
Route::get('/debug/challenge-packs', function () {
    try {
        return \App\Models\ChallengePack::withCount('challenges')->get();
    } catch (\Throwable $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Compatibility aliases: some frontend requests hit non-admin paths -> map them to admin controllers
Route::get('/compliance', [AdminComplianceController::class, 'index']);
Route::post('/compliance', [AdminComplianceController::class, 'store']);

Route::get('/rgpd-audit', [\App\Http\Controllers\Admin\RgpdAuditController::class, 'index']);

Route::get('/legal-documents', [\App\Http\Controllers\Admin\LegalDocumentController::class, 'index']);
Route::post('/legal-documents/upload', [\App\Http\Controllers\Admin\LegalDocumentController::class, 'upload']);
Route::delete('/legal-documents/{id}', [\App\Http\Controllers\Admin\LegalDocumentController::class, 'destroy']);
Route::post('/legal-documents/{id}/update', [\App\Http\Controllers\Admin\LegalDocumentController::class, 'update']);

// Serve files from storage/public when frontend requests /api/storage/...
use Illuminate\Support\Facades\Storage;
Route::get('/storage/{path}', function ($path) {
    // $path example: "legal-documents/filename.pdf"
    if (Storage::disk('public')->exists($path)) {
        return Storage::disk('public')->response($path);
    }
    abort(404);
})->where('path', '.*');

