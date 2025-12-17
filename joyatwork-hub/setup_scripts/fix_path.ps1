# Script pour trouver PHP et l'ajouter au PATH temporairement
Write-Host "Recherche de PHP sur votre ordinateur..." -ForegroundColor Cyan

$CommonPaths = @(
    "C:\laragon\bin\php",
    "C:\xampp\php",
    "C:\php",
    "C:\Program Files\php",
    "C:\Tools\php"
)

$PhpFound = $false

foreach ($Path in $CommonPaths) {
    if (Test-Path $Path) {
        # Pour Laragon, il peut y avoir plusieurs versions, on prend la derniere
        if ($Path -like "*laragon*") {
            $Versions = Get-ChildItem $Path -Directory
            if ($Versions) {
                $LatestVersion = $Versions | Sort-Object Name -Descending | Select-Object -First 1
                $PhpPath = $LatestVersion.FullName
            }
        } else {
            $PhpPath = $Path
        }

        if ($PhpPath -and (Test-Path "$PhpPath\php.exe")) {
            Write-Host "✅ PHP trouve ici : $PhpPath" -ForegroundColor Green
            
            # Ajouter au PATH pour cette session
            $env:Path = "$PhpPath;$env:Path"
            Write-Host "✅ Ajoute au PATH de cette session." -ForegroundColor Green
            
            # Verifier
            php -v
            $PhpFound = $true
            break
        }
    }
}

if (-not $PhpFound) {
    Write-Error "❌ Impossible de trouver PHP automatiquement."
    Write-Host "Si vous l'avez installe, ou est-il ?" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "🎉 Super ! Maintenant vous pouvez relancer le script d'installation :" -ForegroundColor Cyan
    Write-Host "./setup_backend_automated.ps1" -ForegroundColor White
}
