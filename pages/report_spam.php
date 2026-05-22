<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define constants
define('ROOT_PATH', dirname(__DIR__)); 
define('BASE_URL', '/lost_found_hub');

// Include required files
require_once ROOT_PATH . '/config/database.php';
require_once ROOT_PATH . '/classes/User.php';
require_once ROOT_PATH . '/classes/Report.php';

// Check if user is logged in
$user = new User($pdo);
if (!$user->isLoggedIn()) {
    header("Location: " . BASE_URL . "/pages/auth/login.php");
    exit;
}

$report = new Report($pdo);
$message = '';
$error = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $itemId = isset($_POST['item_id']) ? (int)$_POST['item_id'] : 0;
    $reason = isset($_POST['reason']) ? trim($_POST['reason']) : '';
    
    if ($itemId > 0 && !empty($reason)) {
        if ($report->submitReport($_SESSION['user_id'], $itemId, $reason)) {
            $message = "Report submitted successfully. Thank you for helping keep our community safe.";
        } else {
            $error = "You have already reported this item or there was an error submitting your report.";
        }
    } else {
        $error = "Please provide a valid item ID and reason for reporting.";
    }
}

// Get item ID from URL if provided
$itemId = isset($_GET['item_id']) ? (int)$_GET['item_id'] : 0;

// Include header and navigation
include ROOT_PATH . '/includes/header.php';
include ROOT_PATH . '/includes/navigation.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Spam</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h2 class="mb-4">Report Spam</h2>
        
        <?php if ($message): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>
        
        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <div class="card">
            <div class="card-body">
                <form method="POST" class="form-group">
                    <div class="mb-3">
                        <label for="item_id" class="form-label">Item ID</label>
                        <input type="number" id="item_id" name="item_id" class="form-control" value="<?php echo $itemId; ?>" required>
                        <small class="text-muted">Enter the ID of the item you want to report.</small>
                    </div>
                    
                    <div class="mb-3">
                        <label for="reason" class="form-label">Reason for Reporting</label>
                        <textarea id="reason" name="reason" class="form-control" rows="4" required></textarea>
                        <small class="text-muted">Please provide details about why you believe this item is spam.</small>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-danger">Submit Report</button>
                        <a href="<?php echo BASE_URL; ?>/pages/dashboard.php" class="btn btn-secondary">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
        
        <div class="mt-4">
            <h4>Reporting Guidelines</h4>
            <p>Please report items that:</p>
            <ul>
                <li>Contain inappropriate or offensive content</li>
                <li>Are advertisements or promotional material</li>
                <li>Are duplicate items</li>
                <li>Contain false or misleading information</li>
                <li>Violate our community guidelines</li>
            </ul>
            <p>Your reports help us maintain a safe and helpful community for all users.</p>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
<?php include ROOT_PATH . '/includes/footer.php'; ?> 