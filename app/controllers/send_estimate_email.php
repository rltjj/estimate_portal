<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../bootstrap.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require __DIR__ . '/../../vendor/autoload.php';

try {
    // 파일은 multipart/form-data로 올 것
    if (!isset($_POST['user_id'], $_POST['application_id']) || (empty($_FILES['pdf']) && empty($_FILES['file']))) {
        throw new Exception('잘못된 요청입니다. (필수 파라미터 누락)');
    }

    $userId        = intval($_POST['user_id']);
    $applicationId = intval($_POST['application_id']);

    // estimate_number가 있으면 사용, 없으면 기존 로직(최신값) 사용
    $estimateNo = $_POST['estimate_number'] ?? null;
    if (!$estimateNo) {
        $stmt2 = $pdo->prepare("SELECT estimate_number FROM estimates WHERE id = (SELECT MAX(id) FROM estimates)");
        $stmt2->execute();
        $app = $stmt2->fetch(PDO::FETCH_ASSOC);
        $estimateNo = $app ? $app['estimate_number'] : "estimate_" . $applicationId;
    }

    $stmt = $pdo->prepare("SELECT email, provider, name FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) throw new Exception('해당 유저 없음');

    // 어떤 키로 왔는지 확인
    $fileKey = isset($_FILES['pdf']) ? 'pdf' : 'file';
    if (!isset($_FILES[$fileKey]['tmp_name']) || !is_uploaded_file($_FILES[$fileKey]['tmp_name'])) {
        throw new Exception('첨부 파일이 없습니다.');
    }

    $mail = new PHPMailer(true);
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

    $mail->addAttachment($_FILES[$fileKey]['tmp_name'], $estimateNo . '.pdf');
    $mail->send();

    $stmt3 = $pdo->prepare("UPDATE applications SET status = 'QUOTED' WHERE id = ?");
    $stmt3->execute([$applicationId]);

    echo json_encode(['success' => true, 'filename' => $estimateNo . '.pdf']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
