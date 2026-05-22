const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Counter = require('./Counter');

const userSchema = mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile_picture: {
    type: String,
    default: null,
  },
  is_admin: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString().replace('T', ' ').substring(0, 19),
  }
});

// Match entered password to hashed/plain password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.password === enteredPassword) {
    return true;
  }
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    return false;
  }
};

// Pre-save middleware to hash password and assign auto-increment id
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    // Only hash password if it looks like plain text and isn't already hashed
    // bcrypt hashes usually start with $2a$, $2y$, or $2b$
    if (!this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  if (this.isNew && !this.id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'users',
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

const User = mongoose.model('User', userSchema);
module.exports = User;
