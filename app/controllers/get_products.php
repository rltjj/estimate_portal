<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../bootstrap.php';

$stmt = $pdo->query("SELECT * FROM products");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($products);
?>
