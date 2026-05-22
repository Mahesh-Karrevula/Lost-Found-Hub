<?php
require_once '../config/database.php';
require_once '../classes/Item.php';
require_once '../classes/User.php';
session_start();

// Define constants with correct paths
define('ROOT_PATH', dirname(__DIR__) . '/');
define('BASE_URL', '/lost_found_hub');

require_once(ROOT_PATH . 'includes/header.php');

// Initialize User object
$user = new User($pdo);

require_once(ROOT_PATH . 'includes/navigation.php');

$item = new Item($pdo);

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$type = isset($_GET['type']) ? $_GET['type'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';
$date = isset($_GET['date']) ? $_GET['date'] : '';

$results = $item->searchItems($search, $type, $location, $date);

// Predefined locations (matching the create page)
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

// Flatten locations for the dropdown
$flatLocations = [];
foreach ($locations as $category => $places) {
    foreach ($places as $place) {
        $flatLocations[] = $category . ' - ' . $place;
    }
}
?>

<div class="container mt-4">
    <h2>Search & Filter Items</h2>
    <form method="get" class="row g-3 mb-4">
        <div class="col-md-4">
            <input type="text" name="search" class="form-control" placeholder="Item name" value="<?= htmlspecialchars($search) ?>">
        </div>
        <div class="col-md-2">
            <select name="type" class="form-select">
                <option value="">All Types</option>
                <option value="lost" <?= $type === 'lost' ? 'selected' : '' ?>>Lost</option>
                <option value="found" <?= $type === 'found' ? 'selected' : '' ?>>Found</option>
            </select>
        </div>
        <div class="col-md-3">
            <select name="location" class="form-select">
                <option value="">All Locations</option>
                <?php foreach ($flatLocations as $loc): ?>
                    <option value="<?= htmlspecialchars($loc) ?>" <?= $location === $loc ? 'selected' : '' ?>>
                        <?= htmlspecialchars($loc) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-md-2">
            <input type="date" name="date" class="form-control" value="<?= htmlspecialchars($date) ?>">
        </div>
        <div class="col-md-1">
            <button type="submit" class="btn btn-primary w-100">Go</button>
        </div>
    </form>

    <?php if (empty($results)): ?>
        <p>No items found matching your criteria.</p>
    <?php else: ?>
        <div class="row row-cols-1 row-cols-md-3 g-4">
            <?php foreach ($results as $item): ?>
                <div class="col">
                    <div class="card h-100">
                        <?php 
                        // Handle image path
                        $imagePath = '';
                        if (!empty($item['image'])) {
                            // If image path doesn't start with 'items/', add it
                            if (strpos($item['image'], 'items/') !== 0) {
                                $imagePath = 'items/' . $item['image'];
                            } else {
                                $imagePath = $item['image'];
                            }
                        } else {
                            $imagePath = 'default.png';
                        }
                        
                        // Check if image file exists
                        $fullImagePath = ROOT_PATH . 'assets/images/' . $imagePath;
                        if (!file_exists($fullImagePath)) {
                            $imagePath = 'default.png';
                        }

                        // Debug information
                        error_log("Image path: " . $imagePath);
                        error_log("Full image path: " . $fullImagePath);
                        error_log("File exists: " . (file_exists($fullImagePath) ? 'yes' : 'no'));
                        ?>
                        <img src="<?= BASE_URL ?>/assets/images/<?= htmlspecialchars($imagePath) ?>" 
                             class="card-img-top" alt="Item Image" 
                             style="height: 200px; object-fit: cover;"
                             onerror="this.onerror=null; this.src='<?= BASE_URL ?>/assets/images/default.png'; console.log('Image failed to load:', this.src);">
                        <div class="card-body">
                            <h5 class="card-title"><?= htmlspecialchars($item['title']) ?></h5>
                            <p class="card-text"><?= htmlspecialchars($item['description']) ?></p>
                            <p><strong>Type:</strong> <?= htmlspecialchars($item['type']) ?></p>
                            <p><strong>Location:</strong> <?= htmlspecialchars($item['location']) ?></p>
                            <p><strong>Date:</strong> <?= date('d M Y', strtotime($item['created_at'])) ?></p>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<?php require_once(ROOT_PATH . 'includes/footer.php'); ?>
