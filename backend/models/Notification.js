const mongoose = require('mongoose');
const Counter = require('./Counter');

const notificationSchema = mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  user_id: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  read_at: {
    type: String,
    default: null,
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString().replace('T', ' ').substring(0, 19),
  }
});

// Pre-save middleware to assign auto-increment id
notificationSchema.pre('save', async function (next) {
  if (this.isNew && !this.id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'notifications',
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

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
