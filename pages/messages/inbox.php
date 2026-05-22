<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define constants
define('ROOT_PATH', dirname(dirname(__DIR__)));
define('BASE_URL', '/lost_found_hub');

// Include required files
require_once ROOT_PATH . '/config/database.php';
require_once ROOT_PATH . '/classes/Message.php';
require_once ROOT_PATH . '/classes/User.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/login.php');
    exit();
}

// Initialize User object
$user = new User($pdo);

$message = new Message($pdo);
$conversations = $message->getConversations($_SESSION['user_id']);

// Include header and navigation
include ROOT_PATH . '/includes/header.php';
include ROOT_PATH . '/includes/navigation.php';
?>

<div class="container mt-4">
    <div class="row">
        <div class="col-md-8 mx-auto">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h2 class="mb-0">Messages</h2>
                    <a href="<?php echo BASE_URL; ?>/pages/messages/new.php" class="btn btn-primary">
                        <i class="fas fa-plus"></i> New Conversation
                    </a>
                </div>
                <div class="list-group list-group-flush">
                    <?php if (empty($conversations)): ?>
                        <div class="list-group-item text-center py-4">
                            <p class="text-muted mb-0">No messages yet</p>
                            <a href="<?php echo BASE_URL; ?>/pages/messages/new.php" class="btn btn-outline-primary mt-3">
                                <i class="fas fa-plus"></i> Start a Conversation
                            </a>
                        </div>
                    <?php else: ?>
                        <?php foreach ($conversations as $conv): ?>
                            <a href="<?php echo BASE_URL; ?>/pages/messages/chat.php?id=<?php echo htmlspecialchars($conv['id']); ?>" 
                               class="list-group-item list-group-item-action">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1"><?php echo htmlspecialchars($conv['username']); ?></h6>
                                        <p class="mb-1 text-muted">
                                            <?php 
                                            if ($conv['last_message']) {
                                                echo htmlspecialchars(substr($conv['last_message'], 0, 50)) . 
                                                     (strlen($conv['last_message']) > 50 ? '...' : '');
                                            } else {
                                                echo 'No messages yet';
                                            }
                                            ?>
                                        </p>
                                    </div>
                                    <small class="text-muted">
                                        <?php 
                                        if ($conv['last_message_time']) {
                                            $date = new DateTime($conv['last_message_time']);
                                            echo $date->format('M j, g:i a');
                                        }
                                        ?>
                                    </small>
                                </div>
                            </a>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include ROOT_PATH . '/includes/footer.php'; ?>