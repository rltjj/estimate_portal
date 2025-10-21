<?php
file_put_contents(__DIR__ . '/debug_log.txt', print_r($_POST, true) . print_r($_FILES, true));

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../bootstrap.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require __DIR__ . '/../../vendor/autoload.php';

try {
    if (!isset($_POST['user_id'], $_POST['application_id'], $_POST['total_amount']) || empty($_FILES['pdf'])) {
        throw new Exception('잘못된 요청입니다.');
    }

    $userId        = intval($_POST['user_id']);
    $applicationId = intval($_POST['application_id']);
    $totalAmount   = intval($_POST['total_amount']); 
    $companyName   = $_POST['companyName'] ?? '견적서';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) throw new Exception('해당 유저 없음');

    if (empty($user['real_email']) || strpos($user['real_email'], '@example.com') !== false) {
        throw new Exception('실제 이메일이 없어 메일 발송 불가');
    }

    $pdo->beginTransaction();

    $today = date('ymd');
    $time  = date('Hi');
    $stmtCnt = $pdo->prepare("SELECT COUNT(*) as cnt FROM estimates WHERE DATE(created_at) = CURDATE()");
    $stmtCnt->execute();
    $row = $stmtCnt->fetch();
    $count = $row['cnt'] + 1;
    $estimateNo = $today . '_' . $time . '_' . str_pad($count, 2, '0', STR_PAD_LEFT);

    $stmtInsert = $pdo->prepare("INSERT INTO estimates (estimate_number) VALUES (?)");
    $stmtInsert->execute([$estimateNo]);

    $stmtQuote = $pdo->prepare("
        INSERT INTO quotes 
        (application_id, total_amount, sent_email, file_path, sign_request_id, sign_status, created_at)
        VALUES (?, ?, 0, NULL, NULL, 'PENDING', NOW())
    ");
    $stmtQuote->execute([$applicationId, $totalAmount]);
    $quoteId = $pdo->lastInsertId();

    $fileKey  = 'pdf';
    $filename = mb_encode_mimeheader($companyName . '_' . $estimateNo . '.pdf', 'UTF-8', 'B');

    $mail = new PHPMailer(true);
    $mail->CharSet   = 'UTF-8';
    $mail->isSMTP();
    $mail->SMTPAuth  = true;
    $mail->Host      = 'smtp.gmail.com';
    $mail->Username  = $_ENV['GMAIL_USERNAME'];
    $mail->Password  = $_ENV['GMAIL_PASSWORD'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port      = 587;
    $mail->setFrom($_ENV['GMAIL_USERNAME'], '견적서 시스템');

    $mail->addAddress($user['real_email']);
    $mail->isHTML(true);
    $mail->Subject = "견적서 발송 안내 - {$estimateNo}";
    $mail->Body    = "안녕하세요, 주식회사 성진글로벌입니다. <br><br>{$user['name']} 고객님, 요청하신 견적서와 계약서를 첨부파일로 보내드립니다.<br><br>감사합니다.";

    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('첨부파일 업로드 실패');
    }
    $mail->addAttachment($_FILES[$fileKey]['tmp_name'], $filename);

    $contractPath     = __DIR__ . '/contract_template.pdf'; 
    $contractFilename = mb_encode_mimeheader('경영지원서비스계약서.pdf', 'UTF-8', 'B');
    if (file_exists($contractPath)) {
        $mail->addAttachment($contractPath, $contractFilename);
    }

    try {
        $mail->send();
    } catch (Exception $e) {
        throw new Exception("메일 전송 실패: {$mail->ErrorInfo}");
    }

    $pdo->prepare("UPDATE quotes SET sent_email = 1 WHERE id = ?")->execute([$quoteId]);
    $pdo->prepare("UPDATE applications SET status = 'QUOTED' WHERE id = ?")->execute([$applicationId]);

    $pdo->commit();

    echo json_encode([
        'success'     => true,
        'filename'    => $filename,
        'estimate_no' => $estimateNo,
        'quote_id'    => $quoteId
    ]);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
