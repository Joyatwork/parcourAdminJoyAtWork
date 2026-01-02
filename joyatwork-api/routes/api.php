<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\UsageController;
use App\Http\Controllers\PayoutController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\CreditController;

use App\Http\Controllers\PractitionerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Routes pour les entreprises (JoyAtWork)
Route::apiResource('companies', CompanyController::class);
Route::get('/companies-stats', [CompanyController::class, 'stats']);

// Routes pour les contrats
Route::apiResource('contracts', ContractController::class);
Route::get('/contracts-stats', [ContractController::class, 'stats']);

// Wallet / Orders / Usages / Payouts / Invoices (facturation simplifiée)
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
// Routes pour les praticiens
Route::apiResource('practitioners', PractitionerController::class);
Route::post('practitioners/{practitioner}/suspendre', [PractitionerController::class, 'suspend']);
Route::post('practitioners/{practitioner}/reactivate', [PractitionerController::class, 'reactivate']);
Route::post('practitioners/{practitioner}/verify', [PractitionerController::class, 'verify']);
// Routes pour les certificats des praticiens
Route::post('practitioners/{practitioner}/verify-certif-iprp', [PractitionerController::class, 'verifyCertifIprp']);
Route::post('practitioners/{practitioner}/verify-master-psy', [PractitionerController::class, 'verifyMasterPsyTravail']);

// Routes pour les rendez-vous
Route::apiResource('appointments', AppointmentController::class);
Route::post('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);
Route::get(
    'practitioners/{practitioner}/appointments',
    [AppointmentController::class, 'getAppointmentsByPractitioner']
);
