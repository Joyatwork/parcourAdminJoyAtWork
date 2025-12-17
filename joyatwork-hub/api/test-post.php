<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit();
}

try {
    $json = file_get_contents('php://input');
    echo json_encode([
        'success' => true,
        'received_data' => $json,
        'parsed_data' => json_decode($json, true),
        'json_error' => json_last_error_msg(),
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'Not set',
        'method' => $_SERVER['REQUEST_METHOD']
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>