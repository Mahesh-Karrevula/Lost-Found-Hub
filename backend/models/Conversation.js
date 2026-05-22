const mongoose = require('mongoose');
const Counter = require('./Counter');

const conversationSchema = mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  user1_id: {
    type: Number,
    required: true,
  },
  user2_id: {
    type: Number,
    required: true,
  },
  last_message: {
    type: String,
    default: '',
  },
  updated_at: {
    type: String,
    default: () => new Date().toISOString().replace('T', ' ').substring(0, 19),
  }
});

// Pre-save middleware to assign auto-increment id
conversationSchema.pre('save', async function (next) {
  if (this.isNew && !this.id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'conversations',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter.seq;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
