<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__.'/../bootstrap.php';

$logFile = __DIR__.'/modusign_webhook.log';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

file_put_contents($logFile, "[".date('Y-m-d H:i:s')."] POST DATA:\n" . print_r($data, true) . "\n", FILE_APPEND);

$signRequestId = $data['document']['id'] ?? null;
$eventType = $data['event']['type'] ?? null;

if (!$signRequestId || !$eventType) {
    file_put_contents($logFile, "[".date('Y-m-d H:i:s')."] Missing id or event type\n", FILE_APPEND);
    echo json_encode(['success'=>false, 'error'=>'Missing document id or event type']);
    exit;
}

$statusMap = [
    'document_started' => 'PENDING',
    'document_signed' => 'SIGNED',
    'document_all_signed' => 'COMPLETED',
    'document_rejected' => 'REJECTED',
    'document_request_canceled' => 'CANCELED',
    'document_signing_canceled' => 'CANCELED'
];

$status = $statusMap[$eventType] ?? 'PENDING';

try {
    $stmt = $pdo->prepare("UPDATE quotes SET sign_status=? WHERE sign_request_id=?");
    $stmt->execute([$status, $signRequestId]);
    file_put_contents($logFile, "[".date('Y-m-d H:i:s')."] Updated quotes: rows={$stmt->rowCount()}, status={$status}\n", FILE_APPEND);

    if (in_array($status, ['SIGNED','COMPLETED'])) {
        $pdo->exec("SET SQL_SAFE_UPDATES = 0");
        $stmt = $pdo->prepare("
            UPDATE applications a
            JOIN quotes q ON a.id = q.application_id
            SET a.status='READY'
            WHERE q.sign_request_id=?
        ");
        $stmt->execute([$signRequestId]);
        file_put_contents($logFile, "[".date('Y-m-d H:i:s')."] Updated applications to READY: rows={$stmt->rowCount()}\n", FILE_APPEND);
    }

    echo json_encode(['success'=>true,'message'=>'DB updated if applicable']);

} catch (Exception $e) {
    file_put_contents($logFile, "[".date('Y-m-d H:i:s')."] ERROR: ".$e->getMessage()."\n", FILE_APPEND);
    echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
