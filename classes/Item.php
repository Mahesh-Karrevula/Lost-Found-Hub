<?php
class Item {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getReportedItems() {
        $stmt = $this->pdo->prepare("SELECT i.*, u.username, r.reported_by FROM items i
                                     JOIN users u ON u.id = i.user_id
                                     JOIN reports r ON r.item_id = i.id
                                     WHERE i.reported = 1");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function deleteItem($itemId) {
        $stmt = $this->pdo->prepare("DELETE FROM items WHERE id = ?");
        return $stmt->execute([$itemId]);
    }
    
    public function markAsResolved($id) {
        try {
            // Check if status column exists
            $stmt = $this->pdo->query("SHOW COLUMNS FROM items LIKE 'status'");
            $statusExists = $stmt->rowCount() > 0;
            
            if ($statusExists) {
                $stmt = $this->pdo->prepare("UPDATE items SET status = 'resolved' WHERE id = ?");
                return $stmt->execute([$id]);
            } else {
                // If status column doesn't exist, add it
                $this->pdo->exec("ALTER TABLE items ADD COLUMN status VARCHAR(20) DEFAULT 'active'");
                $stmt = $this->pdo->prepare("UPDATE items SET status = 'resolved' WHERE id = ?");
                return $stmt->execute([$id]);
            }
        } catch (PDOException $e) {
            error_log("Error marking item as resolved: " . $e->getMessage());
            return false;
        }
    }
    
    public function createItem($title, $description, $type, $location, $userId, $image, $latitude = null, $longitude = null) {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO items (title, description, type, location, user_id, image, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            return $stmt->execute([$title, $description, $type, $location, $userId, $image, $latitude, $longitude]);
        } catch (PDOException $e) {
            error_log("Error creating item: " . $e->getMessage());
            return false;
        }
    }
    
    public function getTotalItems() {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM items");
        $stmt->execute();
        return $stmt->fetchColumn();
    }
    
    public function getTotalReportedItems() {
        $stmt = $this->pdo->prepare("SELECT COUNT(DISTINCT item_id) FROM reports");
        $stmt->execute();
        return $stmt->fetchColumn();
    }
    
    public function searchItems($keyword, $type, $location, $date = '') {
        $sql = "SELECT items.*, users.username FROM items 
                JOIN users ON items.user_id = users.id 
                WHERE (title LIKE ? OR description LIKE ?)";
    
        $params = ["%$keyword%", "%$keyword%"];
    
        if ($type) {
            $sql .= " AND type = ?";
            $params[] = $type;
        }
    
        if ($location) {
            $sql .= " AND location LIKE ?";
            $params[] = "%$location%";
        }

        if ($date) {
            $sql .= " AND DATE(items.created_at) = ?";
            $params[] = $date;
        }
    
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getItemById($id) {
        try {
            $stmt = $this->pdo->prepare("SELECT items.*, users.username FROM items JOIN users ON items.user_id = users.id WHERE items.id = ?");
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting item: " . $e->getMessage());
            return false;
        }
    }
    
    public function getAllItems($type = null) {
        try {
            $sql = "SELECT items.*, users.username FROM items JOIN users ON items.user_id = users.id";
            if ($type) {
                $sql .= " WHERE type = ?";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([$type]);
            } else {
                $stmt = $this->pdo->query($sql);
            }
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting all items: " . $e->getMessage());
            return [];
        }
    }
}
?>
