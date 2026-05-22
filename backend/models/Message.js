const mongoose = require('mongoose');
const Counter = require('./Counter');

const messageSchema = mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  conversation_id: {
    type: Number,
    required: true,
  },
  sender_id: {
    type: Number,
    required: true,
  },
  receiver_id: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sent_at: {
    type: String,
    default: () => new Date().toISOString().replace('T', ' ').substring(0, 19),
  }
});

// Pre-save middleware to assign auto-increment id
messageSchema.pre('save', async function (next) {
  if (this.isNew && !this.id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'messages',
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

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
