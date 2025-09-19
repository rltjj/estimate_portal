<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../bootstrap.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require __DIR__ . '/../../vendor/autoload.php';

try {
    if (!isset($_POST['user_id'], $_POST['application_id'], $_FILES['pdf'])) {
        throw new Exception('잘못된 요청입니다.');
    }

    $userId = intval($_POST['user_id']);
    $applicationId = intval($_POST['application_id']);

    $stmt = $pdo->prepare("SELECT email, provider, name FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) throw new Exception('해당 유저 없음');

    $stmt2 = $pdo->prepare("SELECT estimate_number FROM estimates WHERE id = (SELECT MAX(id) FROM estimates)");
    $stmt2->execute();
    $app = $stmt2->fetch(PDO::FETCH_ASSOC);
    $estimateNo = $app ? $app['estimate_number'] : "estimate_" . $applicationId;

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->SMTPAuth = true;

    $provider = strtolower($user['provider']);
    if ($provider === 'google') {
        $mail->Host       = 'smtp.gmail.com';
        $mail->Username   = 'globalsungjin@gmail.com';
        $mail->Password   = 'mnhx iycw fxnv yyuz';
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

    $mail->addAttachment($_FILES['pdf']['tmp_name'], $estimateNo . '.pdf');
    $mail->send();

    echo json_encode(['success' => true, 'filename' => $estimateNo . '.pdf']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
