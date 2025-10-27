<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../bootstrap.php'; 
require __DIR__ . '/../../../vendor/autoload.php'; 

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    $userId = intval($_POST['user_id'] ?? 0);
    $applicationId = intval($_POST['application_id'] ?? 0);
    $companyName = $_POST['companyName'] ?? '견적서';
    $totalAmount = $_POST['total_amount'] ?? null;
    $estimateNumber = $_POST['estimate_number'] ?? '(번호없음)';

    if (!$userId || !$applicationId) throw new Exception('user_id 또는 application_id 누락');
    if (!$totalAmount) throw new Exception('총액(total_amount) 누락');
    if (empty($_FILES['pdf'])) throw new Exception('PDF 파일이 없습니다.');

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id=?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) throw new Exception('유저 정보를 찾을 수 없습니다.');

    // 모두싸인 API 호출
    $apiUrl = 'https://api.modusign.co.kr/documents/request-with-template';
    $apiKey = $_ENV['MODUSIGN_API_KEY'];
    $userEmail = $_ENV['MODUSIGN_USER_EMAIL'];
    $templateId = $_ENV['MODUSIGN_TEMPLATE_ID'];
    $auth = base64_encode("{$userEmail}:{$apiKey}");

    $payload = [
        'templateId' => $templateId,
        'document' => [
            'title' => "{$companyName}_계약서_{$estimateNumber}",
            'participantMappings' => [
                [
                    'role' => '수요자',
                    'name' => $user['name'],
                    'signingMethod' => [
                        'type' => 'EMAIL',
                        'value' => $user['real_email']
                    ],
                    'signingDuration' => 20160,
                    'requesterMessage' => '견적서 확인 후 서명해주세요.'
                ]
            ]
        ]
    ];

    $ch = curl_init($apiUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Basic {$auth}",
            "Content-Type: application/json",
            "Accept: application/json"
        ],
        CURLOPT_POSTFIELDS => json_encode($payload)
    ]);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) throw new Exception("모두싸인 API 호출 실패: {$err}");

    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) throw new Exception("JSON 파싱 실패: ".json_last_error_msg());
    if (empty($data['id'])) throw new Exception("서명 요청 실패: ".print_r($data, true));

    $signRequestId = $data['id'];
    $signLink = $data['redirectUrl'] ?? '#';

    // 이메일 발송
    $mail = new PHPMailer(true);
    $mail->CharSet = 'UTF-8';
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['GMAIL_USERNAME'];
    $mail->Password = $_ENV['GMAIL_PASSWORD'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom($_ENV['GMAIL_USERNAME'], '회사명');
    $mail->addAddress($user['real_email']);
    $mail->isHTML(true);
    $mail->Subject = "[{$companyName}] 견적서 및 서명 요청 안내";
    $mail->Body = "
        안녕하세요, {$user['name']}님.<br><br>
        첨부된 견적서를 확인 후 아래 링크로 전자서명 해주세요.<br>
        <a href='{$signLink}'>전자서명 바로가기</a><br><br>
        감사합니다.
    ";
    $mail->addAttachment($_FILES['pdf']['tmp_name'], "{$companyName}_{$estimateNumber}.pdf");
    $mail->send();

    // DB에 기록
    $stmt = $pdo->prepare("
        INSERT INTO quotes (application_id, sign_request_id, total_amount) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE sign_request_id=?, total_amount=?
    ");
    $stmt->execute([$applicationId, $signRequestId, $totalAmount, $signRequestId, $totalAmount]);

    $stmt = $pdo->prepare("
        UPDATE applications 
        SET status='QUOTED' 
        WHERE id=?
    ");
    $stmt->execute([$applicationId]);

    echo json_encode(['success'=>true, 'sign_link'=>$signLink]);

} catch (Throwable $e) {
    echo json_encode(['success'=>false, 'error'=>$e->getMessage()]);
}
