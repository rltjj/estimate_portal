<?php
require_once __DIR__ . '/../bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');

$data = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'success' => false,
        'message' => 'JSON 디코딩 실패: ' . json_last_error_msg(),
        'raw' => $raw
    ]);
    exit;
}

if (!$data || !isset($data['application_id']) || !isset($data['requirements'])) {
    echo json_encode([
        'success' => false,
        'message' => '잘못된 요청 데이터 구조',
        'raw' => $raw
    ]);
    exit;
}

$application_id = intval($data['application_id']);
$requirements = $data['requirements'];

if ($application_id <= 0) {
    echo json_encode(['success' => false, 'message' => '유효하지 않은 신청 ID']);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO application_requirements (application_id, requirement_id, value)
        VALUES (:application_id, :requirement_id, :value)
    ");
    if (!$stmt) {
        throw new Exception("Prepared statement 생성 실패");
    }

    foreach ($requirements as $req) {
        $requirement_id = intval($req['requirement_id']);
        $value = isset($req['value']) ? trim($req['value']) : null;

        if ($requirement_id <= 0) continue;

        if ($value === '' || $value === null) continue;

        $stmt->execute([
            ':application_id' => $application_id,
            ':requirement_id' => $requirement_id,
            ':value' => $value
        ]);
    }

    $pdo->commit();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        'success' => false,
        'message' => 'DB 오류: ' . $e->getMessage()
    ]);
}
