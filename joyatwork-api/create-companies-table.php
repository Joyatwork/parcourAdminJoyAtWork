<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== Création de la table companies ===\n\n";

// Vérifier si la table existe
if (Schema::hasTable('companies')) {
    echo "✅ La table 'companies' existe déjà.\n";
    $columns = Schema::getColumnListing('companies');
    echo "   Colonnes: " . implode(', ', $columns) . "\n";
    exit(0);
}

echo "⚠️  La table 'companies' n'existe pas.\n";
echo "Création de la table...\n\n";

try {
    Schema::create('companies', function ($table) {
        $table->id();
        $table->string('name');
        $table->string('sector')->nullable();
        $table->string('location')->nullable();
        $table->integer('employees')->default(0);
        $table->string('phone')->nullable();
        $table->string('email')->unique();
        $table->string('website')->nullable();
        $table->text('description')->nullable();
        $table->json('wellness_programs')->nullable();
        $table->string('status')->default('En négociation');
        $table->decimal('contract_value', 10, 2)->nullable();
        $table->boolean('verified')->default(false);
        $table->timestamps();
    });
    
    echo "✅ Table 'companies' créée avec succès!\n\n";
    
    // Marquer la migration comme exécutée
    $maxBatch = DB::table('migrations')->max('batch') ?? 0;
    $newBatch = $maxBatch + 1;
    
    if (!DB::table('migrations')->where('migration', '2025_11_27_165734_create_companies_table')->exists()) {
        DB::table('migrations')->insert([
            'migration' => '2025_11_27_165734_create_companies_table',
            'batch' => $newBatch
        ]);
        echo "✅ Migration marquée comme exécutée.\n";
    }
    
    echo "\n✅ Terminé! Vous pouvez maintenant tester l'API.\n";
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}

