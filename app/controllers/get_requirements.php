<?php
require_once __DIR__ . '/../bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

$stmt = $pdo->query("SELECT id, title, content, input_type FROM requirements ORDER BY id ASC");
$requirements = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($requirements, JSON_UNESCAPED_UNICODE);
?>
