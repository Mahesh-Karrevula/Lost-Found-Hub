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
require_once ROOT_PATH . 'classes/Item.php';

$user = new User($pdo);
$item = new Item($pdo);

// CSRF token setup
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Check if the user is logged in
if (!$user->isLoggedIn()) {
    header("Location: " . BASE_URL . "pages/auth/login.php");
    exit;
}

// Predefined locations
$locations = [
    'Campus' => [
        'Main Building',
        'Library',
        'Student Center',
        'Cafeteria',
        'Parking Lot',
        'Sports Field',
        'Dormitory',
        'Administration Office'
    ],
    'City' => [
        'Downtown',
        'Shopping Mall',
        'Bus Station',
        'Train Station',
        'Park',
        'Restaurant',
        'Coffee Shop',
        'Gym',
        'Supermarket'
    ],
    'Other' => [
        'Beach',
        'Hiking Trail',
        'Airport',
        'Hospital',
        'Other'
    ]
];

// Handle form submission for creating a new item post
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title = trim($_POST['title']);
    $description = trim($_POST['description']);
    $type = $_POST['type'];
    $location = trim($_POST['location']);
    $latitude = null;
    $longitude = null;
    $userId = $_SESSION['user_id'];
    $image = "";

    // Handle image upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $maxFileSize = 5 * 1024 * 1024; // 5MB
        
        if (!in_array($_FILES['image']['type'], $allowedTypes)) {
            $error = "Only JPG, PNG, and GIF files are allowed.";
        } elseif ($_FILES['image']['size'] > $maxFileSize) {
            $error = "File size must be less than 5MB.";
        } else {
            $targetDir = ROOT_PATH . "assets/images/items/";
            
            // Create directory if it doesn't exist
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
            
            $fileName = time() . '_' . basename($_FILES['image']['name']);
            $targetFile = $targetDir . $fileName;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
                $image = "items/" . $fileName;
            } else {
                $error = "Failed to upload image.";
            }
        }
    }
    
    // Insert new item into the database if no errors
    if (!isset($error)) {
        if ($item->createItem($title, $description, $type, $location, $userId, $image, $latitude, $longitude)) {
            header("Location: " . BASE_URL . "pages/dashboard.php");
            exit;
        } else {
            $error = "Failed to create item.";
        }
    }
}

// Include header and navigation
include_once(ROOT_PATH . 'includes/header.php');
include_once(ROOT_PATH . 'includes/navigation.php');
?>

<div class="container mt-4">
    <h2>Create New Item Post</h2>
    <?php if (isset($error)): ?>
        <div class="alert alert-danger"><?= $error ?></div>
    <?php endif; ?>
    
    <form action="<?= BASE_URL ?>pages/item/create.php" method="post" enctype="multipart/form-data">
        <div class="mb-3">
            <label for="title" class="form-label">Title</label>
            <input type="text" class="form-control" id="title" name="title" required>
        </div>
        <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea class="form-control" id="description" name="description" rows="4" required></textarea>
        </div>
        <div class="mb-3">
            <label for="type" class="form-label">Type</label>
            <select class="form-control" id="type" name="type" required>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="location" class="form-label">Location</label>
            <div class="row">
                <div class="col-md-6">
                    <select class="form-control" id="location_category" onchange="updateLocationOptions()">
                        <option value="">Select Category</option>
                        <?php foreach ($locations as $category => $places): ?>
                            <option value="<?= $category ?>"><?= $category ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-6">
                    <select class="form-control" id="location" name="location" required>
                        <option value="">Select Location</option>
                    </select>
                </div>
            </div>
            <small class="text-muted">Select the category and specific location where the item was lost or found.</small>
        </div>
        <div class="mb-3">
            <label for="image" class="form-label">Item Image</label>
            <input type="file" class="form-control" id="image" name="image" accept="image/*">
            <small class="text-muted">Max file size: 5MB. Allowed types: JPG, PNG, GIF</small>
        </div>
        <button type="submit" class="btn btn-primary">Create Post</button>
    </form>
</div>

<script>
// JavaScript to handle location selection
const locations = <?= json_encode($locations) ?>;

function updateLocationOptions() {
    const category = document.getElementById('location_category').value;
    const locationSelect = document.getElementById('location');
    
    // Clear current options
    locationSelect.innerHTML = '<option value="">Select Location</option>';
    
    if (category && locations[category]) {
        locations[category].forEach(place => {
            const option = document.createElement('option');
            option.value = category + ' - ' + place;
            option.textContent = place;
            locationSelect.appendChild(option);
        });
    }
}
</script>

<?php include_once(ROOT_PATH . 'includes/footer.php'); ?>
