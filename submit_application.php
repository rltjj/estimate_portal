<?php
require 'config.php'; // DB 연결, 세션 start

$data = json_decode(file_get_contents('php://input'), true);

$company_name = $data['company_name'];
$user_name = $data['user_name'];
$phone = $data['phone'];
$products = $data['products'];

// 1. users 테이블 업데이트 또는 신규
$user_id = $_SESSION['user_id'] ?? null;

if($user_id){
    $stmt = $pdo->prepare("UPDATE users SET company_name=?, name=?, phone=? WHERE id=?");
    $stmt->execute([$company_name, $user_name, $phone, $user_id]);
} else {
    $stmt = $pdo->prepare("INSERT INTO users (company_name, name, phone) VALUES (?,?,?)");
    $stmt->execute([$company_name, $user_name, $phone]);
    $user_id = $pdo->lastInsertId();
    $_SESSION['user_id'] = $user_id;
}

// 2. applications 테이블
$stmt = $pdo->prepare("INSERT INTO applications (user_id, status) VALUES (?, 'REQUESTED')");
$stmt->execute([$user_id]);
$application_id = $pdo->lastInsertId();

// 3. application_products 테이블
foreach($products as $p){
    $stmt = $pdo->prepare("INSERT INTO application_products (application_id, product_id, price) VALUES (?,?,?)");
    $stmt->execute([$application_id, $p['product_id'], $p['price']]);
}

echo json_encode(['success' => true]);
