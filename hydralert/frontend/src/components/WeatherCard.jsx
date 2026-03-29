import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const getWeatherIcon = (desc = '') => {
  const d = desc.toLowerCase();
  if (d.includes('rain') || d.includes('drizzle')) return '🌧️';
  if (d.includes('storm') || d.includes('thunder')) return '⛈️';
  if (d.includes('snow')) return '❄️';
  if (d.includes('cloud')) return '☁️';
  if (d.includes('fog') || d.includes('mist')) return '🌫️';
  return '☀️';
};

const getTempColor = (tempC) => {
  if (tempC >= 38) return 'text-red-400';
  if (tempC >= 30) return 'text-amber-400';
  if (tempC >= 20) return 'text-green-400';
  return 'text-ocean-400';
};

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      fetchWeather(28.6, 77.2); // Default: New Delhi
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      ()  => fetchWeather(28.6, 77.2)
    );
  }, []);

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await api.get('/weather', { params: { lat, lon } });
      setWeather(res.data);
    } catch {
      setError('Weather unavailable');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700 rounded w-2/3" />
          <div className="h-3 bg-slate-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-slate-700 text-slate-500 text-sm flex items-center gap-2">
        <span>🌐</span> {error}
      </div>
    );
  }

  const icon = getWeatherIcon(weather.description);
  const tempColor = getTempColor(weather.tempC);

  return (
    <div className="card flex items-center justify-between gap-4" aria-label="Current weather conditions">
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">{icon}</span>
        <div>
          <p className="text-slate-400 text-xs font-display uppercase tracking-wider">
            {weather.city || 'Your location'} {weather.demo && '(demo)'}
          </p>
          <p className={`font-display font-bold text-2xl ${tempColor}`}>
            {weather.tempC}°C
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-slate-400 text-xs mb-1 capitalize">{weather.description}</p>
        <div className="flex items-center justify-end gap-1 text-ocean-400 text-sm font-mono">
          <span aria-hidden="true">💧</span>
          <span>{weather.humidityPct}% humidity</span>
        </div>
        {weather.tempC >= 30 && (
          <p className="text-amber-400 text-xs mt-1 font-display">⚠ High heat — drink more!</p>
        )}
      </div>
    </div>
  );
}
