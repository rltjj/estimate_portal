<?php
session_start();

if (!isset($_SESSION['user_role']) || strtolower($_SESSION['user_role']) !== 'admin') {
    header('HTTP/1.1 403 Forbidden');
    echo "접근 권한이 없습니다.";
    exit;
}

if (!isset($_GET['file']) || empty($_GET['file'])) {
    echo "파일이 지정되지 않았습니다.";
    exit;
}

$requested = basename($_GET['file']);
$allowedFiles = ['admin.html', 'estimate.html', 'productslist.html'];
$filepath = __DIR__ . '/' . $requested;

if (in_array($requested, $allowedFiles) && file_exists($filepath)) {
    readfile($filepath);
    exit;
} else {
    echo "파일이 존재하지 않거나 접근 권한이 없습니다.";
}
