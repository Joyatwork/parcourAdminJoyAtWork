@echo off
echo Configuration du backend Laravel pour les entreprises...

REM Aller dans le repertoire Laravel
cd "c:\Users\gharb\OneDrive\Bureau\joyatwork-api"

REM Copier le modele Company
copy "c:\Users\gharb\OneDrive\Bureau\joyatwork-hub\COPY_TO_LARAVEL_Company.php" "app\Models\Company.php" /Y

REM Copier le controleur CompanyController  
copy "c:\Users\gharb\OneDrive\Bureau\joyatwork-hub\COPY_TO_LARAVEL_CompanyController.php" "app\Http\Controllers\CompanyController.php" /Y

REM Ajouter les routes API
echo. >> routes\api.php
echo // Routes pour les entreprises >> routes\api.php
echo Route::apiResource('companies', App\Http\Controllers\CompanyController::class); >> routes\api.php
echo Route::get('companies-stats', [App\Http\Controllers\CompanyController::class, 'stats']); >> routes\api.php

echo Configuration terminee!
echo Maintenant executez le script SQL dans MySQL Workbench
pause
