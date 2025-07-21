<footer class="footer mt-auto py-5">
    <div class="container">
        <div class="row">
            <div class="col-md-4 mb-4 mb-md-0">
                <h5 class="text-white mb-3">Lost & Found Hub</h5>
                <p class="text-light">Your community platform for recovering lost items and helping others find their belongings. Together, we make lost items find their way back home.</p>
            </div>
            <div class="col-md-2 mb-4 mb-md-0">
                <h6 class="text-white mb-3">Quick Links</h6>
                <ul class="list-unstyled">
                    <li><a href="<?= BASE_URL ?>" class="text-light text-decoration-none">Home</a></li>
                    <li><a href="<?= BASE_URL ?>pages/search.php" class="text-light text-decoration-none">Search Items</a></li>
                    <li><a href="<?= BASE_URL ?>pages/item/create.php" class="text-light text-decoration-none">Post Item</a></li>
                    <li><a href="<?= BASE_URL ?>pages/dashboard.php" class="text-light text-decoration-none">Dashboard</a></li>
                </ul>
            </div>
            <div class="col-md-2 mb-4 mb-md-0">
                <h6 class="text-white mb-3">Account</h6>
                <ul class="list-unstyled">
                    <li><a href="<?= BASE_URL ?>pages/auth/login.php" class="text-light text-decoration-none">Login</a></li>
                    <li><a href="<?= BASE_URL ?>pages/auth/register.php" class="text-light text-decoration-none">Register</a></li>
                    <li><a href="<?= BASE_URL ?>pages/profile/view.php" class="text-light text-decoration-none">Profile</a></li>
                    <li><a href="<?= BASE_URL ?>pages/messages/inbox.php" class="text-light text-decoration-none">Messages</a></li>
                </ul>
            </div>
            <div class="col-md-4">
                <h6 class="text-white mb-3">Contact Us</h6>
                <ul class="list-unstyled">
                    <li class="text-light mb-2">
                        <i class="fas fa-envelope me-2"></i> support@lostfoundhub.com
                    </li>
                    <li class="text-light mb-2">
                        <i class="fas fa-phone me-2"></i> +1 (555) 123-4567
                    </li>
                    <li class="text-light">
                        <i class="fas fa-map-marker-alt me-2"></i> 123 Recovery Street, Help City
                    </li>
                </ul>
                <div class="mt-3">
                    <a href="#" class="text-light me-3"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="text-light me-3"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="text-light me-3"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="text-light"><i class="fab fa-linkedin-in"></i></a>
                </div>
            </div>
        </div>
        <hr class="my-4 bg-light">
        <div class="row">
            <div class="col-md-6 text-center text-md-start">
                <p class="mb-0 text-light">&copy; <?= date('Y') ?> Lost & Found Hub. All rights reserved.</p>
            </div>
            <div class="col-md-6 text-center text-md-end">
                <a href="#" class="text-light text-decoration-none me-3">Privacy Policy</a>
                <a href="#" class="text-light text-decoration-none me-3">Terms of Service</a>
                <a href="#" class="text-light text-decoration-none">Cookie Policy</a>
            </div>
        </div>
    </div>
</footer>

<!-- Scripts -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Show loading indicator
function showLoading() {
    document.getElementById('loading').classList.remove('d-none');
}

// Hide loading indicator
function hideLoading() {
    document.getElementById('loading').classList.add('d-none');
}

// Add loading indicator to all forms
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', showLoading);
    });
});

// Initialize tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
});
</script>
</body>
</html>
