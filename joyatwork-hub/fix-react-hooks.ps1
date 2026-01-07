# Script pour nettoyer et réinstaller les dependances
# Cela resout souvent le probleme "Invalid hook call"

Write-Host "Nettoyage des dependances..." -ForegroundColor Yellow

# Supprimer node_modules
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "[OK] node_modules supprime" -ForegroundColor Green
} else {
    Write-Host "[INFO] node_modules n'existe pas" -ForegroundColor Gray
}

# Supprimer les fichiers de lock
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
    Write-Host "[OK] package-lock.json supprime" -ForegroundColor Green
}

if (Test-Path "bun.lockb") {
    Remove-Item "bun.lockb"
    Write-Host "[OK] bun.lockb supprime" -ForegroundColor Green
}

Write-Host ""
Write-Host "Reinstallation des dependances..." -ForegroundColor Yellow

# Reinstaller avec npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    npm install
    Write-Host "[OK] Dependances reinstallees avec npm" -ForegroundColor Green
} elseif (Get-Command bun -ErrorAction SilentlyContinue) {
    bun install
    Write-Host "[OK] Dependances reinstallees avec bun" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Aucun gestionnaire de paquets trouve (npm ou bun)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Nettoyage termine ! Vous pouvez maintenant redemarrer le serveur avec: npm run dev" -ForegroundColor Green

