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
require_once ROOT_PATH . '/classes/SpamReport.php';

// Check if user is logged in
$user = new User($pdo);
if (!$user->isLoggedIn()) {
    header("Location: " . BASE_URL . "/pages/auth/login.php");
    exit;
}

// TODO: Add admin check when admin privileges are implemented
// For now, we'll allow any logged-in user to access this page

$spamReport = new SpamReport($pdo);
$message = '';
$error = '';

// Handle status update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['report_id']) && isset($_POST['status'])) {
    $reportId = (int)$_POST['report_id'];
    $status = $_POST['status'];
    
    if ($spamReport->updateStatus($reportId, $status)) {
        $message = "Report status updated successfully.";
    } else {
        $error = "Failed to update report status.";
    }
}

// Get filter status from URL
$filterStatus = isset($_GET['status']) ? $_GET['status'] : null;

// Get reports
$reports = $spamReport->getAllReports($filterStatus);
$reportCounts = $spamReport->getReportCounts();

// Include header and navigation
include ROOT_PATH . '/includes/header.php';
include ROOT_PATH . '/includes/navigation.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Spam Reports</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h2 class="mb-4">Manage Spam Reports</h2>
        
        <?php if ($message): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>
        
        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <!-- Status filter tabs -->
        <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
                <a class="nav-link <?php echo $filterStatus === null ? 'active' : ''; ?>" href="<?php echo BASE_URL; ?>/pages/admin/manage_spam_reports.php">
                    All <span class="badge bg-secondary"><?php echo array_sum($reportCounts); ?></span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo $filterStatus === 'pending' ? 'active' : ''; ?>" href="<?php echo BASE_URL; ?>/pages/admin/manage_spam_reports.php?status=pending">
                    Pending <span class="badge bg-warning"><?php echo $reportCounts['pending']; ?></span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo $filterStatus === 'reviewed' ? 'active' : ''; ?>" href="<?php echo BASE_URL; ?>/pages/admin/manage_spam_reports.php?status=reviewed">
                    Reviewed <span class="badge bg-info"><?php echo $reportCounts['reviewed']; ?></span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo $filterStatus === 'resolved' ? 'active' : ''; ?>" href="<?php echo BASE_URL; ?>/pages/admin/manage_spam_reports.php?status=resolved">
                    Resolved <span class="badge bg-success"><?php echo $reportCounts['resolved']; ?></span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo $filterStatus === 'dismissed' ? 'active' : ''; ?>" href="<?php echo BASE_URL; ?>/pages/admin/manage_spam_reports.php?status=dismissed">
                    Dismissed <span class="badge bg-secondary"><?php echo $reportCounts['dismissed']; ?></span>
                </a>
            </li>
        </ul>
        
        <?php if (empty($reports)): ?>
            <div class="alert alert-info">No spam reports found.</div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Post</th>
                            <th>Reporter</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Reported On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($reports as $report): ?>
                            <tr>
                                <td><?php echo $report['id']; ?></td>
                                <td>
                                    <a href="<?php echo BASE_URL; ?>/pages/posts/view.php?id=<?php echo $report['post_id']; ?>" target="_blank">
                                        <?php echo htmlspecialchars($report['post_title']); ?>
                                    </a>
                                </td>
                                <td><?php echo htmlspecialchars($report['reporter_name']); ?></td>
                                <td><?php echo htmlspecialchars($report['reason']); ?></td>
                                <td>
                                    <span class="badge bg-<?php 
                                        echo $report['status'] === 'pending' ? 'warning' : 
                                            ($report['status'] === 'reviewed' ? 'info' : 
                                            ($report['status'] === 'resolved' ? 'success' : 'secondary')); 
                                    ?>">
                                        <?php echo ucfirst($report['status']); ?>
                                    </span>
                                </td>
                                <td><?php echo date('M j, Y g:i A', strtotime($report['created_at'])); ?></td>
                                <td>
                                    <form method="POST" class="d-inline">
                                        <input type="hidden" name="report_id" value="<?php echo $report['id']; ?>">
                                        <select name="status" class="form-select form-select-sm d-inline-block w-auto" onchange="this.form.submit()">
                                            <option value="pending" <?php echo $report['status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                            <option value="reviewed" <?php echo $report['status'] === 'reviewed' ? 'selected' : ''; ?>>Reviewed</option>
                                            <option value="resolved" <?php echo $report['status'] === 'resolved' ? 'selected' : ''; ?>>Resolved</option>
                                            <option value="dismissed" <?php echo $report['status'] === 'dismissed' ? 'selected' : ''; ?>>Dismissed</option>
                                        </select>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
        
        <div class="mt-4">
            <a href="<?php echo BASE_URL; ?>/pages/dashboard.php" class="btn btn-secondary">Back to Dashboard</a>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
<?php include ROOT_PATH . '/includes/footer.php'; ?> 