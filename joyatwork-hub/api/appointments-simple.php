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
        // Récupérer tous les rendez-vous sans jointure pour tester
        $sql = "SELECT 
                    id,
                    user_id,
                    specialist_id,
                    scheduled_at,
                    type,
                    status,
                    price_cents,
                    notes
                FROM appointments
                ORDER BY scheduled_at DESC
                LIMIT 10";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatage des données
        foreach ($appointments as &$appointment) {
            $appointment['specialist_name'] = 'Spécialiste #' . $appointment['specialist_id'];
            $appointment['price_euros'] = $appointment['price_cents'] / 100;
            $appointment['formatted_date'] = date('d/m/Y H:i', strtotime($appointment['scheduled_at']));
            $appointment['formatted_time'] = date('H:i', strtotime($appointment['scheduled_at']));
            
            // Status en français
            switch ($appointment['status']) {
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