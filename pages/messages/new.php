<?php
session_start();

define('ROOT_PATH', dirname(dirname(__DIR__)));
define('BASE_URL', '/lost_found_hub');

require_once ROOT_PATH . '/config/database.php';
require_once ROOT_PATH . '/classes/User.php';
require_once ROOT_PATH . '/classes/Message.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/login.php');
    exit();
}

$user = new User($pdo);
$message = new Message($pdo);

// Get all users except the current user
$stmt = $pdo->prepare("SELECT id, username FROM users WHERE id != ? ORDER BY username");
$stmt->execute([$_SESSION['user_id']]);
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get the target user ID from URL if provided
$targetUserId = isset($_GET['to']) ? (int)$_GET['to'] : null;

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['user_id'])) {
    $otherUserId = $_POST['user_id'];
    
    // Get or create conversation
    $conversationId = $message->getOrCreateConversation($_SESSION['user_id'], $otherUserId);
    
    if ($conversationId) {
        // Redirect to the chat page
        header('Location: ' . BASE_URL . '/pages/messages/chat.php?id=' . $conversationId);
        exit();
    } else {
        $error = "Failed to create conversation.";
    }
}

include ROOT_PATH . '/includes/header.php';
include ROOT_PATH . '/includes/navigation.php';
?>

<div class="container mt-4">
    <div class="row">
        <div class="col-md-6 mx-auto">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h2 class="mb-0">New Conversation</h2>
                    <a href="<?php echo BASE_URL; ?>/pages/messages/inbox.php" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left"></i> Back to Inbox
                    </a>
                </div>
                <div class="card-body">
                    <?php if (isset($error)): ?>
                        <div class="alert alert-danger"><?php echo $error; ?></div>
                    <?php endif; ?>
                    
                    <?php if (empty($users)): ?>
                        <div class="alert alert-info">
                            No users available to start a conversation with.
                        </div>
                    <?php else: ?>
                        <form method="POST">
                            <div class="mb-3">
                                <label for="user_id" class="form-label">Select User</label>
                                <select class="form-select" id="user_id" name="user_id" required>
                                    <option value="">Choose a user...</option>
                                    <?php foreach ($users as $u): ?>
                                        <option value="<?php echo $u['id']; ?>" <?php echo ($targetUserId === $u['id']) ? 'selected' : ''; ?>>
                                            <?php echo htmlspecialchars($u['username']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-comment"></i> Start Conversation
                                </button>
                            </div>
                        </form>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include ROOT_PATH . '/includes/footer.php'; ?> 