<?php

use App\Http\Controllers\CompanyController;
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

// Routes pour les praticiens (existantes)
Route::get('/practitioners', function () {
    // Route existante pour les praticiens
    return response()->json([
        'message' => 'Practitioners API endpoint'
    ]);
});

// Routes pour les entreprises
Route::apiResource('companies', CompanyController::class);
Route::get('/companies-stats', [CompanyController::class, 'stats']);

// Route de test
Route::get('/test', function () {
    return response()->json([
        'message' => 'JoyAtWork API is running!',
        'timestamp' => now(),
        'endpoints' => [
            'companies' => '/api/companies',
            'companies-stats' => '/api/companies-stats',
            'practitioners' => '/api/practitioners'
        ]
    ]);
});
