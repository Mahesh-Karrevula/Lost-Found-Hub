const Notification = require('../models/Notification');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get unread notifications for user
// @route   GET /api/notifications/unread
// @access  Private
const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user_id: req.user.id,
      read_at: null,
    }).sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      id: Number(req.params.id),
      user_id: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Create a notification (e.g. from system actions)
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
  try {
    const { user_id, message, type } = req.body;

    if (!user_id || !message || !type) {
      return res.status(400).json({ message: 'user_id, message, and type are required' });
    }

    const notification = new Notification({
      user_id: Number(user_id),
      message,
      type,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      id: Number(req.params.id),
      user_id: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await Notification.deleteOne({ id: Number(req.params.id) });
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadNotifications,
  markNotificationRead,
  createNotification,
  deleteNotification,
};
