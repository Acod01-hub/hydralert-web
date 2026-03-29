import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile',   label: 'Profile' },
  { to: '/caregiver', label: 'Caregiver', requireCaregiver: true },
  { to: '/settings',  label: 'Settings' },
];

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <span className="text-2xl" aria-hidden="true">💧</span>
          <span className="font-display font-bold text-lg text-white group-hover:text-ocean-400 transition-colors">
            HydrAlert
          </span>
        </Link>

        {/* Desktop links */}
        {user && (
          <ul className="hidden md:flex items-center gap-1" role="list">
            {NAV_LINKS.map(link => {
              if (link.requireCaregiver && !user.isCaregiver) return null;
              const active = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`px-4 py-2 rounded-lg text-sm font-display transition-all duration-150 ${
                      active
                        ? 'bg-ocean-500/20 text-ocean-400'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden md:block text-sm text-slate-500">
                Hi, {user.name?.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="btn-ghost text-sm py-2 px-4">
                Log out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm py-2 px-4">Log in</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Get started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          {user && (
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              <span className="text-xl">{open ? '✕' : '☰'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {open && user && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(link => {
            if (link.requireCaregiver && !user.isCaregiver) return null;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-display transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="px-4 py-3 rounded-lg text-red-400 hover:bg-red-950/30 text-sm font-display text-left transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
