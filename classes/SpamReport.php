<?php
require_once __DIR__ . '/../config/database.php';

class SpamReport {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Submit a new spam report
     * 
     * @param int $userId The ID of the user submitting the report
     * @param int $postId The ID of the post being reported
     * @param string $reason The reason for reporting
     * @return bool Whether the report was successfully submitted
     */
    public function submitReport($userId, $postId, $reason) {
        try {
            // Check if user has already reported this post
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM spam_reports WHERE user_id = ? AND post_id = ?");
            $stmt->execute([$userId, $postId]);
            if ($stmt->fetchColumn() > 0) {
                return false; // User has already reported this post
            }
            
            // Submit the report
            $stmt = $this->pdo->prepare("INSERT INTO spam_reports (user_id, post_id, reason) VALUES (?, ?, ?)");
            return $stmt->execute([$userId, $postId, $reason]);
        } catch (PDOException $e) {
            error_log("Error submitting spam report: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all spam reports
     * 
     * @param string $status Filter by status (optional)
     * @return array Array of spam reports
     */
    public function getAllReports($status = null) {
        try {
            if ($status) {
                $stmt = $this->pdo->prepare("
                    SELECT sr.*, u.username as reporter_name, p.title as post_title 
                    FROM spam_reports sr
                    JOIN users u ON sr.user_id = u.id
                    JOIN posts p ON sr.post_id = p.id
                    WHERE sr.status = ?
                    ORDER BY sr.created_at DESC
                ");
                $stmt->execute([$status]);
            } else {
                $stmt = $this->pdo->prepare("
                    SELECT sr.*, u.username as reporter_name, p.title as post_title 
                    FROM spam_reports sr
                    JOIN users u ON sr.user_id = u.id
                    JOIN posts p ON sr.post_id = p.id
                    ORDER BY sr.created_at DESC
                ");
                $stmt->execute();
            }
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting spam reports: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Update the status of a spam report
     * 
     * @param int $reportId The ID of the report to update
     * @param string $status The new status
     * @return bool Whether the update was successful
     */
    public function updateStatus($reportId, $status) {
        try {
            $stmt = $this->pdo->prepare("UPDATE spam_reports SET status = ? WHERE id = ?");
            return $stmt->execute([$status, $reportId]);
        } catch (PDOException $e) {
            error_log("Error updating spam report status: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get the count of spam reports by status
     * 
     * @return array Array with counts by status
     */
    public function getReportCounts() {
        try {
            $stmt = $this->pdo->prepare("
                SELECT status, COUNT(*) as count 
                FROM spam_reports 
                GROUP BY status
            ");
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $counts = [
                'pending' => 0,
                'reviewed' => 0,
                'resolved' => 0,
                'dismissed' => 0
            ];
            
            foreach ($results as $row) {
                $counts[$row['status']] = $row['count'];
            }
            
            return $counts;
        } catch (PDOException $e) {
            error_log("Error getting spam report counts: " . $e->getMessage());
            return [
                'pending' => 0,
                'reviewed' => 0,
                'resolved' => 0,
                'dismissed' => 0
            ];
        }
    }
}
?> 