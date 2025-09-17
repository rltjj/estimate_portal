<?php
session_start();

$client_id = 'd9YL970vJItrZKDjtVDY';
$redirect_uri = urlencode('http://localhost/estimate/naver_callback.php');
$state = bin2hex(random_bytes(16));
$_SESSION['naver_state'] = $state;

$naver_auth_url = "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id={$client_id}&redirect_uri={$redirect_uri}&state={$state}";

header('Location: ' . $naver_auth_url);
exit;
