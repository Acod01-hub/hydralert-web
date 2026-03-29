import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const result = await register(form.name.trim(), form.email, form.password);
    if (result.success) {
      addToast('Account created! Welcome to HydrAlert 💧', 'success');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3" aria-hidden="true">💧</span>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Create your account</h1>
          <p className="text-slate-400 text-sm">
            Already have one?{' '}
            <Link to="/login" className="text-ocean-400 hover:text-ocean-300 transition-colors">Sign in</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
          {error && (
            <div role="alert" className="px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input id="name" type="text" autoComplete="name" required
              value={form.name} onChange={set('name')} className="input" placeholder="Jane Smith" />
          </div>

          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input id="email" type="email" autoComplete="email" required
              value={form.email} onChange={set('email')} className="input" placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" autoComplete="new-password" required
              value={form.password} onChange={set('password')} className="input" placeholder="At least 6 characters" />
          </div>

          <div>
            <label htmlFor="confirm" className="label">Confirm password</label>
            <input id="confirm" type="password" autoComplete="new-password" required
              value={form.confirm} onChange={set('confirm')} className="input" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating account…' : 'Create account →'}
          </button>

          <p className="text-center text-slate-600 text-xs">
            By signing up you agree to our{' '}
            <span className="text-slate-500">Terms of Service</span> and{' '}
            <span className="text-slate-500">Privacy Policy</span>.
          </p>
        </form>
      </div>
    </div>
  );
}
