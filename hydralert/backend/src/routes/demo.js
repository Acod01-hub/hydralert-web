const express = require('express');
const { seedDemoData } = require('../seed');

const router = express.Router();

/**
 * GET /api/demo/seed
 * Seeds demo users (only available in non-production environments).
 */
router.get('/seed', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Demo seeding not available in production' });
  }

  try {
    const result = await seedDemoData();
    res.json({ message: 'Demo data seeded successfully', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
