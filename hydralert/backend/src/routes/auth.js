const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken, protect } = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/auth/register ──────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      // passwordHash field stores plain password; pre-save hook hashes it
      const user = await User.create({ name, email, passwordHash: password });
      const token = signToken(user._id);

      res.status(201).json({ token, user: user.toSafeObject() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = signToken(user._id);
      res.json({ token, user: user.toSafeObject() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── POST /api/auth/forgot-password ──────────────────────
// Simulated: in production, send a reset email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Always return 200 to prevent email enumeration attacks
  res.json({
    message: 'If that email exists, a reset link has been sent (demo: no email sent).',
    // Demo only: return a short-lived token for testing
    ...(process.env.NODE_ENV !== 'production' && user
      ? { resetToken: signToken(user._id) }
      : {})
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

module.exports = router;
