<?php
try {
    $host = 'joy-at-work-db1-joyatwork.l.aivencloud.com';
    $port = 27018;
    $dbname = 'joy_at_work_db';
    $username = 'avnadmin';
    $password = 'AVNS_lG_Esh7VWCOhWjV_CjF';
    
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connexion réussie!\n";
    
    // Afficher la structure de la table practitioners
    $stmt = $pdo->query('DESCRIBE practitioners');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Structure de la table 'practitioners':\n";
    foreach ($columns as $column) {
        echo "- " . $column['Field'] . " (" . $column['Type'] . ")\n";
    }
    
    // Afficher aussi un exemple d'enregistrement s'il existe
    echo "\nPremier enregistrement (si il existe):\n";
    $stmt = $pdo->query('SELECT * FROM practitioners LIMIT 1');
    $sample = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($sample) {
        foreach ($sample as $key => $value) {
            echo "- $key: $value\n";
        }
    } else {
        echo "Aucun enregistrement trouvé.\n";
    }
    
} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage() . "\n";
}
?>