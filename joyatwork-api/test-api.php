<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Company;
use Illuminate\Support\Facades\DB;

echo "=== Test de l'API Companies ===\n\n";

// Test 1: Connexion DB
echo "1. Test de connexion DB...\n";
try {
    DB::connection()->getPdo();
    echo "   ✅ Connexion OK\n";
} catch (Exception $e) {
    echo "   ❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2: Table existe
echo "\n2. Vérification table 'companies'...\n";
try {
    $exists = DB::getSchemaBuilder()->hasTable('companies');
    if ($exists) {
        echo "   ✅ Table 'companies' existe\n";
    } else {
        echo "   ❌ Table 'companies' n'existe pas\n";
        echo "   💡 Exécutez: php artisan migrate\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "   ❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Modèle Company
echo "\n3. Test du modèle Company...\n";
try {
    $count = Company::count();
    echo "   ✅ Modèle OK - $count entreprise(s) trouvée(s)\n";
} catch (Exception $e) {
    echo "   ❌ Erreur: " . $e->getMessage() . "\n";
    echo "   Détails: " . $e->getTraceAsString() . "\n";
    exit(1);
}

// Test 4: Query avec orderBy
echo "\n4. Test query avec orderBy...\n";
try {
    $companies = Company::orderBy('name')->get();
    echo "   ✅ Query OK - " . $companies->count() . " résultat(s)\n";
} catch (Exception $e) {
    echo "   ❌ Erreur: " . $e->getMessage() . "\n";
    echo "   Détails: " . $e->getTraceAsString() . "\n";
    exit(1);
}

// Test 5: Structure de la table
echo "\n5. Vérification structure table...\n";
try {
    $columns = DB::getSchemaBuilder()->getColumnListing('companies');
    echo "   Colonnes trouvées: " . implode(', ', $columns) . "\n";
    
    $required = ['id', 'name', 'sector', 'location', 'employees', 'email', 'status'];
    $missing = array_diff($required, $columns);
    
    if (empty($missing)) {
        echo "   ✅ Toutes les colonnes requises sont présentes\n";
    } else {
        echo "   ⚠️  Colonnes manquantes: " . implode(', ', $missing) . "\n";
    }
} catch (Exception $e) {
    echo "   ❌ Erreur: " . $e->getMessage() . "\n";
}

echo "\n=== Tests terminés ===\n";

