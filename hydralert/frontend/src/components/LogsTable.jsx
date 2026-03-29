import React from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });

/**
 * LogsTable — Displays recent hydration logs with delete option.
 */
export default function LogsTable({ logs = [], onDeleted, readOnly = false }) {
  const { addToast } = useToast();

  const handleDelete = async (id) => {
    try {
      await api.delete(`/logs/${id}`);
      addToast('Log removed', 'info');
      onDeleted?.();
    } catch {
      addToast('Failed to remove log', 'error');
    }
  };

  if (!logs.length) {
    return (
      <div className="text-center py-10 text-slate-500 text-sm">
        <p className="text-3xl mb-2" aria-hidden="true">🫗</p>
        No logs yet today. Start tracking your intake!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" role="region" aria-label="Hydration logs">
      <table className="w-full text-sm" aria-label="Water intake history">
        <thead>
          <tr className="text-left text-slate-500 font-display text-xs uppercase tracking-wider border-b border-slate-800">
            <th scope="col" className="pb-3 pr-4">Time</th>
            <th scope="col" className="pb-3 pr-4">Date</th>
            <th scope="col" className="pb-3 pr-4 text-right">Amount</th>
            {!readOnly && <th scope="col" className="pb-3 text-right">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {logs.slice(0, 20).map(log => (
            <tr key={log._id} className="hover:bg-slate-800/30 transition-colors group">
              <td className="py-3 pr-4 font-mono text-slate-400">{fmtTime(log.timestamp)}</td>
              <td className="py-3 pr-4 text-slate-500">{fmtDate(log.timestamp)}</td>
              <td className="py-3 pr-4 text-right">
                <span className="font-display font-bold text-ocean-400">{log.amountMl}</span>
                <span className="text-slate-500 ml-1">ml</span>
              </td>
              {!readOnly && (
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleDelete(log._id)}
                    aria-label={`Delete log of ${log.amountMl} ml`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400 text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
