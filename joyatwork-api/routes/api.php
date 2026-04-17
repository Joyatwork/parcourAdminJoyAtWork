<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\AdminAnalyticsController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\LibraryContentController;

// --- AUTH & USER ---
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/users', [UserController::class, 'index']);
Route::post('/users/admin', [UserController::class, 'storeAdmin']);

// --- ENTREPRISES & CHALLENGES ---
Route::apiResource('companies', CompanyController::class);
Route::apiResource('challenges', ChallengeController::class);
Route::apiResource('contents', LibraryContentController::class);

// --- DIAGNOSTICS (Correction pour éviter l'écran blanc) ---
Route::prefix('diagnostics')->group(function () {
    Route::get('/global-stats', [DiagnosticController::class, 'get_global_stats'])->withoutMiddleware(['auth:sanctum']);
    Route::get('/user-health', [DiagnosticController::class, 'get_users_health_per_month'])->withoutMiddleware(['auth:sanctum']);
    Route::get('/company-health', [DiagnosticController::class, 'get_company_health_per_month'])->withoutMiddleware(['auth:sanctum']);
    Route::get('/', [DiagnosticController::class, 'index'])->withoutMiddleware(['auth:sanctum']);
});

// --- ADMIN ANALYTICS ---
Route::prefix('admin')->group(function () {
    Route::get('/usage-by-company', [AdminAnalyticsController::class, 'usageByCompany'])->withoutMiddleware(['auth:sanctum']);
    Route::get('/churn-risk', [AdminAnalyticsController::class, 'churnRisk'])->withoutMiddleware(['auth:sanctum']);
});