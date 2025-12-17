<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
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
    
    // Lire l'input une seule fois
    $input = file_get_contents('php://input');
    error_log("Method: " . $_SERVER['REQUEST_METHOD']);
    error_log("Input: " . $input);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Récupérer tous les challenges
        $sql = "SELECT 
                    id,
                    title,
                    description,
                    type,
                    created_at
                FROM challenges 
                ORDER BY created_at DESC";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        
        $challenges = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatage des données
        foreach ($challenges as &$challenge) {
            $challenge['date_created'] = date('d/m/Y', strtotime($challenge['created_at']));
            
            // Déterminer des icônes et couleurs selon le type
            switch ($challenge['type']) {
                case 'day':
                    $challenge['icon'] = '☀️';
                    $challenge['duration'] = 'Quotidien';
                    $challenge['color'] = 'yellow';
                    break;
                case 'week':
                    $challenge['icon'] = '📅';
                    $challenge['duration'] = 'Hebdomadaire';
                    $challenge['color'] = 'blue';
                    break;
                case 'month':
                    $challenge['icon'] = '🗓️';
                    $challenge['duration'] = 'Mensuel';
                    $challenge['color'] = 'purple';
                    break;
                default:
                    $challenge['icon'] = '🎯';
                    $challenge['duration'] = 'Challenge';
                    $challenge['color'] = 'green';
            }
            
            // Points basés sur la durée (simulation)
            $challenge['points'] = match($challenge['type']) {
                'day' => 10,
                'week' => 50,
                'month' => 200,
                default => 25
            };
            
            // Participants simulés (pourrait être calculé depuis une table de participations)
            $challenge['participants'] = rand(15, 150);
            $challenge['completion_rate'] = rand(65, 95);
        }
        
        echo json_encode([
            'success' => true,
            'data' => $challenges,
            'count' => count($challenges)
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Ajouter un nouveau challenge
        $data = json_decode($input, true);
        
        if (!$data || !isset($data['title']) || !isset($data['description'])) {
            throw new Exception('Les champs title et description sont obligatoires');
        }
        
        $sql = "INSERT INTO challenges (title, description, type, created_at) 
                VALUES (?, ?, ?, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['title'],
            $data['description'],
            $data['type'] ?? 'day'
        ]);
        
        $newId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Challenge ajouté avec succès',
            'id' => $newId
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Modifier un challenge existant
        $data = json_decode($input, true);
        
        error_log("PUT Data: " . print_r($data, true));
        
        if (!$data || !isset($data['id']) || !isset($data['title']) || !isset($data['description'])) {
            throw new Exception('Les champs id, title et description sont obligatoires');
        }
        
        $sql = "UPDATE challenges SET title = ?, description = ?, type = ? WHERE id = ?";
        
        error_log("PUT SQL: " . $sql);
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([
            $data['title'],
            $data['description'],
            $data['type'] ?? 'day',
            (int)$data['id']
        ]);
        
        error_log("PUT Affected rows: " . $stmt->rowCount());
        
        if ($stmt->rowCount() === 0) {
            throw new Exception('Challenge non trouvé ou aucune modification effectuée');
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Challenge modifié avec succès'
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Supprimer un challenge
        $data = json_decode($input, true);
        
        if (!$data || !isset($data['id'])) {
            throw new Exception('L\'ID du challenge est obligatoire');
        }
        
        $sql = "DELETE FROM challenges WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([$data['id']]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception('Challenge non trouvé');
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Challenge supprimé avec succès'
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