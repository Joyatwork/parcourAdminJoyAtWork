<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "Vérification des tables existantes...\n\n";

$tablesToCheck = [
    'users' => '0001_01_01_000000_create_users_table',
    'cache' => '0001_01_01_000001_create_cache_table',
    'cache_locks' => '0001_01_01_000001_create_cache_table',
    'jobs' => '0001_01_01_000002_create_jobs_table',
    'job_batches' => '0001_01_01_000002_create_jobs_table',
    'failed_jobs' => '0001_01_01_000002_create_jobs_table',
    'personal_access_tokens' => '2025_11_27_153936_create_personal_access_tokens_table',
    'companies' => '2025_11_27_165734_create_companies_table',
];

$migrationsToMark = [];

foreach ($tablesToCheck as $table => $migration) {
    $exists = Schema::hasTable($table);
    $isMarked = DB::table('migrations')->where('migration', $migration)->exists();
    
    echo sprintf(
        "Table: %-30s | Existe: %-5s | Migration marquée: %-5s\n",
        $table,
        $exists ? 'OUI' : 'NON',
        $isMarked ? 'OUI' : 'NON'
    );
    
    if ($exists && !$isMarked) {
        $migrationsToMark[] = $migration;
    }
}

echo "\n";

if (empty($migrationsToMark)) {
    echo "✅ Toutes les migrations sont déjà marquées.\n";
} else {
    echo "Marquage des migrations existantes...\n";
    
    // Obtenir le batch maximum
    $maxBatch = DB::table('migrations')->max('batch') ?? 0;
    $newBatch = $maxBatch + 1;
    
    foreach ($migrationsToMark as $migration) {
        DB::table('migrations')->insert([
            'migration' => $migration,
            'batch' => $newBatch
        ]);
        echo "✅ Migration marquée: $migration\n";
    }
    
    echo "\n✅ Toutes les migrations existantes ont été marquées.\n";
    echo "Vous pouvez maintenant exécuter: php artisan migrate\n";
}

