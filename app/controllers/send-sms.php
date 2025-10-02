<?php
header('Content-Type: application/json');
require __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$data = json_decode(file_get_contents('php://input'), true);

$accessKey = $_ENV['NCP_ACCESS_KEY'];
$secretKey = $_ENV['NCP_SECRET_KEY'];
$serviceId = $_ENV['NCP_SERVICE_ID'];
$from = $_ENV['NCP_FROM_NUMBER'];
$to = $_ENV['NCP_TO_NUMBER'];

$message = "연락처: {$data['phone']}, : {$data['message']}";

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
    "messages" => [
        ["to" => $to]
    ]
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
curl_close($ch);

echo json_encode(["message" => "메시지 전송 완료", "response" => json_decode($response)]);