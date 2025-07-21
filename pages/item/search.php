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
require_once ROOT_PATH . 'classes/Item.php';
require_once ROOT_PATH . 'classes/User.php';

$user = new User($pdo);
$item = new Item($pdo);

if (!$user->isLoggedIn()) {
    header("Location: " . BASE_URL . "pages/auth/login.php");
    exit;
}

$keyword = $_GET['q'] ?? '';
$type = $_GET['type'] ?? '';
$location = $_GET['location'] ?? '';

$results = $item->searchItems($keyword, $type, $location);

// Include header and navigation
include_once(ROOT_PATH . 'includes/header.php');
include_once(ROOT_PATH . 'includes/navigation.php');
?>

<div class="container mt-4">
    <h2 class="mb-3">🔍 Search & Filter Items</h2>

    <form method="GET" class="row g-3 mb-4">
        <div class="col-md-4">
            <input type="text" name="q" class="form-control" placeholder="Search title..." value="<?= htmlspecialchars($keyword) ?>">
        </div>
        <div class="col-md-3">
            <select name="type" class="form-select">
                <option value="">All Types</option>
                <option value="lost" <?= $type == 'lost' ? 'selected' : '' ?>>Lost</option>
                <option value="found" <?= $type == 'found' ? 'selected' : '' ?>>Found</option>
            </select>
        </div>
        <div class="col-md-3">
            <input type="text" name="location" class="form-control" placeholder="Location" value="<?= htmlspecialchars($location) ?>">
        </div>
        <div class="col-md-2">
            <button type="submit" class="btn btn-primary w-100">Search</button>
        </div>
    </form>

    <div class="row">
        <?php if ($results): ?>
            <?php foreach ($results as $i): ?>
                <div class="col-md-4 mb-4">
                    <div class="card shadow-sm h-100">
                        <?php if (!empty($i['image']) && file_exists(ROOT_PATH . '/assets/images/' . $i['image'])): ?>
                            <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($i['image']) ?>" class="card-img-top" style="height: 200px; object-fit: cover;">
                        <?php else: ?>
                            <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                                <i class="fas fa-image text-muted" style="font-size: 3rem;"></i>
                            </div>
                        <?php endif; ?>
                        <div class="card-body">
                            <h5 class="card-title"><?= htmlspecialchars($i['title']) ?></h5>
                            <p class="card-text"><?= htmlspecialchars(substr($i['description'], 0, 80)) ?>...</p>
                            <p class="text-muted small"><?= ucfirst($i['type']) ?> · <?= htmlspecialchars($i['location']) ?><br>Posted by <strong><?= htmlspecialchars($i['username']) ?></strong></p>
                            <a href="<?= BASE_URL ?>pages/item/view.php?id=<?= $i['id'] ?>" class="btn btn-primary btn-sm">View</a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p>No matching items found.</p>
        <?php endif; ?>
    </div>
</div>

<?php include_once(ROOT_PATH . 'includes/footer.php'); ?>