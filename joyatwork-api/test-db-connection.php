<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $connection = DB::connection();
    $pdo = $connection->getPdo();
    
    // Test query
    $result = DB::select('SELECT 1 as test, DATABASE() as db_name, USER() as db_user');
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful!',
        'connection' => DB::connection()->getName(),
        'database' => $result[0]->db_name ?? 'unknown',
        'user' => $result[0]->db_user ?? 'unknown',
        'host' => config('database.connections.mysql.host'),
        'port' => config('database.connections.mysql.port'),
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'connection' => config('database.default'),
        'host' => config('database.connections.mysql.host') ?? 'not configured',
        'database' => config('database.connections.mysql.database') ?? 'not configured',
    ], JSON_PRETTY_PRINT);
}

