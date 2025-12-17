# Script de configuration Laravel pour les entreprises
Write-Host "Configuration du backend Laravel..." -ForegroundColor Green

# Aller dans le répertoire Laravel
Set-Location "c:\Users\gharb\OneDrive\Bureau\joyatwork-api"

# Copier les fichiers Laravel
Write-Host "Copie des fichiers Laravel..." -ForegroundColor Yellow
Copy-Item "c:\Users\gharb\OneDrive\Bureau\joyatwork-hub\COPY_TO_LARAVEL_Company.php" "app\Models\Company.php" -Force
Copy-Item "c:\Users\gharb\OneDrive\Bureau\joyatwork-hub\COPY_TO_LARAVEL_CompanyController.php" "app\Http\Controllers\CompanyController.php" -Force

# Ajouter les routes
Write-Host "Ajout des routes API..." -ForegroundColor Yellow
Add-Content "routes\api.php" ""
Add-Content "routes\api.php" "// Routes pour les entreprises"
Add-Content "routes\api.php" "Route::apiResource('companies', App\Http\Controllers\CompanyController::class);"
Add-Content "routes\api.php" "Route::get('companies-stats', [App\Http\Controllers\CompanyController::class, 'stats']);"

Write-Host "Configuration terminée!" -ForegroundColor Green
Write-Host "Testez maintenant : curl.exe -X GET 'http://127.0.0.1:8001/api/companies'" -ForegroundColor Cyan

# Revenir au répertoire original
Set-Location "c:\Users\gharb\OneDrive\Bureau\joyatwork-hub"
