<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define constants
define('ROOT_PATH', dirname(__DIR__) . '/'); 
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

// Get all items and separate them by type
$allItems = $item->getAllItems();
$lostItems = [];
$foundItems = [];

foreach ($allItems as $i) {
    if ($i['type'] === 'lost') {
        $lostItems[] = $i;
    } else {
        $foundItems[] = $i;
    }
}

// Include header and navigation
include_once(ROOT_PATH . 'includes/header.php');
include_once(ROOT_PATH . 'includes/navigation.php');
?>

<!DOCTYPE html>
<html>
<head>
    <title>Dashboard - Lost & Found Hub</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #4361ee;
            --secondary-color: #3f37c9;
            --accent-color: #4895ef;
            --danger-color: #f72585;
            --success-color: #4cc9f0;
            --light-color: #f8f9fa;
            --dark-color: #212529;
            --gray-color: #6c757d;
            --border-radius: 8px;
            --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            --transition: all 0.3s ease;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f5f7fa;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
        }
        
        .page-header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
            border-radius: 0 0 var(--border-radius) var(--border-radius);
            box-shadow: var(--box-shadow);
        }
        
        .welcome-text {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .section-title {
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .section-title i {
            margin-right: 0.5rem;
        }
        
        .badge {
            font-weight: 500;
            padding: 0.5rem 0.75rem;
            border-radius: 50px;
        }
        
        .item-card {
            border: none;
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--box-shadow);
            transition: var(--transition);
            height: 100%;
            background-color: white;
        }
        
        .item-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .card-img-top {
            height: 200px;
            object-fit: cover;
        }
        
        .card-body {
            padding: 1.5rem;
        }
        
        .card-title {
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--dark-color);
        }
        
        .card-text {
            color: var(--gray-color);
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        
        .item-meta {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1.25rem;
            font-size: 0.85rem;
        }
        
        .item-meta i {
            width: 20px;
            color: var(--primary-color);
        }
        
        .btn-primary {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
            border-radius: 50px;
            padding: 0.5rem 1.25rem;
            font-weight: 500;
            transition: var(--transition);
        }
        
        .btn-primary:hover {
            background-color: var(--secondary-color);
            border-color: var(--secondary-color);
            transform: translateY(-2px);
        }
        
        .btn-success {
            background-color: var(--success-color);
            border-color: var(--success-color);
            border-radius: 50px;
            padding: 0.5rem 1.25rem;
            font-weight: 500;
            transition: var(--transition);
        }
        
        .btn-success:hover {
            background-color: #3aa8d0;
            border-color: #3aa8d0;
            transform: translateY(-2px);
        }
        
        .empty-state {
            background-color: white;
            border-radius: var(--border-radius);
            padding: 2rem;
            text-align: center;
            box-shadow: var(--box-shadow);
        }
        
        .empty-state i {
            font-size: 3rem;
            color: var(--gray-color);
            margin-bottom: 1rem;
        }
        
        .empty-state p {
            color: var(--gray-color);
            font-size: 1.1rem;
        }
        
        .section-container {
            background-color: white;
            border-radius: var(--border-radius);
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: var(--box-shadow);
        }
    </style>
</head>
<body>
    <div class="page-header">
        <div class="container">
            <div>
                <h1 class="welcome-text">Welcome, <?= htmlspecialchars($_SESSION['username']) ?></h1>
                <p class="mb-0">Manage and track your lost and found items</p>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="row">
            <!-- Lost Items Section - Takes up 2/3 of the width -->
            <div class="col-md-8">
                <div class="section-container">
                    <h3 class="section-title">
                        <span><i class="fas fa-search text-danger"></i> Lost Items</span>
                        <span class="badge bg-danger"><?= count($lostItems) ?></span>
                    </h3>
                    
                    <?php if ($lostItems): ?>
                        <div class="row g-4">
                            <?php foreach ($lostItems as $i): ?>
                                <div class="col-md-6">
                                    <div class="item-card">
                                        <?php if (!empty($i['image']) && file_exists(ROOT_PATH . 'assets/images/' . $i['image'])): ?>
                                            <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($i['image']) ?>" 
                                                 class="card-img-top" 
                                                 alt="<?= htmlspecialchars($i['title']) ?>">
                                        <?php endif; ?>
                                        <div class="card-body">
                                            <h5 class="card-title"><?= htmlspecialchars($i['title']) ?></h5>
                                            <p class="card-text"><?= htmlspecialchars(substr($i['description'], 0, 80)) ?>...</p>
                                            <div class="item-meta">
                                                <div><i class="fas fa-map-marker-alt"></i> <?= htmlspecialchars($i['location']) ?></div>
                                                <div><i class="fas fa-user"></i> Posted by <strong><?= htmlspecialchars($i['username']) ?></strong></div>
                                            </div>
                                            <a href="<?= BASE_URL ?>pages/item/view.php?id=<?= $i['id'] ?>" class="btn btn-primary w-100">
                                                <i class="fas fa-eye me-2"></i> View Details
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php else: ?>
                        <div class="empty-state">
                            <i class="fas fa-search"></i>
                            <p>No lost items found. Be the first to post a lost item!</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Found Items Section - Takes up 1/3 of the width -->
            <div class="col-md-4">
                <div class="section-container">
                    <h3 class="section-title">
                        <span><i class="fas fa-hand-holding text-success"></i> Found Items</span>
                        <span class="badge bg-success"><?= count($foundItems) ?></span>
                    </h3>
                    
                    <?php if ($foundItems): ?>
                        <div class="row g-4">
                            <?php foreach ($foundItems as $i): ?>
                                <div class="col-12">
                                    <div class="item-card">
                                        <?php if (!empty($i['image']) && file_exists(ROOT_PATH . 'assets/images/' . $i['image'])): ?>
                                            <img src="<?= BASE_URL ?>assets/images/<?= htmlspecialchars($i['image']) ?>" 
                                                 class="card-img-top" 
                                                 alt="<?= htmlspecialchars($i['title']) ?>">
                                        <?php endif; ?>
                                        <div class="card-body">
                                            <h5 class="card-title"><?= htmlspecialchars($i['title']) ?></h5>
                                            <p class="card-text"><?= htmlspecialchars(substr($i['description'], 0, 80)) ?>...</p>
                                            <div class="item-meta">
                                                <div><i class="fas fa-map-marker-alt"></i> <?= htmlspecialchars($i['location']) ?></div>
                                                <div><i class="fas fa-user"></i> Posted by <strong><?= htmlspecialchars($i['username']) ?></strong></div>
                                            </div>
                                            <a href="<?= BASE_URL ?>pages/item/view.php?id=<?= $i['id'] ?>" class="btn btn-primary w-100">
                                                <i class="fas fa-eye me-2"></i> View Details
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php else: ?>
                        <div class="empty-state">
                            <i class="fas fa-hand-holding"></i>
                            <p>No found items found. Be the first to post a found item!</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

<?php include_once(ROOT_PATH . 'includes/footer.php'); ?>
