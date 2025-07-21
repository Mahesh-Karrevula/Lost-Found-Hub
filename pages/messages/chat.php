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
require_once ROOT_PATH . '/classes/User.php';
require_once ROOT_PATH . '/classes/Message.php';

$user = new User($pdo);
$message = new Message($pdo);

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/login.php');
    exit();
}

// Check if conversation ID is provided
if (!isset($_GET['id'])) {
    header('Location: ' . BASE_URL . '/pages/messages/inbox.php');
    exit();
}

$conversationId = $_GET['id'];

// Verify user is part of the conversation
if (!$message->isUserInConversation($conversationId, $_SESSION['user_id'])) {
    header('Location: ' . BASE_URL . '/pages/messages/inbox.php');
    exit();
}

// Get conversation details and messages
$conversation = $message->getConversation($conversationId);
$messages = $message->getMessages($conversationId);

// Handle new message submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['message'])) {
    $content = trim($_POST['message']);
    if (!empty($content)) {
        $message->sendMessage($conversationId, $_SESSION['user_id'], $content);
        header('Location: ' . $_SERVER['REQUEST_URI']);
        exit();
    }
}

// Include header and navigation
include ROOT_PATH . '/includes/header.php';
include ROOT_PATH . '/includes/navigation.php';
?>

<div class="container mt-4">
    <div class="row">
        <div class="col-md-8 mx-auto">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h2 class="mb-0">Chat with <?php echo htmlspecialchars($conversation['username']); ?></h2>
                    <a href="<?php echo BASE_URL; ?>/pages/messages/inbox.php" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left"></i> Back to Inbox
                    </a>
                </div>
                <div class="card-body chat-messages" style="height: 400px; overflow-y: auto;">
                    <?php if (empty($messages)): ?>
                        <div class="text-center text-muted py-4">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    <?php else: ?>
                        <?php foreach ($messages as $msg): ?>
                            <div class="message <?php echo $msg['sender_id'] == $_SESSION['user_id'] ? 'sent' : 'received'; ?> mb-3">
                                <div class="message-content p-2 rounded <?php echo $msg['sender_id'] == $_SESSION['user_id'] ? 'bg-primary text-white' : 'bg-light'; ?>">
                                    <?php echo htmlspecialchars($msg['content']); ?>
                                </div>
                                <small class="text-muted">
                                    <?php 
                                    $date = new DateTime($msg['sent_at']);
                                    echo $date->format('g:i a');
                                    ?>
                                </small>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
                <div class="card-footer">
                    <form method="POST" class="message-form">
                        <div class="input-group">
                            <input type="text" name="message" class="form-control" placeholder="Type your message..." required>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i> Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.chat-messages {
    display: flex;
    flex-direction: column;
}

.message {
    max-width: 70%;
}

.message.sent {
    align-self: flex-end;
}

.message.received {
    align-self: flex-start;
}

.message-content {
    word-wrap: break-word;
}

.message.sent .message-content {
    border-radius: 15px 15px 0 15px;
}

.message.received .message-content {
    border-radius: 15px 15px 15px 0;
}
</style>

<script>
// Scroll to bottom of messages
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
</script>

<?php include ROOT_PATH . '/includes/footer.php'; ?>