<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../bootstrap.php';

$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => '로그인이 필요합니다.']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);

    session_destroy(); 
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
