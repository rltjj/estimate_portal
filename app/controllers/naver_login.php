<?php
require_once __DIR__ . '/../../bootstrap.php';
session_start();

$client_id = $_ENV['NAVER_CLIENT_ID'];
$redirect_uri = urlencode($_ENV['NAVER_REDIRECT_URI']);
$state = bin2hex(random_bytes(16));
$_SESSION['naver_state'] = $state;

$naver_auth_url = "https://nid.naver.com/oauth2.0/authorize?"
    . "response_type=code"
    . "&client_id={$client_id}"
    . "&redirect_uri={$redirect_uri}"
    . "&state={$state}"
    . "&scope=profile email";

header('Location: ' . $naver_auth_url);
exit;
