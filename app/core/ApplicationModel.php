<?php
class ApplicationModel {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance();
    }

    public function getApplications(?int $userId = null): array {
        if ($userId) {
            $stmt = $this->pdo->prepare("
                SELECT a.id, a.status, a.created_at, GROUP_CONCAT(p.name SEPARATOR ', ') as products
                FROM applications a
                LEFT JOIN application_products ap ON a.id = ap.application_id
                LEFT JOIN products p ON ap.product_id = p.id
                WHERE a.user_id = ?
                GROUP BY a.id
                ORDER BY a.created_at DESC
            ");
            $stmt->execute([$userId]);
        } else {
            $stmt = $this->pdo->query("
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
        }

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
