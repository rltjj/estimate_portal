<?php
header('Content-Type: application/json');
include 'db.php'; // DB 연결 파일

$stmt = $pdo->query("SELECT id, name FROM products");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($products);
?>
