const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  passwordHash: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    min: 1,
    max: 120,
    default: 30
  },
  weightKg: {
    type: Number,
    min: 1,
    max: 500,
    default: 70
  },
  sex: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  activityLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dailyGoalMl: {
    type: Number,
    default: 2000, // WHO recommended baseline
    min: 500,
    max: 10000
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  isCaregiver: {
    type: Boolean,
    default: false
  },
  // Array of user IDs this account is caregiver for
  caregiverOf: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Streak tracking
  currentStreakDays: {
    type: Number,
    default: 0
  },
  lastGoalMetDate: {
    type: String, // ISO date string YYYY-MM-DD for easy comparison
    default: null
  },
  // Demo account flag
  isDemo: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ─── Hash password before saving ──────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  // passwordHash field actually stores the plain password temporarily
  // and is hashed here before persistence
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// ─── Compare password helper ──────────────────────────────
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ─── Remove sensitive fields from JSON output ─────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
