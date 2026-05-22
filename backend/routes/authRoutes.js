const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  updateUserProfile,
  getCurrentUser,
  getAllUsers,
  getTotalUsers,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/', protect, getAllUsers);
router.route('/profile').get(protect, getCurrentUser).put(protect, updateUserProfile);
router.get('/count', protect, admin, getTotalUsers);

module.exports = router;
