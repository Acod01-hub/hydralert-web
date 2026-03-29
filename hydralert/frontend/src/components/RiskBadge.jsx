import React from 'react';

const CONFIG = {
  low:      { label: 'Low Risk',      icon: '✅', color: 'text-green-400',  bg: 'bg-green-950/60  border-green-500/40',  ring: 'ring-green-500/30'  },
  moderate: { label: 'Moderate Risk', icon: '⚠️', color: 'text-amber-400',  bg: 'bg-amber-950/60  border-amber-500/40',  ring: 'ring-amber-500/30'  },
  high:     { label: 'High Risk',     icon: '🔴', color: 'text-red-400',    bg: 'bg-red-950/60    border-red-500/40',    ring: 'ring-red-500/30'    },
};

/**
 * RiskBadge — visually distinct color-coded risk indicator.
 * @param {number} score     0–100
 * @param {string} category  "low" | "moderate" | "high"
 * @param {number} recommendedMl  ml to drink now
 * @param {boolean} large    render the large dashboard variant
 */
export default function RiskBadge({ score = 0, category = 'low', recommendedMl = 250, large = false }) {
  const cfg = CONFIG[category] || CONFIG.low;

  if (large) {
    return (
      <div
        role="status"
        aria-label={`Dehydration risk: ${cfg.label}, score ${score} out of 100`}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-3xl border p-8 ${cfg.bg} ${cfg.ring} ring-4`}
      >
        {/* Animated ring */}
        <span
          className="absolute inset-0 rounded-3xl opacity-20 animate-pulse-ring"
          style={{ background: `radial-gradient(circle, var(--risk-${category}) 0%, transparent 70%)` }}
          aria-hidden="true"
        />

        {/* Score dial */}
        <div className="relative flex flex-col items-center">
          <span className="text-6xl font-display font-bold" style={{ color: `var(--risk-${category})` }}>
            {score}
          </span>
          <span className="text-slate-400 text-sm font-body">/ 100</span>
        </div>

        {/* Icon + label */}
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">{cfg.icon}</span>
          <span className={`font-display font-bold text-xl ${cfg.color}`}>{cfg.label}</span>
        </div>

        {/* Recommendation */}
        <p className="text-center text-slate-300 text-sm max-w-xs">
          Drink <strong className={cfg.color}>{recommendedMl} ml</strong> now to lower your risk
        </p>
      </div>
    );
  }

  // Compact badge
  return (
    <span
      role="status"
      aria-label={`Risk: ${cfg.label}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-display font-600 ${cfg.bg} ${cfg.color}`}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}
