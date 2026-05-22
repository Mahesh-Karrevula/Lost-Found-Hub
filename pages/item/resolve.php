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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $itemId = $_POST['item_id'];

    // Optional: confirm ownership before resolving
    $itemDetails = $item->getItemById($itemId);
    if ($itemDetails && $itemDetails['user_id'] == $_SESSION['user_id']) {
        if ($item->markAsResolved($itemId)) {
            header("Location: " . BASE_URL . "pages/dashboard.php?resolve=success");
            exit;
        } else {
            $error = "Failed to mark item as resolved.";
        }
    } else {
        $error = "You don't have permission to resolve this item.";
    }
    
    // If there was an error, redirect back with error message
    if (isset($error)) {
        header("Location: " . BASE_URL . "pages/item/view.php?id=" . $itemId . "&error=" . urlencode($error));
        exit;
    }
}
?>
