<?php
require_once '../../config/database.php';
require_once '../../classes/Item.php';
session_start();

$item = new Item($pdo);

// Admin authentication
if (!isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    header("Location: ../auth/login.php");
    exit;
}

if (isset($_GET['id'])) {
    $itemId = $_GET['id'];
    $item->deleteItem($itemId);
    header("Location: reports.php");
    exit;
}
?>

