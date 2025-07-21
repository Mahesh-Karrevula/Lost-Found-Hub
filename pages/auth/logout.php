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

$user = new User($pdo);

// Logout the user
$user->logout();

// Redirect to login page
header("Location: " . BASE_URL . "pages/auth/login.php");
exit;
?>