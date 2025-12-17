$EnvFile = "..\joyatwork-api\.env"

if (-not (Test-Path $EnvFile)) {
    Write-Error "File $EnvFile not found!"
    exit 1
}

$Content = Get-Content $EnvFile

# Helper function to replace or append
function Update-EnvKey ($key, $value, $content) {
    $pattern = "^#?\s*$key=.*$"
    $replacement = "$key=$value"
    
    if ($content -match $pattern) {
        return $content -replace $pattern, $replacement
    } else {
        return $content + $replacement
    }
}

$Content = Update-EnvKey "DB_CONNECTION" "mysql" $Content
$Content = Update-EnvKey "DB_HOST" "joy-at-work-db1-joy-at-work-db1.k.aivencloud.com" $Content
$Content = Update-EnvKey "DB_PORT" "18136" $Content
$Content = Update-EnvKey "DB_DATABASE" "mindful_journey" $Content
$Content = Update-EnvKey "DB_USERNAME" "INES_GHARBI" $Content
$Content = Update-EnvKey "DB_PASSWORD" "AVNS_AqIfsPTzKz7051I_pyv" $Content

$Content | Set-Content $EnvFile
Write-Host "Updated .env with database credentials." -ForegroundColor Green
