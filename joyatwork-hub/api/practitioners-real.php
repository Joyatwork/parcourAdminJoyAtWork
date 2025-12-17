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
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Récupérer tous les praticiens
        $stmt = $pdo->query('SELECT * FROM practitioners ORDER BY id');
        $practitioners = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Générer des noms basés sur les données disponibles (élargi pour plus de praticiens)
    $firstNames = ['Marie', 'Jean', 'Sophie', 'Pierre', 'Claire', 'Paul', 'Anne', 'Luc', 'Julie', 'Marc', 
                   'Emma', 'Louis', 'Camille', 'Lucas', 'Léa', 'Hugo', 'Chloé', 'Alexandre', 'Manon', 'Thomas'];
    $lastNames = ['Martin', 'Dubois', 'Laurent', 'Moreau', 'Simon', 'Michel', 'Garcia', 'Roux', 'Leroy', 'Bernard',
                  'Petit', 'Robert', 'Richard', 'Durand', 'Lefebvre', 'Morel', 'Fournier', 'Girard', 'Bonnet', 'Dupont'];
    
    foreach ($practitioners as &$practitioner) {
        // Essayer d'extraire les vrais noms de la bio pour les nouveaux praticiens
        if (strpos($practitioner['bio'], 'Praticien: ') === 0) {
            // Nouveau format avec vrais noms dans la bio
            preg_match('/Praticien: (.*?)\. Email:/', $practitioner['bio'], $matches);
            if ($matches && isset($matches[1])) {
                $fullName = $matches[1];
                $nameParts = explode(' ', $fullName, 2);
                $practitioner['first_name'] = $nameParts[0] ?? 'Prénom';
                $practitioner['last_name'] = $nameParts[1] ?? 'Nom';
                $practitioner['name'] = $fullName;
            } else {
                // Fallback si extraction échoue
                $practitioner['first_name'] = 'Nouveau';
                $practitioner['last_name'] = 'Praticien';
                $practitioner['name'] = 'Nouveau Praticien';
            }
        } else {
            // Anciens praticiens - générer des noms comme avant
            $firstNameIndex = ($practitioner['id'] - 1) % count($firstNames);
            $lastNameIndex = ($practitioner['id'] - 1) % count($lastNames);
            
            $practitioner['first_name'] = $firstNames[$firstNameIndex];
            $practitioner['last_name'] = $lastNames[$lastNameIndex];
            $practitioner['name'] = $practitioner['first_name'] . ' ' . $practitioner['last_name'];
        }
        
        // Ajouter des données supplémentaires si elles n'existent pas
        if (!isset($practitioner['email'])) {
            $practitioner['email'] = strtolower($practitioner['first_name'] . '.' . $practitioner['last_name'] . '@joyatwork.com');
        }
        if (!isset($practitioner['phone'])) {
            $practitioner['phone'] = '01 23 45 67 ' . str_pad($practitioner['id'], 2, '0', STR_PAD_LEFT);
        }
        if (!isset($practitioner['experience_years'])) {
            $practitioner['experience_years'] = rand(3, 15);
        }
        if (!isset($practitioner['rating'])) {
            $practitioner['rating'] = round(rand(35, 50) / 10, 1);
        }
        if (!isset($practitioner['certifications'])) {
            $practitioner['certifications'] = 'Certification ' . $practitioner['specialty'];
        }
        if (!isset($practitioner['availability'])) {
            $practitioner['availability'] = rand(0, 1) ? 'Disponible' : 'Occupé';
        }
    }
    
        echo json_encode([
            'success' => true,
            'data' => $practitioners,
            'count' => count($practitioners)
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Ajouter un nouveau praticien
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data || !isset($data['first_name']) || !isset($data['last_name'])) {
            throw new Exception('Les champs first_name et last_name sont obligatoires');
        }
        
        // Insérer avec les colonnes qui existent réellement dans la base
        $sql = "INSERT INTO practitioners (entreprise_id, user_id, specialty, license_number, bio, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
        
        $specialty = $data['certifications'] ?? $data['specialty'] ?? 'Généraliste';
        $license = 'LIC-' . rand(1000, 9999);
        $bio = $data['bio'] ?? 'Praticien expérimenté dédié au bien-être au travail et à la santé mentale.';
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            1, // entreprise_id par défaut
            rand(50, 200), // user_id temporaire
            $specialty,
            $license,
            $bio
        ]);
        
        $newId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Praticien ajouté avec succès',
            'id' => $newId
        ]);
        
    } else {
        throw new Exception('Méthode non autorisée');
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de connexion à la base de données',
        'message' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
