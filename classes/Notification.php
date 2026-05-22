<?php
class Notification {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Create a new notification for a user
    public function createNotification($userId, $message, $type) {
        $stmt = $this->pdo->prepare("INSERT INTO notifications (user_id, message, type, read_at) VALUES (?, ?, ?, NULL)");
        return $stmt->execute([$userId, $message, $type]);
    }

    // Get all unread notifications for a user
    public function getUnreadNotifications($userId) {
        try {
            // Check if read_at column exists
            $stmt = $this->pdo->query("SHOW COLUMNS FROM notifications LIKE 'read_at'");
            $readAtExists = $stmt->rowCount() > 0;
            
            if ($readAtExists) {
                $stmt = $this->pdo->prepare("SELECT * FROM notifications WHERE user_id = ? AND read_at IS NULL ORDER BY created_at DESC");
            } else {
                // If read_at column doesn't exist, return all notifications
                $stmt = $this->pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
            }
            
            $stmt->execute([$userId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting unread notifications: " . $e->getMessage());
            return [];
        }
    }

    // Mark a notification as read
    public function markAsRead($notificationId) {
        try {
            // Check if read_at column exists
            $stmt = $this->pdo->query("SHOW COLUMNS FROM notifications LIKE 'read_at'");
            $readAtExists = $stmt->rowCount() > 0;
            
            if ($readAtExists) {
                $stmt = $this->pdo->prepare("UPDATE notifications SET read_at = NOW() WHERE id = ?");
                return $stmt->execute([$notificationId]);
            } else {
                // If read_at column doesn't exist, return true (nothing to update)
                return true;
            }
        } catch (PDOException $e) {
            error_log("Error marking notification as read: " . $e->getMessage());
            return false;
        }
    }

    // Get all notifications (for admin, or user profile view)
    public function getAllNotifications($userId) {
        $stmt = $this->pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Delete a notification (if needed, like spam reports)
    public function deleteNotification($notificationId) {
        $stmt = $this->pdo->prepare("DELETE FROM notifications WHERE id = ?");
        return $stmt->execute([$notificationId]);
    }
}
?>
