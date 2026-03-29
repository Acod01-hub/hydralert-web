import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const { login, loading }      = useAuth();
  const { addToast }            = useToast();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      addToast('Welcome back! 💧', 'success');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo1234!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3" aria-hidden="true">💧</span>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Sign in to HydrAlert</h1>
          <p className="text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-ocean-400 hover:text-ocean-300 transition-colors">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Demo quick-fill */}
        <div className="card mb-6 bg-slate-900/50">
          <p className="text-slate-400 text-xs font-display mb-3">⚡ Try a demo account</p>
          <div className="flex flex-wrap gap-2">
            {[
              ['eleanor@demo.hydralert.app', 'Eleanor (elderly)'],
              ['marcus@demo.hydralert.app',  'Marcus (athlete)'],
              ['sarah@demo.hydralert.app',   'Sarah (parent)'],
            ].map(([email, label]) => (
              <button
                key={email}
                type="button"
                onClick={() => fillDemo(email)}
                className="text-xs px-3 py-1.5 rounded-lg bg-ocean-500/10 border border-ocean-500/30 text-ocean-400 hover:bg-ocean-500/20 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
          {error && (
            <div role="alert" className="px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="label mb-0">Password</label>
              <Link to="/forgot-password" className="text-xs text-slate-500 hover:text-ocean-400 transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
