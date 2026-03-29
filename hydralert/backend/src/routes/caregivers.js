const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/caregivers — Link a dependent to the caregiver account
 * Body: { dependentEmail }
 */
router.post('/', protect, async (req, res) => {
  try {
    const { dependentEmail } = req.body;
    if (!dependentEmail) {
      return res.status(400).json({ error: 'dependentEmail is required' });
    }

    if (req.user.caregiverOf.length >= 5) {
      return res.status(400).json({ error: 'Caregiver limit: max 5 dependents' });
    }

    const dependent = await User.findOne({ email: dependentEmail.toLowerCase() });
    if (!dependent) {
      return res.status(404).json({ error: 'No user found with that email' });
    }

    if (String(dependent._id) === String(req.user._id)) {
      return res.status(400).json({ error: 'Cannot add yourself as a dependent' });
    }

    const alreadyLinked = req.user.caregiverOf.map(String).includes(String(dependent._id));
    if (alreadyLinked) {
      return res.status(409).json({ error: 'Dependent already linked' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: { caregiverOf: dependent._id },
      isCaregiver: true
    });

    res.status(201).json({
      message: `${dependent.name} added as a dependent`,
      dependent: dependent.toSafeObject()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/caregivers/dependents — List all dependents' profiles
 */
router.get('/dependents', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('caregiverOf', '-passwordHash');
    res.json({ dependents: user.caregiverOf });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/caregivers/:dependentId — Remove a dependent link
 */
router.delete('/:dependentId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { caregiverOf: req.params.dependentId }
    });
    res.json({ message: 'Dependent removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
