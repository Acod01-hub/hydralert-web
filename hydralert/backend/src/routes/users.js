const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/users/me ────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// ─── PUT /api/users/me ────────────────────────────────────
router.put(
  '/me',
  protect,
  [
    body('name').optional().trim().notEmpty(),
    body('age').optional().isInt({ min: 1, max: 120 }),
    body('weightKg').optional().isFloat({ min: 1, max: 500 }),
    body('sex').optional().isIn(['male', 'female', 'other']),
    body('activityLevel').optional().isIn(['low', 'medium', 'high']),
    body('dailyGoalMl').optional().isInt({ min: 500, max: 10000 }),
    body('timezone').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const allowed = ['name', 'age', 'weightKg', 'sex', 'activityLevel', 'dailyGoalMl', 'timezone'];
      const updates = {};
      allowed.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      );

      res.json({ user: user.toSafeObject() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── DELETE /api/users/me ─────────────────────────────────
router.delete('/me', protect, async (req, res) => {
  try {
    const Log = require('../models/Log');
    await Log.deleteMany({ userId: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account and all associated data deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/users/me/export ────────────────────────────
// Export all personal data as JSON (GDPR-friendly)
router.get('/me/export', protect, async (req, res) => {
  try {
    const Log = require('../models/Log');
    const logs = await Log.find({ userId: req.user._id }).sort({ timestamp: 1 });
    res.json({
      user: req.user.toSafeObject(),
      logs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
