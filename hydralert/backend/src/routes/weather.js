const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const { protect } = require('../middleware/auth');

const router = express.Router();
const weatherCache = new NodeCache({ stdTTL: 300 }); // 5-minute cache

/**
 * GET /api/weather?lat=&lon=
 * Proxies OpenWeatherMap, cached for 5 minutes per location.
 */
router.get('/', protect, async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon query params required' });
  }

  // Round to 1 decimal for cache key (avoids cache misses from tiny GPS jitter)
  const cacheKey = `${parseFloat(lat).toFixed(1)},${parseFloat(lon).toFixed(1)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  const apiKey = process.env.OPENWEATHER_KEY;
  if (!apiKey) {
    // Return mock data when no API key is configured (demo mode)
    const mock = { tempC: 28, humidityPct: 65, description: 'Demo weather', city: 'Demo City', cached: false, demo: true };
    weatherCache.set(cacheKey, mock);
    return res.json(mock);
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat, lon, appid: apiKey, units: 'metric' },
      timeout: 8000
    });

    const { main, weather, name } = response.data;
    const weatherData = {
      tempC: Math.round(main.temp),
      humidityPct: main.humidity,
      description: weather[0]?.description || 'Clear',
      city: name,
      cached: false
    };

    weatherCache.set(cacheKey, weatherData);
    res.json(weatherData);
  } catch (err) {
    res.status(502).json({ error: 'Weather service unavailable', detail: err.message });
  }
});

module.exports = router;
