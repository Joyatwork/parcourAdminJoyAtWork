<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

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

    // Sélectionner les practitioners dont la portion nom est vide dans la bio
    $selectSql = "SELECT id, bio FROM practitioners WHERE bio LIKE 'Praticien:%' AND LOCATE('. Email:', bio) > 0 AND LENGTH(TRIM(SUBSTRING(bio, CHAR_LENGTH('Praticien: ')+1, LOCATE('. Email:', bio) - (CHAR_LENGTH('Praticien: ')+1)))) = 0";
    $stmt = $pdo->prepare($selectSql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $updated = [];
    if (count($rows) > 0) {
        $updateSql = "UPDATE practitioners SET bio = CONCAT('Praticien: Praticien ', id, '. Email: Non spécifié. Expérience: Non spécifié ans. Praticien expérimenté.') WHERE id = ?";
        $updateStmt = $pdo->prepare($updateSql);

        foreach ($rows as $r) {
            $updateStmt->execute([$r['id']]);
            $updated[] = (int)$r['id'];
        }
    }

    echo json_encode([
        'success' => true,
        'found' => count($rows),
        'updated_ids' => $updated
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur PDO: ' . $e->getMessage()
    ]);
}

?>
