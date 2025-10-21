<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../bootstrap.php';

$page = intval($_GET['page'] ?? 1);
$pageSize = intval($_GET['pageSize'] ?? 10);
$offset = ($page - 1) * $pageSize;

$sort = $_GET['sort'] ?? 'desc'; 
$status = $_GET['status'] ?? '';

try {
    $params = [];
    $sql = "SELECT a.id AS application_id, u.name AS user_name, u.company_name, a.created_at, a.status
            FROM applications a
            JOIN users u ON a.user_id = u.id";

    if ($status) {
        $sql .= " WHERE a.status = :status";
        $params[':status'] = $status;
    }

    $sql .= " ORDER BY a.created_at " . ($sort === 'asc' ? 'ASC' : 'DESC') . " LIMIT :limit OFFSET :offset";

    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

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

    $countSql = "SELECT COUNT(*) FROM applications a JOIN users u ON a.user_id = u.id";
    if ($status) {
        $countSql .= " WHERE a.status = :status";
    }
    $countStmt = $pdo->prepare($countSql);
    if ($status) {
        $countStmt->bindValue(':status', $status);
    }
    $countStmt->execute();
    $totalCount = intval($countStmt->fetchColumn());

    echo json_encode([
        'applications' => $applications,
        'totalCount' => $totalCount
    ]);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
