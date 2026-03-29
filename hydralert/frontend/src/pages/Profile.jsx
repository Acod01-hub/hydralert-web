import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const ACTIVITY_OPTIONS = [
  { value: 'low',    label: '🚶 Low — mostly sedentary' },
  { value: 'medium', label: '🏃 Medium — moderate exercise' },
  { value: 'high',   label: '💪 High — intense daily training' },
];

const SEX_OPTIONS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other / Prefer not to say' },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name:          user?.name          || '',
    age:           user?.age           || 30,
    weightKg:      user?.weightKg      || 70,
    sex:           user?.sex           || 'other',
    activityLevel: user?.activityLevel || 'medium',
    dailyGoalMl:   user?.dailyGoalMl   || 2000,
    timezone:      user?.timezone      || Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me', {
        ...form,
        age:         Number(form.age),
        weightKg:    Number(form.weightKg),
        dailyGoalMl: Number(form.dailyGoalMl),
      });
      updateUser(res.data.user);
      addToast('Profile updated ✅', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Auto-calculate recommended daily goal
  const calcGoal = () => {
    const base = Number(form.weightKg) * 33;
    const multipliers = { low: 1.0, medium: 1.3, high: 1.6 };
    const goal = Math.round(base * (multipliers[form.activityLevel] || 1.0));
    setForm(f => ({ ...f, dailyGoalMl: goal }));
    addToast(`Recommended goal set to ${goal} ml`, 'info');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">Your profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          Accurate profile data improves your dehydration risk score.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Personal info */}
        <div className="card space-y-5">
          <h2 className="font-display font-bold text-white border-b border-slate-800 pb-3">
            Personal information
          </h2>

          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input id="name" type="text" value={form.name} onChange={set('name')} className="input" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="label">Age (years)</label>
              <input id="age" type="number" min="1" max="120"
                value={form.age} onChange={set('age')} className="input" />
            </div>
            <div>
              <label htmlFor="weight" className="label">Weight (kg)</label>
              <input id="weight" type="number" min="1" max="500" step="0.1"
                value={form.weightKg} onChange={set('weightKg')} className="input" />
            </div>
          </div>

          <div>
            <label htmlFor="sex" className="label">Biological sex</label>
            <select id="sex" value={form.sex} onChange={set('sex')} className="input">
              {SEX_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Activity & goal */}
        <div className="card space-y-5">
          <h2 className="font-display font-bold text-white border-b border-slate-800 pb-3">
            Activity & hydration goal
          </h2>

          <div>
            <label htmlFor="activity" className="label">Activity level</label>
            <select id="activity" value={form.activityLevel} onChange={set('activityLevel')} className="input">
              {ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="goal" className="label mb-0">Daily water goal (ml)</label>
              <button type="button" onClick={calcGoal}
                className="text-xs text-ocean-400 hover:text-ocean-300 transition-colors font-display">
                Auto-calculate
              </button>
            </div>
            <input id="goal" type="number" min="500" max="10000" step="50"
              value={form.dailyGoalMl} onChange={set('dailyGoalMl')} className="input" />
            <p className="text-slate-600 text-xs mt-1">WHO recommends ~33 ml × body weight per day</p>
          </div>

          <div>
            <label htmlFor="timezone" className="label">Timezone</label>
            <input id="timezone" type="text" value={form.timezone} onChange={set('timezone')} className="input" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
