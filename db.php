<?php
$host = 'localhost';
$db   = 'estimate';
$user = 'root';       // DB 사용자
$pass = '';   // DB 비밀번호
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    echo 'DB 연결 실패: ' . $e->getMessage();
    exit;
}
?>
