const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amountMl: {
    type: Number,
    required: [true, 'Amount in ml is required'],
    min: [1, 'Amount must be positive'],
    max: [5000, 'Single intake cannot exceed 5000ml']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  note: {
    type: String,
    maxlength: 200,
    default: ''
  }
}, {
  timestamps: true
});

// ─── Compound index for efficient per-user date queries ───
logSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);
