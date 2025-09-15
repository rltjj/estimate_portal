<?php
header('Content-Type: application/json');
include 'db.php'; 

$stmt = $pdo->query("SELECT id, name FROM products");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($products);
?>
