<?php
require_once __DIR__ . '/../bootstrap.php';

if (!isset($_GET['code']) || !isset($_GET['state'])) exit('로그인 실패');

$code = $_GET['code'];
$state = $_GET['state'];

if ($state !== $_SESSION['naver_state']) exit('잘못된 접근');

$client_id = NAVER_CLIENT_ID;
$client_secret = NAVER_CLIENT_SECRET;
$redirect_uri = urlencode(NAVER_REDIRECT_URI);

$token_url = "https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id={$client_id}&client_secret={$client_secret}&code={$code}&state={$state}";
$response = file_get_contents($token_url);
if ($response === FALSE) exit('토큰 요청 실패');

$token_data = json_decode($response, true);
$access_token = $token_data['access_token'];

$opts = [
    "http" => [
        "method" => "GET",
        "header" => "Authorization: Bearer {$access_token}\r\n"
    ]
];
$context = stream_context_create($opts);
$userinfo = file_get_contents("https://openapi.naver.com/v1/nid/me", false, $context);
$userinfo = json_decode($userinfo, true);

if ($userinfo['resultcode'] !== '00') exit('사용자 정보 요청 실패');

$email = $userinfo['response']['email'];
$name = $userinfo['response']['name'] ?? null;
$provider = 'naver';

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, provider) VALUES (?, ?, ?)");
    $stmt->execute([$name, $email, $provider]);
    $user_id = $pdo->lastInsertId();
} else {
    $user_id = $user['id'];
}

$_SESSION['user_id'] = $user_id;
$_SESSION['user_name'] = $name;
$_SESSION['user_email'] = $email;

$_SESSION['user_role'] = $user['role'] ?? 'USER';

if ($_SESSION['user_role'] === 'ADMIN') {
    header('Location: /estimate/app/views/admin.html');
} else {
    header('Location: /estimate/app/views/customer.html');
}
exit;