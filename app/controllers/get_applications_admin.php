<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../bootstrap.php';

try {
    $stmt = $pdo->query("
        SELECT 
            a.id AS application_id,
            u.name AS user_name,
            u.company_name,
            a.created_at,
            a.status
        FROM applications a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
    ");

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $applications = [];
    foreach ($rows as $row) {
        $applications[] = [
            "id" => $row["application_id"],
            "userName" => $row["user_name"],
            "company" => $row["company_name"],
            "date" => $row["created_at"],
            "state" => $row["status"]
        ];
    }

    echo json_encode($applications);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
