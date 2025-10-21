<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save'])) {
    if (isset($_POST['id'])) {
        foreach ($_POST['id'] as $index => $id) {
            $name = $_POST['name'][$index];
            $price = $_POST['price'][$index];
            $description = $_POST['description'][$index];

            $sql = "UPDATE products SET name=?, price=?, description=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$name, $price, $description, $id]);
        }
    }

    if (!empty($_POST['new_name'])) {
        $sql = "INSERT INTO products (name, price, description) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$_POST['new_name'], $_POST['new_price'], $_POST['new_description']]);
    }

    header("Location: /productslist");
    exit;
}

if (isset($_GET['delete'])) {
    $sql = "DELETE FROM products WHERE id=?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_GET['delete']]);

    header("Location: /productslist");
    exit;
}
