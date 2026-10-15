import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp() as any;
  if (!toast) return null;

  const { message, type = 'success' } = toast;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
      <div
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md pointer-events-auto ${
          type === 'success'
            ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-emerald-500/20'
            : type === 'error'
            ? 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-500/20'
            : 'bg-zinc-900/95 border-amber-500/50 text-amber-200 shadow-amber-500/20'
        }`}
      >
        <div className="shrink-0">
          {type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <Info className="w-5 h-5 text-amber-400" />
          )}
        </div>
        <div className="flex-1 text-sm font-medium leading-snug">
          {message}
        </div>
      </div>
    </div>
  );
};
