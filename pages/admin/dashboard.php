<?php
require_once '../../config/database.php';
require_once '../../classes/User.php';
require_once '../../classes/Item.php';
require_once '../../classes/Notification.php';

session_start();

$user = new User($pdo);
$item = new Item($pdo);
$notification = new Notification($pdo);

// Admin authentication (check if the logged-in user is an admin)
if (!$user->isLoggedIn() || !$user->isAdmin()) {
    header("Location: ../auth/login.php");
    exit;
}

// Get stats for the dashboard
$totalUsers = $user->getTotalUsers();
$totalItems = $item->getTotalItems();
$totalReportedItems = $item->getTotalReportedItems();
$totalNotifications = count($notification->getUnreadNotifications($_SESSION['user_id']));

?>


<?php
define('ROOT_PATH', dirname(__DIR__, 2) . '/'); 
define('BASE_URL', '/lost_found_hub/');
include_once(ROOT_PATH . 'includes/header.php');
include_once(ROOT_PATH . 'includes/navigation.php');
?>



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Lost & Found</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container mt-4">
    <h2>Admin Dashboard</h2>
    
    <div class="row">
        <div class="col-md-3">
            <div class="card text-white bg-primary mb-3">
                <div class="card-header">Total Users</div>
                <div class="card-body">
                    <h5 class="card-title"><?= $totalUsers ?></h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-success mb-3">
                <div class="card-header">Total Items</div>
                <div class="card-body">
                    <h5 class="card-title"><?= $totalItems ?></h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-warning mb-3">
                <div class="card-header">Reported Items</div>
                <div class="card-body">
                    <h5 class="card-title"><?= $totalReportedItems ?></h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-danger mb-3">
                <div class="card-header">Unread Notifications</div>
                <div class="card-body">
                    <h5 class="card-title"><?= $totalNotifications ?></h5>
                </div>
            </div>
        </div>
    </div>

    <h3>Manage Reports</h3>
    <a href="reports.php" class="btn btn-danger">View Reported Items</a>
</div>
</body>
</html>

<?php include_once(ROOT_PATH . 'includes/footer.php'); ?>