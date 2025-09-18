<?php
require_once __DIR__ . '/../bootstrap.php';

if (!isset($_GET['code'])) {
    exit('코드 없음');
}

$code = $_GET['code'];

$token_url = "https://oauth2.googleapis.com/token";
$data = [
    'code' => $code,
    'client_id' => GOOGLE_CLIENT_ID,
    'client_secret' => GOOGLE_CLIENT_SECRET,
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'grant_type' => 'authorization_code'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data)
    ]
];

$context  = stream_context_create($options);
$response = file_get_contents($token_url, false, $context);
if ($response === FALSE) {
    exit('토큰 요청 실패');
}

$token = json_decode($response, true);
$access_token = $token['access_token'];

$userinfo = file_get_contents("https://www.googleapis.com/oauth2/v2/userinfo?access_token={$access_token}");
$userinfo = json_decode($userinfo, true);

$email = $userinfo['email'];
$name = $userinfo['name'] ?? null;
$provider = 'google';

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
