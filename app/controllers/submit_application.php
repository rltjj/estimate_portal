<?php
require_once __DIR__ . '/../bootstrap.php';

$data = json_decode(file_get_contents('php://input'), true);

$company_name = $data['company_name'];
$user_name = $data['user_name'];
$phone = $data['phone'];
$real_email = $data['real_email'];
$products = $data['products'];

$user_id = $_SESSION['user_id'] ?? null;

if($user_id){
    $stmt = $pdo->prepare("UPDATE users SET company_name=?, name=?, phone=?, real_email=? WHERE id=?");
    $stmt->execute([$company_name, $user_name, $phone, $real_email, $user_id]);
} else {
    $stmt = $pdo->prepare("INSERT INTO users (company_name, name, phone, real_email) VALUES (?,?,?,?)");
    $stmt->execute([$company_name, $user_name, $phone, $real_email]);
    $user_id = $pdo->lastInsertId();
    $_SESSION['user_id'] = $user_id;
}

$stmt = $pdo->prepare("INSERT INTO applications (user_id, status) VALUES (?, 'REQUESTED')");
$stmt->execute([$user_id]);
$application_id = $pdo->lastInsertId();

foreach($products as $p){
    $stmt = $pdo->prepare("INSERT INTO application_products (application_id, product_id, price) VALUES (?,?,?)");
    $stmt->execute([$application_id, $p['product_id'], $p['price']]);
}

echo json_encode(['success' => true]);
