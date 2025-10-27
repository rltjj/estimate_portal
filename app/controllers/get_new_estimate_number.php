<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../bootstrap.php';

try {
    $applicationId = intval($_GET['application_id'] ?? 0);
    if (!$applicationId) throw new Exception('application_id 누락');

    $today = date('ymd');
    $time = date('Hi');

    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM estimates WHERE DATE(created_at) = CURDATE()");
    $stmt->execute();
    $row = $stmt->fetch();
    $count = $row['cnt'] + 1;

    $number = "{$today}_{$time}_" . str_pad($count, 2, '0', STR_PAD_LEFT);

    $stmtChk = $pdo->prepare("SELECT id FROM estimates WHERE application_id = ?");
    $stmtChk->execute([$applicationId]);
    if ($stmtChk->fetch()) {
        $stmt = $pdo->prepare("UPDATE estimates SET estimate_number = ?, created_at = NOW() WHERE application_id = ?");
        $stmt->execute([$number, $applicationId]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO estimates (application_id, estimate_number) VALUES (?, ?)");
        $stmt->execute([$applicationId, $number]);
    }

    echo json_encode(['success' => true, 'number' => $number]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
