<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../bootstrap.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require __DIR__ . '/../../vendor/autoload.php';

try {
    if (!isset($_POST['user_id'], $_POST['application_id']) || empty($_FILES['pdf'])) {
        throw new Exception('잘못된 요청입니다.');
    }

    $userId = intval($_POST['user_id']);
    $applicationId = intval($_POST['application_id']);
    $companyName = $_POST['companyName'] ?? '견적서';

    // 사용자 조회
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) throw new Exception('해당 유저 없음');

    // --- 견적번호 생성 (PDF 다운로드 방식과 동일) ---
    $today = date('ymd');
    $time  = date('Hi');

    $stmtCnt = $pdo->prepare("SELECT COUNT(*) as cnt FROM estimates WHERE DATE(created_at) = CURDATE()");
    $stmtCnt->execute();
    $row = $stmtCnt->fetch();
    $count = $row['cnt'] + 1;

    $estimateNo = $today . '_' . $time . '_' . str_pad($count, 2, '0', STR_PAD_LEFT);

    $stmtInsert = $pdo->prepare("INSERT INTO estimates (estimate_number) VALUES (?)");
    $stmtInsert->execute([$estimateNo]);

    // PDF 파일 이름
    $fileKey = 'pdf';
    $filename = mb_encode_mimeheader($companyName . '_' . $estimateNo . '.pdf', 'UTF-8', 'B');

    // --- 메일 발송 ---
    $mail = new PHPMailer(true);
    $mail->CharSet = 'UTF-8';
    $mail->isSMTP();
    $mail->SMTPAuth = true;

    $provider = strtolower($user['provider']);
    if ($provider === 'google') {
        $mail->Host       = 'smtp.gmail.com';
        $mail->Username   = 'globalsungjin@gmail.com';
        $mail->Password   = 'dtos xcds fuyo euhj';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->setFrom('globalsungjin@gmail.com', '견적서 시스템');
    } elseif ($provider === 'naver') {
        $mail->Host       = 'smtp.naver.com';
        $mail->Username   = '네이버메일계정';
        $mail->Password   = '네이버앱비밀번호';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->setFrom('네이버메일계정', '견적서 시스템');
    } else {
        throw new Exception('지원하지 않는 메일 제공자');
    }

    $mail->addAddress($user['email']);
    $mail->isHTML(true);
    $mail->Subject = "견적서 발송 안내 - {$estimateNo}";
    $mail->Body    = "안녕하세요, {$user['name']} 고객님.<br><br>요청하신 견적서를 첨부파일로 보내드립니다.<br><br>감사합니다.";
    $mail->addAttachment($_FILES[$fileKey]['tmp_name'], $filename);
    $mail->send();

    // applications 상태 업데이트
    $stmt3 = $pdo->prepare("UPDATE applications SET status = 'QUOTED' WHERE id = ?");
    $stmt3->execute([$applicationId]);

    echo json_encode([
        'success' => true,
        'filename' => $filename,
        'estimate_no' => $estimateNo
    ]);

} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
