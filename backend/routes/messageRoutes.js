const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/conversations').get(getConversations).post(getOrCreateConversation);
router.route('/conversations/:id').get(getMessages).post(sendMessage);

module.exports = router;
