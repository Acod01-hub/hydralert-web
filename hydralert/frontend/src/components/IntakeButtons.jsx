import React, { useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const QUICK_AMOUNTS = [150, 250, 500, 750];

/**
 * IntakeButtons — Quick log buttons for common water amounts.
 * @param {function} onLogged — callback after successful log
 */
export default function IntakeButtons({ onLogged }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(null);
  const [custom, setCustom] = useState('');

  const logAmount = async (amountMl) => {
    if (!amountMl || amountMl < 1) return;
    setLoading(amountMl);
    try {
      await api.post('/logs', { amountMl: Number(amountMl) });
      addToast(`Logged ${amountMl} ml 💧`, 'success');
      onLogged?.();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to log intake', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleCustom = (e) => {
    e.preventDefault();
    const val = parseInt(custom, 10);
    if (!val || val < 1 || val > 5000) {
      addToast('Enter a value between 1 and 5000 ml', 'warning');
      return;
    }
    logAmount(val);
    setCustom('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quick amounts */}
      <div className="grid grid-cols-4 gap-2" role="group" aria-label="Quick intake amounts">
        {QUICK_AMOUNTS.map(amt => (
          <button
            key={amt}
            onClick={() => logAmount(amt)}
            disabled={loading !== null}
            aria-label={`Log ${amt} ml of water`}
            className={`flex flex-col items-center justify-center gap-1 py-4 rounded-xl border transition-all duration-150 active:scale-95
              ${loading === amt
                ? 'border-ocean-500 bg-ocean-500/20 text-ocean-400'
                : 'border-slate-700 bg-slate-800/60 hover:border-ocean-500/60 hover:bg-ocean-500/10 text-slate-300 hover:text-ocean-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="text-lg" aria-hidden="true">💧</span>
            <span className="font-display font-bold text-sm">{amt}</span>
            <span className="text-slate-500 text-xs">ml</span>
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <form onSubmit={handleCustom} className="flex gap-2" aria-label="Custom intake amount">
        <label htmlFor="custom-intake" className="sr-only">Custom amount in ml</label>
        <input
          id="custom-intake"
          type="number"
          min="1"
          max="5000"
          placeholder="Custom (ml)"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          className="input flex-1"
          aria-label="Enter custom water amount in millilitres"
        />
        <button
          type="submit"
          disabled={!custom || loading !== null}
          className="btn-primary px-4"
          aria-label="Log custom amount"
        >
          Log
        </button>
      </form>
    </div>
  );
}
