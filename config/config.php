<?php
session_start();

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    exit('DB 연결 실패: ' . $e->getMessage());
}

// 구글 OAuth 설정
define('GOOGLE_CLIENT_ID', $_ENV['GOOGLE_CLIENT_ID']);
define('GOOGLE_CLIENT_SECRET', $_ENV['GOOGLE_CLIENT_SECRET']);
define('GOOGLE_REDIRECT_URI', $_ENV['GOOGLE_REDIRECT_URI']);

// 네이버 OAuth
define('NAVER_CLIENT_ID', $_ENV['NAVER_CLIENT_ID']);
define('NAVER_CLIENT_SECRET', $_ENV['NAVER_CLIENT_SECRET']);
define('NAVER_REDIRECT_URI', $_ENV['NAVER_REDIRECT_URI']);