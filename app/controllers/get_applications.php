<?php
session_start();
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../bootstrap.php';

if(!isset($_SESSION['user_id'])){
    echo json_encode([]);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("
        SELECT a.id, a.status, a.created_at, GROUP_CONCAT(p.name SEPARATOR ', ') as products
        FROM applications a
        LEFT JOIN application_products ap ON a.id = ap.application_id
        LEFT JOIN products p ON ap.product_id = p.id
        WHERE a.user_id = ?
        GROUP BY a.id
    ");
    $stmt->execute([$user_id]);
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($applications);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
