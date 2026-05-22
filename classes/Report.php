<?php
require_once __DIR__ . '/../config/database.php';

class Report {
    private $db;

    public function __construct() {
        global $pdo;
        $this->db = $pdo;
    }

    /**
     * Create a new report
     * @param int $itemId The ID of the item being reported
     * @param int $userId The ID of the user making the report
     * @param string $reason The reason for the report
     * @return bool Whether the report was created successfully
     */
    public function createReport($itemId, $userId, $reason) {
        $sql = "INSERT INTO reports (item_id, reporter_id, reason, created_at) VALUES (?, ?, ?, NOW())";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$itemId, $userId, $reason]);
    }

    /**
     * Check if a user has already reported an item
     * @param int $itemId The ID of the item
     * @param int $userId The ID of the user
     * @return bool Whether the user has already reported the item
     */
    public function hasUserReported($itemId, $userId) {
        $sql = "SELECT COUNT(*) FROM reports WHERE item_id = ? AND reporter_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$itemId, $userId]);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Get all reports for an item
     * @param int $itemId The ID of the item
     * @return array Array of reports
     */
    public function getItemReports($itemId) {
        $sql = "SELECT r.*, u.username as reporter_name 
                FROM reports r 
                JOIN users u ON r.reporter_id = u.id 
                WHERE r.item_id = ? 
                ORDER BY r.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$itemId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get all reports (for admin)
     * @return array Array of all reports
     */
    public function getAllReports() {
        $sql = "SELECT r.*, u.username as reporter_name, i.title as item_title 
                FROM reports r 
                JOIN users u ON r.reporter_id = u.id 
                JOIN items i ON r.item_id = i.id 
                ORDER BY r.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Delete a report and optionally delete the associated item
     * @param int $reportId The ID of the report to delete
     * @param bool $deleteItem Whether to also delete the associated item
     * @return bool Whether the operation was successful
     */
    public function deleteReport($reportId, $deleteItem = true) {
        try {
            // Start a transaction
            $this->db->beginTransaction();
            
            // Get the item_id before deleting the report
            $stmt = $this->db->prepare("SELECT item_id FROM reports WHERE id = ?");
            $stmt->execute([$reportId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result) {
                $this->db->rollBack();
                return false;
            }
            
            $itemId = $result['item_id'];
            
            // Delete the report
            $stmt = $this->db->prepare("DELETE FROM reports WHERE id = ?");
            $stmt->execute([$reportId]);
            
            // If deleteItem is true, also delete the associated item
            if ($deleteItem) {
                $stmt = $this->db->prepare("DELETE FROM items WHERE id = ?");
                $stmt->execute([$itemId]);
            }
            
            // Commit the transaction
            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            // Roll back the transaction on error
            $this->db->rollBack();
            error_log("Error deleting report: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get the count of reports
     * 
     * @return int Number of reports
     */
    public function getReportCount() {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM reports");
            $stmt->execute();
            return $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("Error getting report count: " . $e->getMessage());
            return 0;
        }
    }
}
?> 