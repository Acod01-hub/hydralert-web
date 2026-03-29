import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// ─── Toast UI ─────────────────────────────────────────────
const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: '💧' };
const COLORS = {
  success: 'border-green-500/50 bg-green-950/80',
  error:   'border-red-500/50 bg-red-950/80',
  warning: 'border-amber-500/50 bg-amber-950/80',
  info:    'border-ocean-500/50 bg-ocean-950/80',
};

function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          role="alert"
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md
            text-sm text-slate-100 shadow-xl animate-slide-up cursor-pointer ${COLORS[t.type] || COLORS.info}`}
          onClick={() => onRemove(t.id)}
        >
          <span className="text-lg leading-none mt-0.5">{ICONS[t.type]}</span>
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
