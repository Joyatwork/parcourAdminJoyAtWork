# Script d'automatisation pour configurer le backend Laravel
# A executer depuis le dossier joyatwork-hub

$ErrorActionPreference = "Stop"

Write-Host ">>> Demarrage de la configuration du backend JoyAtWork..." -ForegroundColor Cyan

# 1. Definir les chemins
$CurrentDir = Get-Location
$ParentDir = (Get-Item $CurrentDir).Parent.FullName
$BackendDir = Join-Path $ParentDir "joyatwork-api"

Write-Host "Dossier frontend : $CurrentDir" -ForegroundColor Gray
Write-Host "Dossier backend cible : $BackendDir" -ForegroundColor Gray

# 2. Verifier si PHP et Composer sont installes
try {
    php -v | Out-Null
    composer --version | Out-Null
    Write-Host "PHP et Composer sont detectes." -ForegroundColor Green
} catch {
    Write-Error "PHP ou Composer n'est pas installe ou n'est pas dans le PATH."
    exit 1
}

# 3. Creer le projet Laravel s'il n'existe pas ou est incomplet
$ArtisanFile = Join-Path $BackendDir "artisan"
$RoutesFile = Join-Path $BackendDir "routes\api.php"

if (Test-Path $BackendDir) {
    $isBroken = $false
    if (-not (Test-Path $ArtisanFile)) {
        Write-Host "Le dossier existe mais semble incomplet (pas d'artisan)." -ForegroundColor Yellow
        $isBroken = $true
    } elseif (-not (Test-Path $RoutesFile)) {
        Write-Host "Le dossier existe mais semble incomplet (pas de routes/api.php)." -ForegroundColor Yellow
        $isBroken = $true
    }

    if ($isBroken) {
        Write-Host "Suppression du dossier corrompu pour reinstallation..." -ForegroundColor Yellow
        Remove-Item -Path $BackendDir -Recurse -Force
    }
}

if (-not (Test-Path $BackendDir)) {
    Write-Host "Creation du projet Laravel dans $BackendDir..." -ForegroundColor Yellow
    Write-Host "Cela peut prendre quelques minutes..." -ForegroundColor Yellow
    
    # On lance la commande dans le dossier parent
    Push-Location $ParentDir
    composer create-project laravel/laravel joyatwork-api
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Erreur lors de la creation du projet Laravel."
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "Projet Laravel cree avec succes." -ForegroundColor Green
    
    # Laravel 11+ : Installer l'API pour avoir routes/api.php
    Write-Host "Installation de l'API Laravel (pour routes/api.php)..." -ForegroundColor Yellow
    Push-Location $BackendDir
    php artisan install:api --quiet
    Pop-Location

} else {
    Write-Host "Le dossier $BackendDir existe deja et semble valide. On passe a la configuration." -ForegroundColor Yellow
}

# 4. Copier les fichiers de configuration
Write-Host "Copie des fichiers de l'application..." -ForegroundColor Yellow

# Copier le Modele
$ModelSource = Join-Path $CurrentDir "COPY_TO_LARAVEL_Company.php"
$ModelDest = Join-Path $BackendDir "app\Models\Company.php"
Copy-Item -Path $ModelSource -Destination $ModelDest -Force
Write-Host "  Copied: Company.php" -ForegroundColor Gray

# Copier le Controleur
$ControllerSource = Join-Path $CurrentDir "COPY_TO_LARAVEL_CompanyController.php"
$ControllerDest = Join-Path $BackendDir "app\Http\Controllers\CompanyController.php"
Copy-Item -Path $ControllerSource -Destination $ControllerDest -Force
Write-Host "  Copied: CompanyController.php" -ForegroundColor Gray

# 5. Configurer les routes
Write-Host "Configuration des routes API..." -ForegroundColor Yellow
$RoutesFile = Join-Path $BackendDir "routes\api.php"

# Lire le contenu actuel
$RoutesContent = Get-Content $RoutesFile -Raw

# Verifier si la route existe deja pour eviter les doublons
if ($RoutesContent -notmatch "CompanyController") {
    # Ajouter le 'use' en haut du fichier
    $RoutesContent = $RoutesContent -replace "<\?php", "<?php`r`nuse App\Http\Controllers\CompanyController;"
    
    # Ajouter les routes a la fin
    $NewRoutes = @"

// Routes pour les entreprises (JoyAtWork)
Route::apiResource('companies', CompanyController::class);
Route::get('/companies-stats', [CompanyController::class, 'stats']);
"@
    $RoutesContent += $NewRoutes
    
    Set-Content -Path $RoutesFile -Value $RoutesContent
    Write-Host "Routes ajoutees." -ForegroundColor Green
} else {
    Write-Host "Les routes semblent deja configurees." -ForegroundColor Gray
}

Write-Host "Configuration terminee !" -ForegroundColor Green
Write-Host ""
Write-Host ">>> Pour lancer le serveur backend :" -ForegroundColor Cyan
Write-Host "   cd $BackendDir" -ForegroundColor White
Write-Host "   php artisan serve --port=8001" -ForegroundColor White
Write-Host ""
Write-Host "ATTENTION : N'oubliez pas de configurer votre base de donnees dans le fichier .env du backend !" -ForegroundColor Red
