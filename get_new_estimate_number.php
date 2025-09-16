<?php
$host = 'localhost';
$db   = 'estimate';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    date_default_timezone_set('Asia/Seoul');

    $today = date('ymd');
    $time  = date('Hi'); 

    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM estimates WHERE DATE(created_at) = CURDATE()");
    $stmt->execute();
    $row = $stmt->fetch();
    $count = $row['cnt'] + 1;

    $number = $today . '_' . $time . '_' . str_pad($count, 2, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("INSERT INTO estimates (estimate_number) VALUES (?)");
    $stmt->execute([$number]);

    echo json_encode(['number' => $number]);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
