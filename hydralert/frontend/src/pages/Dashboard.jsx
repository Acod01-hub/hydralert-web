import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import RiskBadge from '../components/RiskBadge';
import IntakeButtons from '../components/IntakeButtons';
import WeatherCard from '../components/WeatherCard';
import LogsTable from '../components/LogsTable';
import IntakeLineChart from '../components/IntakeLineChart';

export default function Dashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [score, setScore] = useState(null);
  const [loadingScore, setLoadingScore] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      // Fetch last 7 days of logs for chart + today total
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const res = await api.get('/logs', {
        params: { start: sevenDaysAgo.toISOString() }
      });
      setLogs(res.data.logs || []);
      setTodayTotal(res.data.todayTotal || 0);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  const fetchScore = useCallback(async () => {
    setLoadingScore(true);
    try {
      const params = {};
      if (navigator.geolocation) {
        await new Promise(resolve =>
          navigator.geolocation.getCurrentPosition(
            pos => { params.lat = pos.coords.latitude; params.lon = pos.coords.longitude; resolve(); },
            () => resolve()
          )
        );
      }
      const res = await api.get('/score', { params });
      setScore(res.data);
    } catch (err) {
      console.error('Failed to fetch score', err);
    } finally {
      setLoadingScore(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchScore();
  }, [fetchLogs, fetchScore]);

  const handleLogged = () => {
    fetchLogs();
    fetchScore();
  };

  const goalPct = Math.min(Math.round((todayTotal / (user?.dailyGoalMl || 2000)) * 100), 100);
  const streak = user?.currentStreakDays || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Streak badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30">
          <span className="text-xl" aria-hidden="true">🔥</span>
          <div>
            <p className="font-display font-bold text-amber-400 text-lg leading-none">{streak}</p>
            <p className="text-amber-600 text-xs">day streak</p>
          </div>
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Risk score — left column */}
        <div className="lg:col-span-1 space-y-4">
          {loadingScore ? (
            <div className="card animate-pulse flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-slate-800" />
              <div className="h-4 bg-slate-800 rounded w-24" />
              <div className="h-3 bg-slate-800 rounded w-32" />
            </div>
          ) : score ? (
            <RiskBadge
              large
              score={score.score}
              category={score.category}
              recommendedMl={score.recommendedMl}
            />
          ) : (
            <div className="card text-center text-slate-500 text-sm py-8">
              Unable to compute risk score
            </div>
          )}

          {/* Weather */}
          <WeatherCard />
        </div>

        {/* Right columns */}
        <div className="lg:col-span-2 space-y-6">

          {/* Daily progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-white">Today's intake</h2>
              <div className="text-right">
                <span className="font-display font-bold text-ocean-400 text-xl">{todayTotal}</span>
                <span className="text-slate-500 text-sm"> / {user?.dailyGoalMl || 2000} ml</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 mb-2" role="progressbar"
              aria-valuenow={goalPct} aria-valuemin={0} aria-valuemax={100}
              aria-label={`${goalPct}% of daily goal reached`}>
              <div
                className="h-3 rounded-full transition-all duration-700"
                style={{
                  width: `${goalPct}%`,
                  background: goalPct >= 100
                    ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                    : 'linear-gradient(90deg,#0086cc,#00aaee)'
                }}
              />
            </div>
            <p className="text-slate-500 text-xs text-right">{goalPct}% of daily goal</p>
          </div>

          {/* Log water */}
          <div className="card">
            <h2 className="font-display font-bold text-white mb-4">Log water intake</h2>
            <IntakeButtons onLogged={handleLogged} />
          </div>

          {/* 7-day chart */}
          <div className="card">
            <h2 className="font-display font-bold text-white mb-4">7-day trend</h2>
            {loadingLogs ? (
              <div className="h-60 flex items-center justify-center text-slate-600">Loading chart…</div>
            ) : (
              <IntakeLineChart logs={logs} dailyGoalMl={user?.dailyGoalMl || 2000} />
            )}
          </div>

          {/* Recent logs */}
          <div className="card">
            <h2 className="font-display font-bold text-white mb-4">Recent logs</h2>
            <LogsTable
              logs={logs.filter(l => isToday(l.timestamp))}
              onDeleted={handleLogged}
            />
          </div>
        </div>
      </div>

      {/* ── Score breakdown ──────────────────────────────── */}
      {score?.meta && (
        <div className="card">
          <h2 className="font-display font-bold text-white mb-4">Risk breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Last 24h intake',  value: `${score.meta.recentIntakeLast24hMl} ml` },
              { label: 'Daily goal',       value: `${score.meta.dailyGoalMl} ml` },
              { label: 'Temperature',      value: `${score.meta.tempC}°C` },
              { label: 'Humidity',         value: `${score.meta.humidityPct}%` },
            ].map(item => (
              <div key={item.label} className="bg-slate-800/60 rounded-xl p-3">
                <p className="text-slate-500 text-xs font-display">{item.label}</p>
                <p className="font-display font-bold text-slate-200 text-base mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function isToday(ts) {
  const d = new Date(ts);
  const now = new Date();
  return d.getDate() === now.getDate()
    && d.getMonth() === now.getMonth()
    && d.getFullYear() === now.getFullYear();
}
