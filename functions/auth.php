<?php
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: /lost-found-hub/pages/auth/login.php');
        exit;
    }
}
