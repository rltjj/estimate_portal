<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0); 
error_reporting(E_ALL);

require __DIR__ . '/../../vendor/autoload.php';

try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
    $dotenv->load();

    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || empty($data['phone']) || empty($data['message'])) {
        echo json_encode(["message" => "연락처와 메시지를 모두 입력해주세요."]);
        exit;
    }

    $accessKey = $_ENV['NCP_ACCESS_KEY'] ?? '';
    $secretKey = $_ENV['NCP_SECRET_KEY'] ?? '';
    $serviceId = $_ENV['NCP_SERVICE_ID'] ?? '';
    $from = $_ENV['NCP_FROM_NUMBER'] ?? '';
    $to = $_ENV['NCP_TO_NUMBER'] ?? '';

    if (!$accessKey || !$secretKey || !$serviceId || !$from || !$to) {
        echo json_encode(["message" => "SMS 환경설정이 올바르지 않습니다."]);
        exit;
    }

    $message = "연락처: {$data['phone']}, 메시지: {$data['message']}";

    $url = "https://sens.apigw.ntruss.com/sms/v2/services/{$serviceId}/messages";
    $timestamp = (string) round(microtime(true) * 1000);

    $method = "POST";
    $uri = "/sms/v2/services/{$serviceId}/messages";
    $secretKeyBytes = hash_hmac('sha256', $method . " " . $uri . "\n" . $timestamp . "\n" . $accessKey, $secretKey, true);
    $signature = base64_encode($secretKeyBytes);

    $body = [
        "type" => "SMS",
        "contentType" => "COMM",
        "countryCode" => "82",
        "from" => $from,
        "content" => $message,
        "messages" => [["to" => $to]]
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json; charset=utf-8",
        "x-ncp-apigw-timestamp: $timestamp",
        "x-ncp-iam-access-key: $accessKey",
        "x-ncp-apigw-signature-v2: $signature"
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        echo json_encode(["message" => "SMS 전송 실패", "error" => $curlErr]);
    } else {
        $respDecoded = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(["message" => "SMS 응답 파싱 실패", "response" => $response]);
        } else {
            echo json_encode(["message" => "메시지 전송 완료", "response" => $respDecoded]);
        }
    }

} catch (Exception $e) {
    echo json_encode(["message" => "예외 발생", "error" => $e->getMessage()]);
}
