<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = '18136';
$dbname = 'mindful_journey';
$username = 'INES_GHARBI';
$password = 'AVNS_AqIfsPTzKz7051I_pyv';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Trouver un user_id libre
    $sql = "SELECT u.id as user_id, p.user_id as used_by_practitioner 
            FROM users u 
            LEFT JOIN practitioners p ON u.id = p.user_id 
            WHERE p.user_id IS NULL 
            LIMIT 5";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $available_users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'available_user_ids' => $available_users,
        'message' => 'IDs utilisateurs disponibles (non utilisés par des practitioners)'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}