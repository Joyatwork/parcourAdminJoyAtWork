<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuration de la base de données
$host = 'joy-at-work-db1-joyatwork.l.aivencloud.com';
$port = 27018;
$dbname = 'joy_at_work_db';
$username = 'avnadmin';
$password = 'AVNS_lG_Esh7VWCOhWjV_CjF';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Test simple
    $stmt = $pdo->query('SELECT 1 as test');
    $result = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Connexion à la base de données réussie',
        'test_query' => $result
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de connexion à la base de données',
        'message' => $e->getMessage()
    ]);
}
?>
