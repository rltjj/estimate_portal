<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../bootstrap.php';

if (!isset($_GET['id'])) {
    echo json_encode(['error' => 'ID가 없습니다.']);
    exit;
}

$appId = intval($_GET['id']);

try {
    $stmt = $pdo->prepare("
        SELECT a.id AS id, a.user_id AS user_id, u.name AS user_name, u.company_name, u.phone, u.email, a.status
        FROM applications a
        JOIN users u ON a.user_id = u.id
        WHERE a.id = :id
    ");
    $stmt->execute(['id' => $appId]);
    $application = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt2 = $pdo->prepare("
        SELECT ap.product_id, p.name, ap.quantity, ap.price
        FROM application_products ap
        JOIN products p ON ap.product_id = p.id
        WHERE ap.application_id = :id
    ");
    $stmt2->execute(['id' => $appId]);
    $products = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'application' => $application,
        'products' => $products
    ]);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
