const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadNotifications,
  markNotificationRead,
  createNotification,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getNotifications).post(createNotification);
router.get('/unread', getUnreadNotifications);
router.put('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

module.exports = router;
