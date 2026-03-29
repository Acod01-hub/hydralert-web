import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import RiskBadge from '../components/RiskBadge';
import LogsTable from '../components/LogsTable';

export default function CaregiverPanel() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [dependents, setDependents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [depLogs, setDepLogs] = useState([]);
  const [depScore, setDepScore] = useState(null);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDependents(); }, []);

  const fetchDependents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/caregivers/dependents');
      setDependents(res.data.dependents || []);
    } catch {
      addToast('Failed to load dependents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectDependent = async (dep) => {
    setSelected(dep);
    setDepLogs([]);
    setDepScore(null);
    try {
      const [logsRes, scoreRes] = await Promise.all([
        api.get('/logs', { params: { userId: dep._id } }),
        api.get('/score', { params: { userId: dep._id } }),
      ]);
      setDepLogs(logsRes.data.logs || []);
      setDepScore(scoreRes.data);
    } catch {
      addToast('Failed to load dependent data', 'error');
    }
  };

  const addDependent = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    try {
      await api.post('/caregivers', { dependentEmail: email.trim() });
      addToast('Dependent added successfully 🎉', 'success');
      setEmail('');
      fetchDependents();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to add dependent', 'error');
    } finally {
      setAdding(false);
    }
  };

  const removeDependent = async (depId) => {
    if (!confirm('Remove this dependent?')) return;
    try {
      await api.delete(`/caregivers/${depId}`);
      addToast('Dependent removed', 'info');
      if (selected?._id === depId) setSelected(null);
      fetchDependents();
    } catch {
      addToast('Failed to remove dependent', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">Caregiver panel</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor the hydration of up to 5 dependents (read-only access).
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: dependent list */}
        <div className="space-y-4">
          {/* Add dependent */}
          <div className="card">
            <h2 className="font-display font-bold text-white mb-4">Add dependent</h2>
            <form onSubmit={addDependent} className="space-y-3" noValidate>
              <div>
                <label htmlFor="dep-email" className="label">Their email address</label>
                <input
                  id="dep-email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input" placeholder="dependent@example.com"
                />
              </div>
              <button type="submit" disabled={adding || dependents.length >= 5} className="btn-primary w-full">
                {adding ? 'Adding…' : 'Add dependent'}
              </button>
              {dependents.length >= 5 && (
                <p className="text-amber-400 text-xs text-center">Maximum 5 dependents reached</p>
              )}
            </form>
          </div>

          {/* Dependent list */}
          <div className="card">
            <h2 className="font-display font-bold text-white mb-4">
              Dependents <span className="text-slate-500 font-body text-sm">({dependents.length}/5)</span>
            </h2>
            {loading ? (
              <div className="space-y-2">
                {[1,2].map(i => <div key={i} className="h-14 rounded-xl bg-slate-800 animate-pulse" />)}
              </div>
            ) : dependents.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No dependents added yet.</p>
            ) : (
              <ul className="space-y-2" role="list">
                {dependents.map(dep => (
                  <li key={dep._id}>
                    <button
                      onClick={() => selectDependent(dep)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 group ${
                        selected?._id === dep._id
                          ? 'border-ocean-500/50 bg-ocean-500/10 text-ocean-400'
                          : 'border-slate-700 hover:border-slate-600 text-slate-300'
                      }`}
                      aria-current={selected?._id === dep._id ? 'true' : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display font-bold text-sm">{dep.name}</p>
                          <p className="text-slate-500 text-xs">{dep.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); removeDependent(dep._id); }}
                          aria-label={`Remove ${dep.name}`}
                          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 text-xs transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: selected dependent dashboard */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl mb-4" aria-hidden="true">👆</span>
              <p className="text-slate-400 font-display">Select a dependent to view their dashboard</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl text-white">{selected.name}</h2>
                  <p className="text-slate-500 text-sm">
                    Age {selected.age} · {selected.activityLevel} activity · Goal: {selected.dailyGoalMl} ml
                  </p>
                </div>
                {depScore && <RiskBadge category={depScore.category} score={depScore.score} />}
              </div>

              {depScore && (
                <div className="card">
                  <RiskBadge
                    large
                    score={depScore.score}
                    category={depScore.category}
                    recommendedMl={depScore.recommendedMl}
                  />
                </div>
              )}

              <div className="card">
                <h3 className="font-display font-bold text-white mb-4">Recent logs</h3>
                <LogsTable logs={depLogs} readOnly />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
