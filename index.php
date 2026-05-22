<?php
require_once 'config/database.php';
require_once 'classes/Item.php';

$item = new Item($pdo);
$items = $item->getAllItems();

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define constants
define('ROOT_PATH', __DIR__ . '/'); 
define('BASE_URL', '/lost_found_hub/');

// Include header and navigation
include_once(ROOT_PATH . 'includes/header.php');
include_once(ROOT_PATH . 'includes/navigation.php');
?>

<div class="container mt-4">
    <h2>Items Feed</h2>
    <div class="row">
        <?php if ($items): ?>
            <?php foreach ($items as $item): ?>
                <div class="col-md-4">
                    <div class="card mb-4">
                        <?php if (!empty($item['image'])): ?>
                            <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($item['image']) ?>" class="card-img-top" alt="Item Image">
                        <?php endif; ?>
                        <div class="card-body">
                            <h5 class="card-title"><?= htmlspecialchars($item['title']) ?></h5>
                            <p class="card-text"><?= htmlspecialchars($item['description']) ?></p>
                            <a href="<?= BASE_URL ?>pages/item/view.php?id=<?= $item['id'] ?>" class="btn btn-primary">View Item</a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p>No items found.</p>
        <?php endif; ?>
    </div>
</div>

<?php include_once(ROOT_PATH . 'includes/footer.php'); ?>
