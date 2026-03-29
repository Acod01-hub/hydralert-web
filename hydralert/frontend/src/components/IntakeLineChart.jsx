import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

/**
 * IntakeLineChart — 7-day water intake chart.
 * @param {Array} logs  Raw log array from API
 * @param {number} dailyGoalMl  User's daily goal
 */
export default function IntakeLineChart({ logs = [], dailyGoalMl = 2000 }) {
  const { labels, dailyTotals } = useMemo(() => {
    // Build last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const totals = {};
    logs.forEach(log => {
      const day = log.timestamp.split('T')[0];
      totals[day] = (totals[day] || 0) + log.amountMl;
    });

    return {
      labels: days.map(d => {
        const date = new Date(d + 'T00:00:00');
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      }),
      dailyTotals: days.map(d => totals[d] || 0),
    };
  }, [logs]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Intake (ml)',
        data: dailyTotals,
        borderColor: '#00aaee',
        backgroundColor: 'rgba(0,170,238,0.08)',
        pointBackgroundColor: '#00aaee',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.35,
        fill: true,
      },
      {
        label: `Goal (${dailyGoalMl} ml)`,
        data: Array(7).fill(dailyGoalMl),
        borderColor: '#22c55e',
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#1e293b',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} ml`
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#1e293b' },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: {
        grid: { color: '#1e293b' },
        ticks: { color: '#64748b', callback: v => `${v}ml` }
      }
    }
  };

  return (
    <div style={{ height: 240 }} role="img" aria-label="7-day water intake chart">
      <Line data={data} options={options} />
    </div>
  );
}
