'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-neutral-200 bg-white text-neutral-900';
        let iconClass = 'text-blue-600';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-200 bg-white text-neutral-900 shadow-lg shadow-emerald-500/5';
          iconClass = 'text-emerald-600';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-200 bg-white text-neutral-900 shadow-lg shadow-rose-500/5';
          iconClass = 'text-rose-600';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-200 bg-white text-neutral-900 shadow-lg shadow-amber-500/5';
          iconClass = 'text-amber-600';
        } else if (toast.type === 'info') {
          borderClass = 'border-blue-200 bg-white text-neutral-900 shadow-lg shadow-blue-500/5';
          iconClass = 'text-blue-600';
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${borderClass} transition-all duration-200`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClass}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">{toast.title}</p>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{toast.message}</p>
            </div>
            <button
              id={`toast-close-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
