<?php
session_start();

$host = 'localhost';
$db   = 'estimate';
$user = 'root';
$pass = ''; 
$charset = 'utf8mb4';

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
define('GOOGLE_CLIENT_ID', '1005285406572-l23vogs0dgjq1hc9ffst388su6t3304a.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', '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');
define('GOOGLE_REDIRECT_URI', 'http://localhost/estimate/public/callback.php');

// 네이버 OAuth 설정
define('NAVER_CLIENT_ID', 'd9YL970vJItrZKDjtVDY');
define('NAVER_CLIENT_SECRET', 'U5S3fScQPw');
define('NAVER_REDIRECT_URI', 'http://localhost/estimate/public/callback_naver.php');
