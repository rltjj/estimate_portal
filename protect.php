<?php
session_start();

if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'ADMIN') {
    header('HTTP/1.1 403 Forbidden');
    echo "접근 권한이 없습니다.";
    exit;
}

$requested = basename($_SERVER['REQUEST_URI']);
readfile($requested);
