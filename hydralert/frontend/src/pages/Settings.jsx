import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('hydralert_openweather_key') || ''
  );

  const saveApiKey = () => {
    localStorage.setItem('hydralert_openweather_key', apiKey);
    addToast('API key saved locally', 'success');
  };

  const exportData = async () => {
    setExportLoading(true);
    try {
      const res = await api.get('/users/me/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hydralert-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Data exported ✅', 'success');
    } catch {
      addToast('Export failed', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure? This will permanently delete your account and all hydration data. This cannot be undone.'
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await api.delete('/users/me');
      logout();
      navigate('/');
      addToast('Account deleted. Goodbye! 👋', 'info');
    } catch {
      addToast('Failed to delete account', 'error');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in space-y-6">
      <div className="mb-2">
        <h1 className="font-display font-bold text-2xl text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and preferences.</p>
      </div>

      {/* API Key config (demo) */}
      <div className="card space-y-4">
        <h2 className="font-display font-bold text-white border-b border-slate-800 pb-3">
          🌤 Weather API (demo)
        </h2>
        <p className="text-slate-400 text-sm">
          Optionally enter your OpenWeatherMap API key for real weather data.
          Without it, the app uses demo values.
        </p>
        <div>
          <label htmlFor="ow-key" className="label">OpenWeatherMap API key</label>
          <input
            id="ow-key" type="text" value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="input font-mono text-sm"
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={saveApiKey} className="btn-primary">Save key</button>
          <a
            href="https://openweathermap.org/api"
            target="_blank" rel="noopener noreferrer"
            className="btn-ghost text-sm"
          >
            Get free key ↗
          </a>
        </div>
      </div>

      {/* Export data */}
      <div className="card space-y-4">
        <h2 className="font-display font-bold text-white border-b border-slate-800 pb-3">
          📦 Export your data
        </h2>
        <p className="text-slate-400 text-sm">
          Download all your profile and hydration log data as a JSON file.
          Your data belongs to you.
        </p>
        <button onClick={exportData} disabled={exportLoading} className="btn-ghost">
          {exportLoading ? 'Exporting…' : 'Download my data (JSON)'}
        </button>
      </div>

      {/* Account info */}
      <div className="card space-y-3">
        <h2 className="font-display font-bold text-white border-b border-slate-800 pb-3">
          👤 Account
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Name',  user?.name],
            ['Email', user?.email],
            ['Member since', new Date(user?.createdAt || Date.now()).toLocaleDateString()],
            ['Daily goal', `${user?.dailyGoalMl || 2000} ml`],
          ].map(([label, val]) => (
            <div key={label} className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-slate-500 text-xs font-display">{label}</p>
              <p className="text-slate-200 font-display font-bold mt-0.5">{val || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy note */}
      <div className="card border-slate-700/50 bg-slate-900/30 text-sm text-slate-400 space-y-2">
        <h2 className="font-display font-bold text-slate-300">🔒 Privacy & data handling</h2>
        <p>
          HydrAlert stores only the data you provide: your profile and water intake logs.
          Passwords are hashed with bcrypt. No data is sold or shared with third parties.
          You can export or delete all your data at any time from this page.
        </p>
      </div>

      {/* Danger zone */}
      <div className="card border-red-900/40 space-y-4">
        <h2 className="font-display font-bold text-red-400 border-b border-red-900/40 pb-3">
          ⚠️ Danger zone
        </h2>
        <p className="text-slate-400 text-sm">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={deleteAccount}
          disabled={deleting}
          className="px-4 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-950/40 transition-all text-sm font-display"
        >
          {deleting ? 'Deleting…' : 'Delete my account'}
        </button>
      </div>
    </div>
  );
}
