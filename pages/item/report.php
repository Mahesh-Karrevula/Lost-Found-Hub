<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define constants
define('ROOT_PATH', dirname(dirname(__DIR__)) . '/'); 
define('BASE_URL', '/lost_found_hub/');

// Include required files
require_once ROOT_PATH . 'config/database.php';
require_once ROOT_PATH . 'classes/User.php';
require_once ROOT_PATH . 'classes/Item.php';
require_once ROOT_PATH . 'classes/Report.php';

$user = new User($pdo);
$item = new Item($pdo);
$report = new Report($pdo);

// Check if user is logged in
if (!$user->isLoggedIn()) {
    header("Location: " . BASE_URL . "pages/auth/login.php");
    exit;
}

// Check if item ID is provided
if (!isset($_GET['id'])) {
    header("Location: " . BASE_URL . "index.php");
    exit;
}

$itemId = $_GET['id'];
$itemDetails = $item->getItemById($itemId);

if (!$itemDetails) {
    header("Location: " . BASE_URL . "index.php");
    exit;
}

$message = '';
$error = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $reason = $_POST['reason'] ?? '';
    
    if (empty($reason)) {
        $error = "Please provide a reason for reporting this item.";
    } else {
        // Check if user has already reported this item
        if ($report->hasUserReported($itemId, $_SESSION['user_id'])) {
            $error = "You have already reported this item.";
        } else {
            // Create the report
            if ($report->createReport($itemId, $_SESSION['user_id'], $reason)) {
                $message = "Item reported successfully. Thank you for helping keep our community safe.";
            } else {
                $error = "Failed to submit report. Please try again.";
            }
        }
    }
}

include ROOT_PATH . 'includes/header.php';
include ROOT_PATH . 'includes/navigation.php';
?>

<div class="container mt-4">
    <div class="row">
        <div class="col-md-8 mx-auto">
            <div class="card">
                <div class="card-header">
                    <h2 class="mb-0">Report Item</h2>
                </div>
                <div class="card-body">
                    <?php if ($message): ?>
                        <div class="alert alert-success">
                            <?php echo htmlspecialchars($message); ?>
                            <div class="mt-3">
                                <a href="<?php echo BASE_URL; ?>pages/item/view.php?id=<?php echo $itemId; ?>" class="btn btn-primary">
                                    <i class="fas fa-arrow-left"></i> Back to Item
                                </a>
                            </div>
                        </div>
                    <?php else: ?>
                        <?php if ($error): ?>
                            <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
                        <?php endif; ?>

                        <div class="mb-4">
                            <h4>Item Details</h4>
                            <p><strong>Title:</strong> <?php echo htmlspecialchars($itemDetails['title']); ?></p>
                            <p><strong>Posted by:</strong> <?php echo htmlspecialchars($itemDetails['username']); ?></p>
                            <p><strong>Type:</strong> <?php echo ucfirst($itemDetails['type']); ?></p>
                        </div>

                        <form method="POST">
                            <div class="mb-3">
                                <label for="reason" class="form-label">Reason for Reporting</label>
                                <textarea class="form-control" id="reason" name="reason" rows="4" required 
                                    placeholder="Please provide details about why you believe this item should be reported..."><?php echo isset($_POST['reason']) ? htmlspecialchars($_POST['reason']) : ''; ?></textarea>
                            </div>
                            
                            <div class="d-flex justify-content-between">
                                <a href="<?php echo BASE_URL; ?>pages/item/view.php?id=<?php echo $itemId; ?>" class="btn btn-secondary">
                                    <i class="fas fa-times"></i> Cancel
                                </a>
                                <button type="submit" class="btn btn-danger">
                                    <i class="fas fa-flag"></i> Submit Report
                                </button>
                            </div>
                        </form>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include ROOT_PATH . 'includes/footer.php'; ?>
