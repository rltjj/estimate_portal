<?php
require_once __DIR__ . '/../bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

$application_id = intval($_GET['application_id'] ?? 0);
if ($application_id <= 0) {
    echo json_encode(['success' => false, 'message' => '유효하지 않은 신청 ID']);
    exit;
}

$stmt = $pdo->prepare("
    SELECT r.id AS requirement_id, r.title, ar.value
    FROM application_requirements ar
    JOIN requirements r ON r.id = ar.requirement_id
    WHERE ar.application_id = ?
");
$stmt->execute([$application_id]);
$requirements = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'success' => true,
    'requirements' => $requirements
]);
