<?php
class Message {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getConversations($userId) {
        $stmt = $this->pdo->prepare("
            SELECT 
                c.id,
                c.updated_at as created_at,
                CASE 
                    WHEN c.user1_id = ? THEN c.user2_id
                    ELSE c.user1_id
                END as other_user_id,
                u.username,
                c.last_message,
                c.updated_at as last_message_time
            FROM conversations c
            JOIN users u ON (
                CASE 
                    WHEN c.user1_id = ? THEN c.user2_id
                    ELSE c.user1_id
                END = u.id
            )
            WHERE c.user1_id = ? OR c.user2_id = ?
            ORDER BY c.updated_at DESC
        ");
        $stmt->execute([$userId, $userId, $userId, $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getConversation($conversationId) {
        $stmt = $this->pdo->prepare("
            SELECT 
                c.id,
                c.updated_at as created_at,
                CASE 
                    WHEN c.user1_id = ? THEN c.user2_id
                    ELSE c.user1_id
                END as other_user_id,
                u.username
            FROM conversations c
            JOIN users u ON (
                CASE 
                    WHEN c.user1_id = ? THEN c.user2_id
                    ELSE c.user1_id
                END = u.id
            )
            WHERE c.id = ?
            LIMIT 1
        ");
        $stmt->execute([$_SESSION['user_id'], $_SESSION['user_id'], $conversationId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getMessages($conversationId) {
        $stmt = $this->pdo->prepare("
            SELECT 
                m.id,
                m.message as content,
                m.sent_at,
                m.sender_id,
                u.username
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.sent_at ASC
        ");
        $stmt->execute([$conversationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function sendMessage($conversationId, $senderId, $content) {
        try {
            $this->pdo->beginTransaction();
            
            // Get the receiver ID
            $stmt = $this->pdo->prepare("
                SELECT 
                    CASE 
                        WHEN user1_id = ? THEN user2_id
                        ELSE user1_id
                    END as receiver_id
                FROM conversations
                WHERE id = ?
            ");
            $stmt->execute([$senderId, $conversationId]);
            $receiverId = $stmt->fetchColumn();
            
            // Insert the message
            $stmt = $this->pdo->prepare("
                INSERT INTO messages (conversation_id, sender_id, receiver_id, message, sent_at)
                VALUES (?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$conversationId, $senderId, $receiverId, $content]);
            
            // Update the conversation's last message and updated_at
            $stmt = $this->pdo->prepare("
                UPDATE conversations
                SET last_message = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$content, $conversationId]);
            
            $this->pdo->commit();
            return true;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return false;
        }
    }

    public function createConversation($userId1, $userId2) {
        try {
            $this->pdo->beginTransaction();

            // Check if conversation already exists
            $stmt = $this->pdo->prepare("
                SELECT id FROM conversations 
                WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
                LIMIT 1
            ");
            $stmt->execute([$userId1, $userId2, $userId2, $userId1]);
            $existingId = $stmt->fetchColumn();
            
            if ($existingId) {
                $this->pdo->commit();
                return $existingId;
            }

            // Create new conversation
            $stmt = $this->pdo->prepare("
                INSERT INTO conversations (user1_id, user2_id, updated_at)
                VALUES (?, ?, NOW())
            ");
            $stmt->execute([$userId1, $userId2]);
            $conversationId = $this->pdo->lastInsertId();

            $this->pdo->commit();
            return $conversationId;
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return false;
        }
    }

    public function isUserInConversation($conversationId, $userId) {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) 
            FROM conversations 
            WHERE id = ? AND (user1_id = ? OR user2_id = ?)
        ");
        $stmt->execute([$conversationId, $userId, $userId]);
        return (bool)$stmt->fetchColumn();
    }

    public function getOrCreateConversation($userId1, $userId2) {
        // Check if conversation already exists
        $stmt = $this->pdo->prepare("
            SELECT id FROM conversations 
            WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
            LIMIT 1
        ");
        $stmt->execute([$userId1, $userId2, $userId2, $userId1]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            return $result['id'];
        }

        // Create new conversation if none exists
        return $this->createConversation($userId1, $userId2);
    }
}
?>
