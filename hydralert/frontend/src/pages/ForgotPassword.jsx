import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } catch {
      // Always show success to prevent email enumeration
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3" aria-hidden="true">🔑</span>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Reset your password</h1>
          <p className="text-slate-400 text-sm">
            Enter your email and we'll send a reset link.
          </p>
        </div>

        {sent ? (
          <div className="card text-center space-y-4">
            <span className="text-5xl block" aria-hidden="true">📬</span>
            <h2 className="font-display text-white font-bold text-lg">Check your inbox</h2>
            <p className="text-slate-400 text-sm">
              If <strong className="text-slate-300">{email}</strong> is registered, a reset link has been sent.
              <br /><span className="text-slate-600">(Demo: no actual email is sent.)</span>
            </p>
            <Link to="/login" className="btn-primary inline-flex">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email" type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="you@example.com"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <p className="text-center text-sm">
              <Link to="/login" className="text-slate-500 hover:text-ocean-400 transition-colors">
                ← Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
