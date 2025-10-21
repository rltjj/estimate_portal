<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../app/bootstrap.php';

if (!isset($_GET['code'])) {
    exit('로그인 실패: code 없음');
}

$code = $_GET['code'];

$client_id = GOOGLE_CLIENT_ID;
$client_secret = GOOGLE_CLIENT_SECRET;
$redirect_uri = GOOGLE_REDIRECT_URI;

$token_url = "https://oauth2.googleapis.com/token";
$data = [
    'code' => $code,
    'client_id' => $client_id,
    'client_secret' => $client_secret,
    'redirect_uri' => $redirect_uri,
    'grant_type' => 'authorization_code'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $token_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    exit('토큰 요청 실패: ' . curl_error($ch));
}
curl_close($ch);

$token_data = json_decode($response, true);

$access_token = $token_data['access_token'] ?? null;
if (!$access_token) {
    $error_desc = $token_data['error_description'] ?? '토큰 수신 실패';
    exit("액세스 토큰 수신 실패: {$error_desc}");
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://www.googleapis.com/oauth2/v2/userinfo");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$access_token}"]);
$userinfo_response = curl_exec($ch);

if (curl_errno($ch)) {
    exit('사용자 정보 요청 실패: ' . curl_error($ch));
}
curl_close($ch);

$userinfo = json_decode($userinfo_response, true);

$email = $userinfo['email'] ?? null;
$name = $userinfo['name'] ?? '이름없음';
$provider = 'google';

if (!$email) {
    $google_id = $userinfo['id'] ?? bin2hex(random_bytes(8));
    $email = "google_{$google_id}@example.com";
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, provider, role) VALUES (?, ?, ?, 'USER')");
    $stmt->execute([$name, $email, $provider]);
    $user_id = $pdo->lastInsertId();
    $role = 'USER';
} else {
    $user_id = $user['id'];
    $role = $user['role'] ?? 'USER';
}

$_SESSION['user_id'] = $user_id;
$_SESSION['user_name'] = $name;
$_SESSION['user_email'] = $email;
$_SESSION['user_role'] = $role;

header('Location: ' . ($role === 'ADMIN' ? '/admin' : '/customer'));
exit;
