<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define constants
define('ROOT_PATH', dirname(__DIR__, 2) . '/'); 
define('BASE_URL', '/lost_found_hub/');

// Include required files
require_once ROOT_PATH . 'config/database.php';
require_once ROOT_PATH . 'classes/User.php';
require_once ROOT_PATH . 'classes/Item.php';

$user = new User($pdo);
$item = new Item($pdo);

// Check if user is logged in
if (!$user->isLoggedIn()) {
    header("Location: " . BASE_URL . "pages/auth/login.php");
    exit;
}

// Get user details
$userId = $_SESSION['user_id'];
$userDetails = $user->getUserById($userId);

// Get user's items
$userItems = $item->getAllItems();
$userItems = array_filter($userItems, function($item) use ($userId) {
    return $item['user_id'] == $userId;
});

// Include header and navigation
include_once(ROOT_PATH . 'includes/header.php');
include_once(ROOT_PATH . 'includes/navigation.php');
?>

<div class="container mt-4">
    <div class="row">
        <div class="col-md-4">
            <div class="card mb-4">
                <div class="card-body text-center">
                    <?php if (!empty($userDetails['profile_picture']) && file_exists(ROOT_PATH . '/assets/images/' . $userDetails['profile_picture'])): ?>
                        <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($userDetails['profile_picture']) ?>" class="rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover;">
                    <?php else: ?>
                        <img src="<?= BASE_URL ?>assets/images/default.png" class="rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover;">
                    <?php endif; ?>
                    <h4><?= htmlspecialchars($userDetails['username']) ?></h4>
                    <p class="text-muted"><?= htmlspecialchars($userDetails['email']) ?></p>
                    <a href="<?= BASE_URL ?>pages/profile/edit.php" class="btn btn-primary">Edit Profile</a>
                </div>
            </div>
        </div>
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">My Items</h5>
                </div>
                <div class="card-body">
                    <?php if (!empty($userItems)): ?>
                        <div class="row">
                            <?php foreach ($userItems as $i): ?>
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100">
                                        <?php if (!empty($i['image'])): ?>
                                            <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($i['image']) ?>" class="card-img-top" style="height: 150px; object-fit: cover;">
                                        <?php endif; ?>
                                        <div class="card-body">
                                            <h5 class="card-title"><?= htmlspecialchars($i['title']) ?></h5>
                                            <p class="card-text"><?= htmlspecialchars(substr($i['description'], 0, 50)) ?>...</p>
                                            <p class="text-muted small">
                                                <?= ucfirst($i['type']) ?> · <?= htmlspecialchars($i['location']) ?>
                                            </p>
                                            <a href="<?= BASE_URL ?>pages/item/view.php?id=<?= $i['id'] ?>" class="btn btn-sm btn-primary">View</a>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php else: ?>
                        <p>You haven't posted any items yet.</p>
                        <a href="<?= BASE_URL ?>pages/item/create.php" class="btn btn-success">Post Your First Item</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include_once(ROOT_PATH . 'includes/footer.php'); ?>