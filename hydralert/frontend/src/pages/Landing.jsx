import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🧠', title: 'Smart Risk Scoring', desc: 'AI-powered dehydration risk analysis combines your profile, activity level, and real-time weather data.' },
  { icon: '🌡️', title: 'Weather-Aware',      desc: 'Automatically adjusts recommendations based on local temperature and humidity — stay safe on hot days.' },
  { icon: '👨‍👩‍👧', title: 'Caregiver Mode',   desc: 'Monitor up to 5 dependents — elderly parents, young children, or anyone who needs a helping hand.' },
  { icon: '🔥', title: 'Streak Tracking',    desc: 'Build healthy habits with daily streak counters and gentle nudges to hit your water goals.' },
  { icon: '📊', title: 'Visual History',     desc: 'See your 7-day intake trend at a glance with a clean, readable chart.' },
  { icon: '🔒', title: 'Private & Secure',   desc: 'Your health data stays yours. Encrypted storage, export anytime, delete whenever.' },
];

const DEMO_USERS = [
  { emoji: '👴', name: 'Eleanor', role: 'Elderly user', note: 'Tracks daily intake with caregiver support' },
  { emoji: '🏃', name: 'Marcus',  role: 'Athlete',      note: '3,500 ml goal, 12-day streak' },
  { emoji: '👩', name: 'Sarah',   role: 'Parent',        note: 'Monitors her own intake + daughter Emma' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-28 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ocean-500/30 bg-ocean-500/10 text-ocean-400 text-sm font-display mb-8 animate-fade-in">
            <span>💧</span> Dehydration risk prediction
          </div>

          <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white mb-6 animate-slide-up leading-tight">
            Know before you're<br />
            <span className="text-ocean-400">thirsty</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-slide-up font-body" style={{ animationDelay: '0.1s' }}>
            HydrAlert predicts your personal dehydration risk using your health profile, activity level,
            and live weather — then tells you exactly how much to drink, right now.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Start for free →
            </Link>
            <Link to="/login" className="btn-ghost text-base px-8 py-3">
              Sign in
            </Link>
          </div>

          {/* Demo badge */}
          <p className="mt-6 text-slate-600 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
            No credit card · Free forever · Try our demo accounts below
          </p>
        </div>
      </section>

      {/* ── Risk indicator preview ──────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { score: 15, cat: 'low',      color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-950/30', label: 'Low Risk' },
            { score: 52, cat: 'moderate', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/30', label: 'Moderate' },
            { score: 78, cat: 'high',     color: 'text-red-400',   border: 'border-red-500/30',   bg: 'bg-red-950/30',   label: 'High Risk' },
          ].map(({ score, color, border, bg, label }) => (
            <div key={label} className={`rounded-2xl border ${border} ${bg} p-4`}>
              <div className={`font-display font-extrabold text-3xl ${color}`}>{score}</div>
              <div className="text-slate-400 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16" aria-labelledby="features-heading">
        <h2 id="features-heading" className="font-display font-bold text-3xl text-white text-center mb-12">
          Everything you need to stay hydrated
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="card hover:border-slate-700 transition-colors">
              <span className="text-3xl mb-3 block" aria-hidden="true">{f.icon}</span>
              <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo users ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-16" aria-labelledby="demo-heading">
        <h2 id="demo-heading" className="font-display font-bold text-2xl text-white text-center mb-8">
          Try the demo accounts
        </h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {DEMO_USERS.map(u => (
            <div key={u.name} className="card text-center">
              <span className="text-4xl mb-3 block" aria-hidden="true">{u.emoji}</span>
              <h3 className="font-display font-bold text-white">{u.name}</h3>
              <p className="text-ocean-400 text-sm mb-2">{u.role}</p>
              <p className="text-slate-500 text-xs">{u.note}</p>
            </div>
          ))}
        </div>
        <div className="card bg-slate-900/40 border-slate-700">
          <p className="text-slate-400 text-sm font-mono text-center">
            Login: <span className="text-ocean-400">eleanor@demo.hydralert.app</span> · Password: <span className="text-ocean-400">Demo1234!</span>
          </p>
          <p className="text-slate-600 text-xs text-center mt-1">(also marcus@ and sarah@)</p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display font-extrabold text-4xl text-white mb-4">
          Start tracking today
        </h2>
        <p className="text-slate-400 mb-8">It takes 30 seconds. No hardware needed.</p>
        <Link to="/register" className="btn-primary text-lg px-10 py-4">
          Create free account →
        </Link>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-600 text-sm">
        <p>HydrAlert © 2024 · Built for demo purposes · Not a medical device</p>
      </footer>
    </div>
  );
}
