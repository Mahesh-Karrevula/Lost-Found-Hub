const mongoose = require('mongoose');
const Counter = require('./Counter');

const reportSchema = mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  item_id: {
    type: Number,
    required: true,
  },
  reporter_id: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString().replace('T', ' ').substring(0, 19),
  }
});

// Pre-save middleware to assign auto-increment id
reportSchema.pre('save', async function (next) {
  if (this.isNew && !this.id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'reports',
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

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
