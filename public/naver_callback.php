<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../bootstrap.php';

if (!isset($_GET['code'], $_GET['state'])) {
    exit('로그인 실패: 코드 또는 상태값 없음');
}

$code = $_GET['code'];
$state = $_GET['state'];

if ($state !== ($_SESSION['naver_state'] ?? '')) {
    exit('잘못된 접근: 상태값 불일치');
}

$client_id = NAVER_CLIENT_ID;
$client_secret = NAVER_CLIENT_SECRET;
$redirect_uri = NAVER_REDIRECT_URI;

$token_url = "https://nid.naver.com/oauth2.0/token?"
    . "grant_type=authorization_code"
    . "&client_id={$client_id}"
    . "&client_secret={$client_secret}"
    . "&code={$code}"
    . "&state={$state}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $token_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
if (curl_errno($ch)) {
    exit('토큰 요청 실패: ' . curl_error($ch));
}
curl_close($ch);

$token_data = json_decode($response, true);
$access_token = $token_data['access_token'] ?? null;
if (!$access_token) {
    exit('토큰 수신 실패');
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://openapi.naver.com/v1/nid/me");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$access_token}"]);
$userinfo_response = curl_exec($ch);
if (curl_errno($ch)) {
    exit('사용자 정보 요청 실패: ' . curl_error($ch));
}
curl_close($ch);

$userinfo = json_decode($userinfo_response, true);
if (($userinfo['resultcode'] ?? '') !== '00') {
    exit('사용자 정보 요청 실패: ' . ($userinfo['message'] ?? ''));
}

$email = $userinfo['response']['email'] ?? null;
$name = $userinfo['response']['name'] ?? '이름없음';
$provider = 'naver';

if (!$email) {
    $naver_id = $userinfo['response']['id'] ?? bin2hex(random_bytes(8));
    $email = "naver_{$naver_id}@example.com";
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
