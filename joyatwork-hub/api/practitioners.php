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
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = '18136';
$dbname = 'mindful_journey';
$username = 'INES_GHARBI';
$password = 'AVNS_AqIfsPTzKz7051I_pyv';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Connexion à la base de données échouée: ' . $e->getMessage()]);
    exit();
}

// Router simple
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Route pour les praticiens
if ($path === '/practitioners.php' || $path === '/practitioners' || $path === '/api/practitioners.php' || $path === '/api/practitioners') {
    if ($method === 'GET') {
        try {
            $stmt = $pdo->query('SELECT * FROM practitioners ORDER BY id');
            $practitioners = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode([
                'success' => true,
                'data' => $practitioners,
                'count' => count($practitioners)
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Erreur lors de la récupération des praticiens: ' . $e->getMessage()
            ]);
        }
    }
    
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['name']) || !isset($input['specialty'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Nom et spécialité requis']);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare('INSERT INTO practitioners (name, email, phone, specialty, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())');
            $stmt->execute([
                $input['name'],
                $input['email'] ?? null,
                $input['phone'] ?? null,
                $input['specialty']
            ]);
            
            $id = $pdo->lastInsertId();
            $stmt = $pdo->prepare('SELECT * FROM practitioners WHERE id = ?');
            $stmt->execute([$id]);
            $practitioner = $stmt->fetch(PDO::FETCH_ASSOC);
            
            http_response_code(201);
            echo json_encode($practitioner);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la création du praticien: ' . $e->getMessage()]);
        }
    }
}

// Route pour les entreprises
if ($path === '/companies.php' || $path === '/companies' || $path === '/api/companies.php' || $path === '/api/companies') {
    if ($method === 'GET') {
        try {
            $stmt = $pdo->query('SELECT * FROM companies ORDER BY id');
            $companies = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($companies);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la récupération des entreprises: ' . $e->getMessage()]);
        }
    }
}

// Route de test
if ($path === '/test-db.php' || $path === '/test-db' || $path === '/api/test-db.php' || $path === '/api/test-db') {
    try {
        $stmt = $pdo->query('SHOW TABLES');
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode([
            'status' => 'success',
            'message' => 'Connexion réussie à la base de données',
            'tables' => $tables
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Erreur de connexion: ' . $e->getMessage()
        ]);
    }
}

// Route par défaut
if ($path === '/' || $path === '/index.php' || $path === '/api/' || $path === '/api') {
    echo json_encode([
        'message' => 'API Joyatwork',
        'endpoints' => [
            'GET /api/practitioners' => 'Liste des praticiens',
            'POST /api/practitioners' => 'Créer un praticien',
            'GET /api/companies' => 'Liste des entreprises',
            'GET /api/test-db' => 'Test de connexion à la DB'
        ]
    ]);
}
?>
