<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Routes pour les praticiens
Route::get('/practitioners', function () {
    return response()->json([
        'message' => 'Practitioners API endpoint'
    ]);
});

// Routes pour les entreprises
Route::apiResource('companies', CompanyController::class);
Route::get('/companies-stats', [CompanyController::class, 'stats']);

// Routes pour les factures, paiements et crédits
Route::apiResource('invoices', InvoiceController::class);
Route::apiResource('billings', BillingController::class);
Route::apiResource('wallets', WalletController::class);
Route::apiResource('credits', CreditController::class);

// Routes d'authentification
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Route de test
Route::get('/test', function () {
    return response()->json([
        'message' => 'JoyAtWork API is running!',
        'timestamp' => now(),
        'endpoints' => [
            'companies' => '/api/companies',
            'companies-stats' => '/api/companies-stats',
            'practitioners' => '/api/practitioners',
            'invoices' => '/api/invoices',
            'billings' => '/api/billings',
            'wallets' => '/api/wallets',
            'credits' => '/api/credits',
            'auth-login' => '/api/login',
            'auth-register' => '/api/register',
        ]
    ]);
});