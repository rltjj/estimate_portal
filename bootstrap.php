<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/config.php';


if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

date_default_timezone_set('Asia/Seoul');
