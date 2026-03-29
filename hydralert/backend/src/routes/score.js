const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Log = require('../models/Log');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/score?userId=
 * Returns dehydration risk score from ML microservice.
 * Caregivers may pass a dependent's userId.
 */
router.get('/', protect, async (req, res) => {
  try {
    let targetUserId = req.user._id;

    // Caregivers can view dependent scores
    if (req.query.userId && req.query.userId !== String(req.user._id)) {
      const isCaregiverOf = req.user.caregiverOf.map(String).includes(req.query.userId);
      if (!isCaregiverOf) {
        return res.status(403).json({ error: 'Access denied' });
      }
      targetUserId = req.query.userId;
    }

    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // ─── Gather last 24h intake ──────────────────────────
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logs = await Log.find({ userId: targetUserId, timestamp: { $gte: since } });
    const recentIntakeLast24hMl = logs.reduce((s, l) => s + l.amountMl, 0);

    // ─── Get weather from cache/proxy ───────────────────
    let tempC = 25; // Sensible fallback
    let humidityPct = 50;
    const weatherData = req.weatherData; // Injected if available

    if (req.query.lat && req.query.lon) {
      try {
        const weatherRes = await axios.get(
          `${req.protocol}://${req.get('host')}/api/weather`,
          {
            params: { lat: req.query.lat, lon: req.query.lon },
            headers: { Authorization: req.headers.authorization }
          }
        );
        tempC = weatherRes.data.tempC;
        humidityPct = weatherRes.data.humidityPct;
      } catch {
        // Use fallback values silently
      }
    }

    // ─── Call ML Scoring Service ─────────────────────────
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    const mlPayload = {
      age: user.age,
      weightKg: user.weightKg,
      activityLevel: user.activityLevel,
      recentIntakeLast24hMl,
      tempC,
      humidityPct
    };

    let scoreData;
    try {
      const mlRes = await axios.post(`${mlUrl}/score`, mlPayload, { timeout: 5000 });
      scoreData = mlRes.data;
    } catch (mlErr) {
      // Fallback: run the deterministic formula locally if ML service is down
      scoreData = localScoreFormula(mlPayload);
    }

    res.json({
      ...scoreData,
      meta: {
        recentIntakeLast24hMl,
        dailyGoalMl: user.dailyGoalMl,
        tempC,
        humidityPct
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Local fallback scoring formula (same logic as ml-service/app.py).
 * Used when the ML microservice is unavailable.
 */
function localScoreFormula({ age, weightKg, activityLevel, recentIntakeLast24hMl, tempC, humidityPct }) {
  const activityMultipliers = { low: 1.0, medium: 1.3, high: 1.6 };
  const baseNeed = weightKg * 33; // ml/day
  const actMul = activityMultipliers[activityLevel] || 1.0;
  const adjustedNeed = baseNeed * actMul;
  const intakeRatio = Math.min(recentIntakeLast24hMl / adjustedNeed, 1);
  const intakeScore = (1 - intakeRatio) * 50;
  const tempScore = Math.max(0, (tempC - 20) / 20) * 20;
  const humidityScore = Math.max(0, (humidityPct - 40) / 60) * 15;
  const ageScore = age > 65 ? 10 : age < 12 ? 5 : 0;
  let score = Math.round(Math.min(100, intakeScore + tempScore + humidityScore + ageScore));

  let category, recommendedMl;
  if (score < 30) {
    category = 'low';
    recommendedMl = 250;
  } else if (score < 60) {
    category = 'moderate';
    recommendedMl = 500;
  } else {
    category = 'high';
    recommendedMl = 750;
  }

  return { score, category, recommendedMl };
}

module.exports = router;
