<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../bootstrap.php';

try {
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

    $message = "연락처: {$data['phone']}\n메시지: {$data['message']}";

    $msgBytes = strlen(iconv('UTF-8', 'EUC-KR//IGNORE', $message));
    $type = ($msgBytes > 90) ? "LMS" : "SMS";

    $url = "https://sens.apigw.ntruss.com/sms/v2/services/{$serviceId}/messages";
    $uri = "/sms/v2/services/{$serviceId}/messages";
    $timestamp = (string) round(microtime(true) * 1000);

    $signature = base64_encode(
        hash_hmac(
            'sha256',
            "POST {$uri}\n{$timestamp}\n{$accessKey}",
            $secretKey,
            true
        )
    );

    $body = [
        "type" => $type,
        "contentType" => "COMM",
        "countryCode" => "82",
        "from" => $from,
        "subject" => ($type === "LMS") ? "상담신청" : null,
        "content" => $message,
        "messages" => [["to" => $to]]
    ];

    $body = array_filter($body, fn($v) => !is_null($v));

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json; charset=utf-8",
            "x-ncp-apigw-timestamp: $timestamp",
            "x-ncp-iam-access-key: $accessKey",
            "x-ncp-apigw-signature-v2: $signature"
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);

    $response = curl_exec($ch);
    $curlErr = curl_error($ch);
    curl_close($ch);

    $logFile = __DIR__ . '/../../logs/sms_log.txt';

    if ($curlErr) {
        file_put_contents($logFile, date('[Y-m-d H:i:s] ') . "CURL Error: $curlErr\n", FILE_APPEND);
        echo json_encode(["message" => "SMS 전송 실패 (네트워크 오류)"]);
        exit;
    }

    $respDecoded = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        file_put_contents($logFile, date('[Y-m-d H:i:s] ') . "응답 파싱 실패: $response\n", FILE_APPEND);
        echo json_encode(["message" => "SMS 응답 파싱 실패"]);
        exit;
    }

    if (($respDecoded['statusCode'] ?? '') === '202') {
        file_put_contents($logFile, date('[Y-m-d H:i:s] ') . "전송 성공: {$data['phone']} / {$type}\n", FILE_APPEND);
        echo json_encode(["message" => "메시지 전송 완료"]);
    } else {
        $errorMsg = $respDecoded['statusName'] ?? '전송 실패';
        file_put_contents($logFile, date('[Y-m-d H:i:s] ') . "전송 실패: {$data['phone']} / {$errorMsg}\n", FILE_APPEND);
        echo json_encode(["message" => "전송 실패: {$errorMsg}"]);
    }

} catch (Exception $e) {
    $logFile = __DIR__ . '/../../logs/sms_log.txt';
    file_put_contents($logFile, date('[Y-m-d H:i:s] ') . "예외: {$e->getMessage()}\n", FILE_APPEND);
    echo json_encode(["message" => "예외 발생", "error" => $e->getMessage()]);
}
