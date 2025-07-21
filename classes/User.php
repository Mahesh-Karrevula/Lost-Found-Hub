<?php
require_once __DIR__ . '/../config/database.php';

class User {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function register($username, $email, $password) {
        try {
            // Validate input
            if (empty($username) || empty($email) || empty($password)) {
                throw new Exception("All fields are required");
            }

            if (strlen($username) < 3) {
                throw new Exception("Username must be at least 3 characters long");
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Invalid email format");
            }

            if (strlen($password) < 6) {
                throw new Exception("Password must be at least 6 characters long");
            }

            // Check if username or email already exists
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            if ($stmt->fetchColumn() > 0) {
                throw new Exception("Username or email already exists");
            }
            
            // Store password as plain text
            $stmt = $this->pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
            if (!$stmt->execute([$username, $email, $password])) {
                throw new Exception("Failed to create user account");
            }
            return true;
        } catch (PDOException $e) {
            error_log("Database error during registration: " . $e->getMessage());
            throw new Exception("Database error during registration");
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function login($username, $password) {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // Check if password matches directly (plain text) or verify hash
                if ($user['password'] === $password || password_verify($password, $user['password'])) {
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['username'] = $user['username'];
                    return true;
                }
            }
            return false;
        } catch (PDOException $e) {
            error_log("Error logging in user: " . $e->getMessage());
            return false;
        }
    }

    public function updateProfile($userId, $username, $email, $password, $newPassword, $profilePicture) {
        try {
            // Keep password as plain text
            $passwordToUse = !empty($newPassword) ? $newPassword : $password;
        
            $stmt = $this->pdo->prepare("UPDATE users SET username = ?, email = ?, password = ?, profile_picture = ? WHERE id = ?");
            return $stmt->execute([$username, $email, $passwordToUse, $profilePicture, $userId]);
        } catch (PDOException $e) {
            error_log("Error updating profile: " . $e->getMessage());
            return false;
        }
    }
    
    public function getTotalUsers() {
        try {
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM users");
            $stmt->execute();
            return $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("Error getting total users: " . $e->getMessage());
            return 0;
        }
    }
    
    public function isLoggedIn() {
        return isset($_SESSION['user_id']);
    }

    public function logout() {
        session_unset();
        session_destroy();
    }

    public function getUserById($id) {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting user: " . $e->getMessage());
            return false;
        }
    }

    public function isAdmin() {
        try {
            $stmt = $this->pdo->prepare("SELECT is_admin FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result && $result['is_admin'] == 1;
        } catch(PDOException $e) {
            error_log("Error checking admin status: " . $e->getMessage());
            return false;
        }
    }
}
?>
