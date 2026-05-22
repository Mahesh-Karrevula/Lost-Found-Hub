<?php
function sanitizeInput($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function uploadImage($file) {
    $targetDir = "/lost-found-hub/assets/images/";
    $filename = time() . '_' . basename($file["name"]);
    $targetFile = $_SERVER['DOCUMENT_ROOT'] . $targetDir . $filename;
    
    if (move_uploaded_file($file["tmp_name"], $targetFile)) {
        return $targetDir . $filename;
    }
    return null;
}
