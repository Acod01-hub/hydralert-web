const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Log = require('../models/Log');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/logs — Add water intake log ────────────────
router.post(
  '/',
  protect,
  [
    body('amountMl').isInt({ min: 1, max: 5000 }).withMessage('Amount must be 1–5000 ml'),
    body('timestamp').optional().isISO8601().withMessage('Invalid timestamp'),
    body('note').optional().isString().isLength({ max: 200 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { amountMl, timestamp, note } = req.body;
      const log = await Log.create({
        userId: req.user._id,
        amountMl,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        note: note || ''
      });

      // ─── Update streak ─────────────────────────────────
      await updateStreak(req.user._id);

      res.status(201).json({ log });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── GET /api/logs?start=&end=&userId= ───────────────────
// userId param only allowed for caregivers viewing dependents
router.get(
  '/',
  protect,
  [
    query('start').optional().isISO8601(),
    query('end').optional().isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let targetUserId = req.user._id;

      // Allow caregivers to view dependent logs
      if (req.query.userId && req.query.userId !== String(req.user._id)) {
        const isCaregiverOf = req.user.caregiverOf.map(String).includes(req.query.userId);
        if (!isCaregiverOf) {
          return res.status(403).json({ error: 'Access denied' });
        }
        targetUserId = req.query.userId;
      }

      const filter = { userId: targetUserId };
      if (req.query.start || req.query.end) {
        filter.timestamp = {};
        if (req.query.start) filter.timestamp.$gte = new Date(req.query.start);
        if (req.query.end) filter.timestamp.$lte = new Date(req.query.end);
      }

      const logs = await Log.find(filter).sort({ timestamp: -1 }).limit(200);

      // Compute today's total
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayTotal = logs
        .filter(l => new Date(l.timestamp) >= todayStart)
        .reduce((sum, l) => sum + l.amountMl, 0);

      res.json({ logs, todayTotal });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── DELETE /api/logs/:id ─────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const log = await Log.findOne({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ error: 'Log not found' });
    await log.deleteOne();
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Streak Calculation Helper ─────────────────────────────
async function updateStreak(userId) {
  try {
    const user = await User.findById(userId);
    const todayStr = new Date().toISOString().split('T')[0];

    // Sum today's intake
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const logs = await Log.find({
      userId,
      timestamp: { $gte: todayStart, $lte: todayEnd }
    });
    const todayTotal = logs.reduce((sum, l) => sum + l.amountMl, 0);

    if (todayTotal >= user.dailyGoalMl) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];

      if (user.lastGoalMetDate === yStr || user.lastGoalMetDate === todayStr) {
        // Consecutive — increment streak if not already counted today
        if (user.lastGoalMetDate !== todayStr) {
          user.currentStreakDays += 1;
        }
      } else {
        // Streak broken — restart
        user.currentStreakDays = 1;
      }
      user.lastGoalMetDate = todayStr;
      await user.save();
    }
  } catch (err) {
    // Non-critical; don't fail the request
    console.error('Streak update error:', err.message);
  }
}

module.exports = router;
