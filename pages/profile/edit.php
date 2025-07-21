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

// Check if user is logged in
if (!$user->isLoggedIn()) {
    header("Location: " . BASE_URL . "pages/auth/login.php");
    exit;
}

// Get user details
$userId = $_SESSION['user_id'];
$userDetails = $user->getUserById($userId);

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $currentPassword = $_POST['current_password'];
    $newPassword = $_POST['new_password'];
    $confirmPassword = $_POST['confirm_password'];
    
    // Handle profile picture upload
    $profilePicture = $userDetails['profile_picture']; // Keep existing picture by default
    
    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] == 0) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $maxFileSize = 5 * 1024 * 1024; // 5MB
        
        if (!in_array($_FILES['profile_picture']['type'], $allowedTypes)) {
            $error = "Only JPG, PNG, and GIF files are allowed.";
        } elseif ($_FILES['profile_picture']['size'] > $maxFileSize) {
            $error = "File size must be less than 5MB.";
        } else {
            $targetDir = ROOT_PATH . "assets/images/profiles/";
            
            // Create directory if it doesn't exist
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
            
            $fileName = time() . '_' . basename($_FILES['profile_picture']['name']);
            $targetFile = $targetDir . $fileName;
            
            if (move_uploaded_file($_FILES['profile_picture']['tmp_name'], $targetFile)) {
                $profilePicture = "profiles/" . $fileName;
            } else {
                $error = "Failed to upload profile picture.";
            }
        }
    }
    
    // Validate passwords if changing
    if (!empty($newPassword)) {
        if ($newPassword !== $confirmPassword) {
            $error = "New passwords do not match.";
        } elseif (strlen($newPassword) < 6) {
            $error = "Password must be at least 6 characters long.";
        }
    }
    
    // Update profile if no errors
    if (!isset($error)) {
        if ($user->updateProfile($userId, $username, $email, $currentPassword, $newPassword, $profilePicture)) {
            $_SESSION['username'] = $username; // Update session
            header("Location: " . BASE_URL . "pages/profile/view.php?update=success");
            exit;
        } else {
            $error = "Failed to update profile.";
        }
    }
}

// Include header and navigation
include_once(ROOT_PATH . 'includes/header.php');
include_once(ROOT_PATH . 'includes/navigation.php');
?>

<div class="container mt-4">
    <div class="row">
        <div class="col-md-8 mx-auto">
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0">Edit Profile</h4>
                </div>
                <div class="card-body">
                    <?php if (isset($error)): ?>
                        <div class="alert alert-danger"><?= $error ?></div>
                    <?php endif; ?>
                    
                    <form method="POST" enctype="multipart/form-data">
                        <div class="mb-3">
                            <label for="username" class="form-label">Username</label>
                            <input type="text" class="form-control" id="username" name="username" value="<?= htmlspecialchars($userDetails['username']) ?>" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email" value="<?= htmlspecialchars($userDetails['email']) ?>" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="profile_picture" class="form-label">Profile Picture</label>
                            <?php if (!empty($userDetails['profile_picture'])): ?>
                                <div class="mb-2">
                                    <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($userDetails['profile_picture']) ?>" class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;">
                                </div>
                            <?php endif; ?>
                            <input type="file" class="form-control" id="profile_picture" name="profile_picture" accept="image/*">
                            <small class="text-muted">Max file size: 5MB. Allowed types: JPG, PNG, GIF</small>
                        </div>
                        
                        <hr>
                        <h5>Change Password</h5>
                        <p class="text-muted small">Leave password fields blank if you don't want to change it.</p>
                        
                        <div class="mb-3">
                            <label for="current_password" class="form-label">Current Password</label>
                            <input type="password" class="form-control" id="current_password" name="current_password">
                        </div>
                        
                        <div class="mb-3">
                            <label for="new_password" class="form-label">New Password</label>
                            <input type="password" class="form-control" id="new_password" name="new_password">
                        </div>
                        
                        <div class="mb-3">
                            <label for="confirm_password" class="form-label">Confirm New Password</label>
                            <input type="password" class="form-control" id="confirm_password" name="confirm_password">
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">Update Profile</button>
                            <a href="<?= BASE_URL ?>pages/profile/view.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include_once(ROOT_PATH . 'includes/footer.php'); ?>

