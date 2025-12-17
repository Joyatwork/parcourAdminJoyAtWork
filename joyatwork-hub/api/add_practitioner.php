<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuration de la base de données Aiven Cloud
$host = 'joy-at-work-db1-joy-at-work-db1.k.aivencloud.com';
$port = '18136';
$dbname = 'mindful_journey';
$username = 'INES_GHARBI';
$password = 'AVNS_AqIfsPTzKz7051I_pyv';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Lire et parser le JSON du corps de la requête
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        // Log des données reçues pour debug (après décodage)
        error_log('Données reçues: ' . print_r($data, true));

        if (!$data) {
            throw new Exception('Corps de la requête invalide ou JSON non décodable');
        }

        // Préparation de la requête d'insertion avec les VRAIES colonnes de la table
        $sql = "INSERT INTO practitioners (entreprise_id, user_id, specialty, license_number, bio, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())";

        $stmt = $pdo->prepare($sql);

        // Utiliser les vraies données du formulaire (avec valeurs par défaut si manquantes)
        $first_name = trim($data['first_name'] ?? '');
        $last_name = trim($data['last_name'] ?? '');
        $specialty = $data['certifications'] ?? $data['specialty'] ?? 'Praticien bien-être';
        $license_number = 'LIC-' . rand(10000, 99999);

        // Créer une bio avec les vrais noms et informations — si first/last manquants, mettre "Non spécifié"
        $display_first = $first_name !== '' ? $first_name : 'Non spécifié';
        $display_last = $last_name !== '' ? $last_name : '';
        $email_display = $data['email'] ?? 'Non spécifié';
        $experience_display = $data['experience_years'] ?? 'Non spécifié';
        $extra_bio = $data['bio'] ?? 'Praticien expérimenté.';

        $bio_text = "Praticien: " . trim($display_first . ' ' . $display_last) .
                   ". Email: " . $email_display .
                   ". Expérience: " . $experience_display . " ans. " .
                   $extra_bio;

        // Trouver un user_id libre (non utilisé par un autre practitioner)
        $sql_free_user = "SELECT u.id FROM users u LEFT JOIN practitioners p ON u.id = p.user_id WHERE p.user_id IS NULL LIMIT 1";
        $stmt_free = $pdo->prepare($sql_free_user);
        $stmt_free->execute();
        $free_user = $stmt_free->fetch(PDO::FETCH_ASSOC);

        if (!$free_user) {
            throw new Exception('Aucun user_id libre disponible');
        }

        $available_user_id = $free_user['id'];

        $stmt->execute([
            1, // entreprise_id par défaut
            $available_user_id, // user_id libre trouvé
            $specialty,
            $license_number,
            $bio_text
        ]);

        // Réponse simple sans récupération des données
        $newId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => 'Praticien ajouté avec succès',
            'id' => $newId,
            'specialty' => $specialty
        ]);

    } else {
        throw new Exception('Méthode non autorisée');
    }
    
} catch (PDOException $e) {
    error_log("Erreur PDO: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de base de données: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Erreur: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
