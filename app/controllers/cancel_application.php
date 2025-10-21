<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../bootstrap.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $appId = intval($data['id'] ?? 0);
    $userId = $_SESSION['user_id'] ?? null;

    if (!$appId || !$userId) {
        throw new Exception('잘못된 요청입니다.');
    }

    $stmt = $pdo->prepare("SELECT status FROM applications WHERE id = ? AND user_id = ?");
    $stmt->execute([$appId, $userId]);
    $app = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$app) {
        throw new Exception('해당 신청이 존재하지 않습니다.');
    }

    if ($app['status'] !== 'REQUESTED') {
        throw new Exception('이미 처리 중인 신청은 취소할 수 없습니다.');
    }

    $pdo->beginTransaction();

    $pdo->prepare("DELETE FROM application_products WHERE application_id = ?")->execute([$appId]);
    $pdo->prepare("DELETE FROM applications WHERE id = ?")->execute([$appId]);

    $pdo->commit();

    echo json_encode(['success' => true]);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
