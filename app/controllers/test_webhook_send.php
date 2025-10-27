<?php
$url = 'https://xn--289am1a813bwieviy6bn4kj1r.com/app/controllers/modusign_webhook.php';

$data = [
    'signRequestId' => 'TEST123',
    'status' => 'SIGNED'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    echo "cURL Error: $err";
} else {
    echo "서버 응답: $response";
}
