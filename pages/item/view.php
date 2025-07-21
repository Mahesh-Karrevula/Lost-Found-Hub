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

$item = new Item($pdo);
$user = new User($pdo);

// Check if the item ID is provided
if (!isset($_GET['id'])) {
    header("Location: " . BASE_URL . "index.php");
    exit;
}

$itemId = $_GET['id'];
$itemDetails = $item->getItemById($itemId);

// Include header and navigation
include_once(ROOT_PATH . 'includes/header.php');
include_once(ROOT_PATH . 'includes/navigation.php');
?>

<div class="container mt-4">
    <div class="row">
        <div class="col-md-8">
            <div class="card">
                <div class="card-body">
                    <h2 class="card-title"><?= htmlspecialchars($itemDetails['title']) ?></h2>
                    <p class="text-muted">
                        Posted by <?= htmlspecialchars($itemDetails['username']) ?> · 
                        <?= ucfirst($itemDetails['type']) ?> · 
                        <?= date('M d, Y', strtotime($itemDetails['created_at'])) ?>
                        <?php if (isset($itemDetails['status']) && $itemDetails['status'] == 'resolved'): ?>
                            <span class="badge bg-success ms-2">Resolved</span>
                        <?php endif; ?>
                    </p>
                    
                    <?php if (!empty($itemDetails['image'])): ?>
                        <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($itemDetails['image']) ?>" 
                             class="img-fluid mb-3" alt="Item Image">
                    <?php endif; ?>
                    
                    <p class="card-text"><?= nl2br(htmlspecialchars($itemDetails['description'])) ?></p>
                    
                    <div class="mb-3">
                        <h5>Location</h5>
                        <p><i class="fas fa-map-marker-alt"></i> <?= htmlspecialchars($itemDetails['location']) ?></p>
                    </div>
                    
                    <?php if ($user->isLoggedIn()): ?>
                        <?php if ($itemDetails['user_id'] == $_SESSION['user_id']): ?>
                            <!-- Options for item owner -->
                            <div class="mt-3">
                                <?php if (isset($itemDetails['status']) && $itemDetails['status'] != 'resolved'): ?>
                                    <a href="<?= BASE_URL ?>pages/item/mark_resolved.php?id=<?= $itemDetails['id'] ?>" 
                                       class="btn btn-success" 
                                       onclick="return confirm('Are you sure you want to mark this item as resolved?')">
                                       <i class="fas fa-check-circle"></i> Mark as Resolved
                                    </a>
                                <?php endif; ?>
                                
                                <a href="<?= BASE_URL ?>pages/item/delete.php?id=<?= $itemDetails['id'] ?>" 
                                   class="btn btn-danger" 
                                   onclick="return confirm('Are you sure you want to delete this item? This action cannot be undone.')">
                                   <i class="fas fa-trash"></i> Delete Item
                                </a>
                            </div>
                        <?php else: ?>
                            <!-- Options for non-owners -->
                            <div class="mt-3">
                                <a href="<?= BASE_URL ?>pages/messages/new.php?to=<?= $itemDetails['user_id'] ?>" 
                                   class="btn btn-primary">
                                   <i class="fas fa-comment"></i> Contact Owner
                                </a>
                                <a href="<?= BASE_URL ?>pages/item/report.php?id=<?= $itemDetails['id'] ?>" 
                                   class="btn btn-danger">
                                   <i class="fas fa-flag"></i> Report Item
                                </a>
                            </div>
                        <?php endif; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <!-- Additional information or related items can go here -->
        </div>
    </div>
</div>

<?php include_once(ROOT_PATH . 'includes/footer.php'); ?>