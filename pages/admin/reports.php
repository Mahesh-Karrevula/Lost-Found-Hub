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
require_once ROOT_PATH . '/classes/Report.php';

// Check if user is logged in and is an admin
$user = new User($pdo);
if (!$user->isLoggedIn() || !$user->isAdmin()) {
    header("Location: " . BASE_URL . "/pages/auth/login.php");
    exit;
}

$report = new Report($pdo);
$message = '';
$error = '';

// Handle report deletion
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_report'])) {
    $reportId = (int)$_POST['report_id'];
    if ($report->deleteReport($reportId)) {
        $message = "Report deleted successfully.";
    } else {
        $error = "Error deleting report.";
    }
}

// Get all reports
$reports = $report->getAllReports();

// Include header and navigation
include ROOT_PATH . '/includes/header.php';
include ROOT_PATH . '/includes/navigation.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Reports</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h2 class="mb-4">Manage Reports</h2>
        
        <?php if ($message): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>
        
        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <div class="card">
            <div class="card-body">
                <?php if (empty($reports)): ?>
                    <p class="text-center">No reports found.</p>
                <?php else: ?>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Reporter</th>
                                    <th>Item</th>
                                    <th>Reason</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($reports as $report): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($report['id']); ?></td>
                                        <td><?php echo htmlspecialchars($report['reporter_name']); ?></td>
                                        <td>
                                            <a href="<?php echo BASE_URL; ?>/pages/item.php?id=<?php echo $report['item_id']; ?>" target="_blank">
                                                <?php echo htmlspecialchars($report['item_title']); ?>
                                            </a>
                                        </td>
                                        <td><?php echo htmlspecialchars($report['reason']); ?></td>
                                        <td><?php echo date('Y-m-d H:i:s', strtotime($report['created_at'])); ?></td>
                                        <td>
                                            <form method="POST" style="display: inline;">
                                                <input type="hidden" name="report_id" value="<?php echo $report['id']; ?>">
                                                <button type="submit" name="delete_report" class="btn btn-danger btn-sm" 
                                                        onclick="return confirm('Are you sure you want to delete this report? This will also delete the associated item.')">
                                                    Delete
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        
        <div class="mt-4">
            <a href="<?php echo BASE_URL; ?>/pages/admin/dashboard.php" class="btn btn-secondary">Back to Admin Dashboard</a>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
<?php include ROOT_PATH . '/includes/footer.php'; ?>