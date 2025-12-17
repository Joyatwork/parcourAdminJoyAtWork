$phpIni = "C:\Program Files\php-8.5.0\php.ini"
Write-Host "Updating php.ini at $phpIni..." -ForegroundColor Cyan

try {
    $content = Get-Content $phpIni
    $newContent = $content | ForEach-Object {
        $_ -replace ";extension=fileinfo", "extension=fileinfo" `
           -replace ";extension=zip", "extension=zip" `
           -replace ";extension=pdo_mysql", "extension=pdo_mysql"
    }
    $newContent | Set-Content $phpIni -ErrorAction Stop
    Write-Host "Success! Extensions enabled." -ForegroundColor Green
    Write-Host "Please re-run the setup script now." -ForegroundColor Yellow
} catch {
    Write-Error "Could not write to php.ini. You might need to run this as Administrator."
    Write-Host "Try opening PowerShell as Administrator and running this script again." -ForegroundColor Red
}
