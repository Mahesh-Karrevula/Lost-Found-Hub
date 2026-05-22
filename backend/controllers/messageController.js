const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get user's conversations list
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id; // the integer ID

    const conversations = await Conversation.find({
      $or: [{ user1_id: userId }, { user2_id: userId }],
    }).sort({ updated_at: -1 });

    const results = [];
    for (const c of conversations) {
      const otherUserId = c.user1_id === userId ? c.user2_id : c.user1_id;
      const otherUser = await User.findOne({ id: otherUserId });

      results.push({
        id: c.id,
        created_at: c.updated_at,
        other_user_id: otherUserId,
        username: otherUser ? otherUser.username : 'Unknown',
        profile_picture: otherUser ? otherUser.profile_picture : null,
        last_message: c.last_message || '',
        last_message_time: c.updated_at,
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get or create conversation between current user and another user
// @route   POST /api/messages/conversations
// @access  Private
const getOrCreateConversation = async (req, res) => {
  try {
    const userId1 = req.user.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: 'Other user ID is required' });
    }

    const userId2 = Number(otherUserId);

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      $or: [
        { user1_id: userId1, user2_id: userId2 },
        { user1_id: userId2, user2_id: userId1 },
      ],
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        user1_id: userId1,
        user2_id: userId2,
        last_message: '',
      });
      await conversation.save();
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get message history for a conversation
// @route   GET /api/messages/conversations/:id
// @access  Private
const getMessages = async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const userId = req.user.id;

    // Verify user belongs to conversation
    const conversation = await Conversation.findOne({
      id: conversationId,
      $or: [{ user1_id: userId }, { user2_id: userId }],
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }

    const messages = await Message.find({ conversation_id: conversationId }).sort({ sent_at: 1 });

    const results = [];
    for (const m of messages) {
      const sender = await User.findOne({ id: m.sender_id });
      results.push({
        ...m.toObject(),
        content: m.message, // for view compatibility
        username: sender ? sender.username : 'Unknown',
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/messages/conversations/:id
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const senderId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    // Verify conversation exists and sender is part of it
    const conversation = await Conversation.findOne({
      id: conversationId,
      $or: [{ user1_id: senderId }, { user2_id: senderId }],
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Not authorized to send messages to this conversation' });
    }

    const receiverId = conversation.user1_id === senderId ? conversation.user2_id : conversation.user1_id;

    // Create the message
    const message = new Message({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: content,
    });

    await message.save();

    // Update conversation last message and timestamp
    conversation.last_message = content;
    conversation.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
};
