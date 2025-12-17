<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration de la base de données
$host = 'joy-at-work-db1-joyatwork.l.aivencloud.com';
$port = 27018;
$dbname = 'joy_at_work_db';
$username = 'avnadmin';
$password = 'AVNS_lG_Esh7VWCOhWjV_CjF';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Connexion à la base de données échouée',
        'message' => $e->getMessage()
    ]);
    exit();
}

// Traiter les requêtes DELETE uniquement
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Méthode non autorisée',
        'message' => 'Seules les requêtes DELETE sont acceptées'
    ]);
    exit();
}

// Récupérer l'ID depuis l'URL (ex: /delete_practitioner.php?id=123)
$practitioner_id = $_GET['id'] ?? null;

if (!$practitioner_id || !is_numeric($practitioner_id)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'ID manquant ou invalide',
        'message' => 'L\'ID du praticien est requis et doit être un nombre'
    ]);
    exit();
}

try {
    // Vérifier si le praticien existe
    $checkStmt = $pdo->prepare("SELECT name FROM practitioners WHERE id = ?");
    $checkStmt->execute([$practitioner_id]);
    $practitioner = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$practitioner) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Praticien non trouvé',
            'message' => 'Aucun praticien trouvé avec cet ID'
        ]);
        exit();
    }
    
    // Supprimer le praticien
    $deleteStmt = $pdo->prepare("DELETE FROM practitioners WHERE id = ?");
    $result = $deleteStmt->execute([$practitioner_id]);
    
    if ($result && $deleteStmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Praticien supprimé avec succès',
            'data' => [
                'id' => $practitioner_id,
                'name' => $practitioner['name']
            ]
        ]);
    } else {
        throw new Exception('Erreur lors de la suppression');
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de base de données',
        'message' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur interne',
        'message' => $e->getMessage()
    ]);
}
?>