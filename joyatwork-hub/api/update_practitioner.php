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

// Traiter les requêtes PUT uniquement
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Méthode non autorisée',
        'message' => 'Seules les requêtes PUT sont acceptées'
    ]);
    exit();
}

// Récupérer l'ID depuis l'URL
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

// Récupérer les données JSON de la requête
$input = json_decode(file_get_contents('php://input'), true);

// Vérifier que les données requises sont présentes
if (!isset($input['name']) || !isset($input['email']) || !isset($input['specializations'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Données manquantes',
        'message' => 'Les champs nom, email et spécialité sont obligatoires'
    ]);
    exit();
}

try {
    // Vérifier si le praticien existe
    $checkStmt = $pdo->prepare("SELECT id FROM practitioners WHERE id = ?");
    $checkStmt->execute([$practitioner_id]);
    
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Praticien non trouvé',
            'message' => 'Aucun praticien trouvé avec cet ID'
        ]);
        exit();
    }
    
    // Préparer la requête de mise à jour
    $sql = "UPDATE practitioners SET first_name = ?, last_name = ?, email = ?, phone = ?, specializations = ?, updated_at = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    
    // Séparer le nom complet en prénom et nom de famille
    $nameParts = explode(' ', $input['name'], 2);
    $firstName = $nameParts[0];
    $lastName = isset($nameParts[1]) ? $nameParts[1] : '';
    
    // Exécuter la requête avec les données fournies
    $result = $stmt->execute([
        $firstName,
        $lastName,
        $input['email'],
        $input['phone'] ?? null,
        $input['specializations'] ?? $input['specialty'] ?? null,
        $practitioner_id
    ]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Praticien modifié avec succès',
            'data' => [
                'id' => $practitioner_id,
                'name' => $input['name'],
                'email' => $input['email'],
                'phone' => $input['phone'] ?? null,
                'speciality' => $input['specialty'],
                'location' => $input['location'] ?? null
            ]
        ]);
    } else {
        throw new Exception('Erreur lors de la mise à jour');
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