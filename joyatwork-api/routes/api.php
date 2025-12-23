<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ContractController;
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