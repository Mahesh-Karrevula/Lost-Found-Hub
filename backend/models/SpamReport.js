const mongoose = require('mongoose');
const Counter = require('./Counter');

const spamReportSchema = mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  user_id: {
    type: Number,
    required: true,
  },
  item_id: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString().replace('T', ' ').substring(0, 19),
  },
  updated_at: {
    type: String,
    default: () => new Date().toISOString().replace('T', ' ').substring(0, 19),
  }
});

// Pre-save middleware to assign auto-increment id
spamReportSchema.pre('save', async function (next) {
  if (this.isNew && !this.id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'spam_reports',
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

const SpamReport = mongoose.model('SpamReport', spamReportSchema);
module.exports = SpamReport;
