<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define constants
define('ROOT_PATH', dirname(dirname(__DIR__))); 
define('BASE_URL', '/lost_found_hub/');

// Include required files
require_once ROOT_PATH . '/config/database.php';
require_once ROOT_PATH . '/classes/Item.php';
require_once ROOT_PATH . '/classes/User.php';

// Check if user is logged in
$user = new User($pdo);
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
$item = new Item($pdo);

// Get item details to check ownership
$itemDetails = $item->getItemById($itemId);

// Check if item exists
if (!$itemDetails) {
    $_SESSION['flash_message'] = "Item not found.";
    $_SESSION['flash_type'] = "danger";
    header("Location: " . BASE_URL . "index.php");
    exit;
}

// Check if user is the owner of the item
if ($itemDetails['user_id'] != $_SESSION['user_id']) {
    $_SESSION['flash_message'] = "You don't have permission to delete this item.";
    $_SESSION['flash_type'] = "danger";
    header("Location: " . BASE_URL . "pages/item/view.php?id=" . $itemId);
    exit;
}

// Delete item
if ($item->deleteItem($itemId)) {
    $_SESSION['flash_message'] = "Item deleted successfully.";
    $_SESSION['flash_type'] = "success";
    header("Location: " . BASE_URL . "pages/dashboard.php");
    exit;
} else {
    $_SESSION['flash_message'] = "Error deleting item.";
    $_SESSION['flash_type'] = "danger";
    header("Location: " . BASE_URL . "pages/item/view.php?id=" . $itemId);
    exit;
} 