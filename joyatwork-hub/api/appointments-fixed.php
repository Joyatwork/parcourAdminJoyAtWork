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
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Test simple - compter les enregistrements d'abord
        $countSql = "SELECT COUNT(*) as total FROM appointments";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute();
        $count = $countStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($count['total'] == 0) {
            // Créer des données de démonstration si la table est vide
            echo json_encode([
                'success' => true,
                'data' => [
                    [
                        'id' => 1,
                        'specialist_name' => 'Dr. Martin Dubois',
                        'scheduled_at' => date('Y-m-d H:i:s'),
                        'type' => 'Consultation',
                        'status' => 'confirmed',
                        'status_french' => 'Confirmé',
                        'status_color' => 'green',
                        'price_euros' => 75.00,
                        'date' => date('d/m/Y'),
                        'time' => date('H:i'),
                        'notes' => 'Consultation de suivi bien-être'
                    ],
                    [
                        'id' => 2,
                        'specialist_name' => 'Dr. Sophie Laurent',
                        'scheduled_at' => date('Y-m-d H:i:s', strtotime('+2 days')),
                        'type' => 'Thérapie',
                        'status' => 'scheduled',
                        'status_french' => 'Programmé',
                        'status_color' => 'blue',
                        'price_euros' => 90.00,
                        'date' => date('d/m/Y', strtotime('+2 days')),
                        'time' => date('H:i', strtotime('+2 days')),
                        'notes' => 'Séance de thérapie comportementale'
                    ],
                    [
                        'id' => 3,
                        'specialist_name' => 'Dr. Claire Moreau',
                        'scheduled_at' => date('Y-m-d H:i:s', strtotime('+5 days')),
                        'type' => 'Coaching',
                        'status' => 'pending',
                        'status_french' => 'En attente',
                        'status_color' => 'yellow',
                        'price_euros' => 65.00,
                        'date' => date('d/m/Y', strtotime('+5 days')),
                        'time' => date('H:i', strtotime('+5 days')),
                        'notes' => 'Coaching en développement personnel'
                    ]
                ],
                'count' => 3,
                'message' => 'Données de démonstration (table vide)'
            ]);
        } else {
            // Récupérer les vraies données
            $sql = "SELECT * FROM appointments ORDER BY scheduled_at DESC LIMIT 100";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Formatage des données
            foreach ($appointments as &$appointment) {
                $appointment['specialist_name'] = 'Spécialiste #' . ($appointment['specialist_id'] ?? 'N/A');
                $appointment['price_euros'] = ($appointment['price_cents'] ?? 0) / 100;
                $appointment['date'] = date('d/m/Y', strtotime($appointment['scheduled_at'] ?? 'now'));
                $appointment['time'] = date('H:i', strtotime($appointment['scheduled_at'] ?? 'now'));
                
                // Status en français
                switch ($appointment['status'] ?? 'pending') {
                    case 'scheduled':
                        $appointment['status_french'] = 'Programmé';
                        $appointment['status_color'] = 'blue';
                        break;
                    case 'completed':
                        $appointment['status_french'] = 'Terminé';
                        $appointment['status_color'] = 'green';
                        break;
                    case 'cancelled':
                        $appointment['status_french'] = 'Annulé';
                        $appointment['status_color'] = 'red';
                        break;
                    default:
                        $appointment['status_french'] = 'En attente';
                        $appointment['status_color'] = 'yellow';
                }
            }
            
            echo json_encode([
                'success' => true,
                'data' => $appointments,
                'count' => count($appointments)
            ]);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Ajouter un nouveau rendez-vous
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data || !isset($data['specialist_id']) || !isset($data['scheduled_at'])) {
            throw new Exception('Les champs specialist_id et scheduled_at sont obligatoires');
        }
        
        $sql = "INSERT INTO appointments (user_id, specialist_id, scheduled_at, type, status, price_cents, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['user_id'] ?? null,
            $data['specialist_id'],
            $data['scheduled_at'],
            $data['type'] ?? 'consultation',
            $data['status'] ?? 'confirmed',
            isset($data['price_euros']) ? ($data['price_euros'] * 100) : 0,
            $data['notes'] ?? null
        ]);
        
        $newId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Rendez-vous ajouté avec succès',
            'id' => $newId
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