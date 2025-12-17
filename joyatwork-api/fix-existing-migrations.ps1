# Script pour marquer les migrations existantes comme déjà exécutées

Write-Host "Vérification et marquage des migrations existantes..." -ForegroundColor Yellow

# Liste des migrations et leurs tables associées
$migrations = @(
    @{ migration = "0001_01_01_000000_create_users_table"; tables = @("users", "password_reset_tokens", "sessions") },
    @{ migration = "0001_01_01_000001_create_cache_table"; tables = @("cache", "cache_locks") },
    @{ migration = "0001_01_01_000002_create_jobs_table"; tables = @("jobs", "job_batches", "failed_jobs") },
    @{ migration = "2025_11_27_153936_create_personal_access_tokens_table"; tables = @("personal_access_tokens") },
    @{ migration = "2025_11_27_165734_create_companies_table"; tables = @("companies") }
)

# Commande pour vérifier et marquer
$checkScript = @"
<?php
require __DIR__ . '/vendor/autoload.php';
\$app = require_once __DIR__ . '/bootstrap/app.php';
\$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

\$migrations = [
    ['migration' => '0001_01_01_000000_create_users_table', 'tables' => ['users', 'password_reset_tokens', 'sessions']],
    ['migration' => '0001_01_01_000001_create_cache_table', 'tables' => ['cache', 'cache_locks']],
    ['migration' => '0001_01_01_000002_create_jobs_table', 'tables' => ['jobs', 'job_batches', 'failed_jobs']],
    ['migration' => '2025_11_27_153936_create_personal_access_tokens_table', 'tables' => ['personal_access_tokens']],
    ['migration' => '2025_11_27_165734_create_companies_table', 'tables' => ['companies']],
];

\$maxBatch = DB::table('migrations')->max('batch') ?? 0;
\$newBatch = \$maxBatch + 1;
\$marked = 0;

foreach (\$migrations as \$mig) {
    \$migrationName = \$mig['migration'];
    \$tables = \$mig['tables'];
    
    // Vérifier si au moins une table existe
    \$tableExists = false;
    foreach (\$tables as \$table) {
        if (Schema::hasTable(\$table)) {
            \$tableExists = true;
            break;
        }
    }
    
    // Vérifier si la migration est déjà marquée
    \$isMarked = DB::table('migrations')->where('migration', \$migrationName)->exists();
    
    if (\$tableExists && !\$isMarked) {
        DB::table('migrations')->insert([
            'migration' => \$migrationName,
            'batch' => \$newBatch
        ]);
        echo "✅ Migration marquée: \$migrationName\n";
        \$marked++;
    } elseif (\$isMarked) {
        echo "ℹ️  Migration déjà marquée: \$migrationName\n";
    } elseif (!\$tableExists) {
        echo "⏳ Table(s) n'existe(nt) pas: \$migrationName\n";
    }
}

if (\$marked > 0) {
    echo "\n✅ \$marked migration(s) marquée(s) avec succès!\n";
    echo "Vous pouvez maintenant exécuter: php artisan migrate\n";
} else {
    echo "\n✅ Toutes les migrations sont à jour.\n";
}
"@

$checkScript | Out-File -FilePath "check-migrations.php" -Encoding UTF8

Write-Host "Exécution du script de vérification..." -ForegroundColor Cyan
php check-migrations.php

Remove-Item check-migrations.php -ErrorAction SilentlyContinue

Write-Host "`nTerminé!" -ForegroundColor Green

