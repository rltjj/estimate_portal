<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../bootstrap.php';

try {
    $today = date('ymd');
    $time  = date('Hi'); 

    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM estimates WHERE DATE(created_at) = CURDATE()");
    $stmt->execute();
    $row = $stmt->fetch();
    $count = $row['cnt'] + 1;

    $number = $today . '_' . $time . '_' . str_pad($count, 2, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("INSERT INTO estimates (estimate_number) VALUES (?)");
    $stmt->execute([$number]);

    echo json_encode(['number' => $number]);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
