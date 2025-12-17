<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Données de test statiques
$practitioners = [
    [
        'id' => 1,
        'name' => 'Dr. Marie Dupont',
        'email' => 'marie.dupont@email.com',
        'phone' => '01 23 45 67 89',
        'specialty' => 'Médecin généraliste',
        'location' => 'Paris',
        'created_at' => '2024-01-15',
        'updated_at' => '2024-01-15'
    ],
    [
        'id' => 2,
        'name' => 'Dr. Jean Martin',
        'email' => 'jean.martin@email.com',
        'phone' => '01 23 45 67 90',
        'specialty' => 'Psychologue',
        'location' => 'Lyon',
        'created_at' => '2024-01-16',
        'updated_at' => '2024-01-16'
    ],
    [
        'id' => 3,
        'name' => 'Sophie Bernard',
        'email' => 'sophie.bernard@email.com',
        'phone' => '01 23 45 67 91',
        'specialty' => 'Coach bien-être',
        'location' => 'Marseille',
        'created_at' => '2024-01-17',
        'updated_at' => '2024-01-17'
    ]
];

echo json_encode([
    'success' => true,
    'data' => $practitioners,
    'count' => count($practitioners)
]);
?>
