import React from 'react';
import { ToastAction } from '../../types';
import { RotateCcw, X } from 'lucide-react';

interface ToastProps {
  toast: ToastAction | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-900 px-4 py-3 text-neutral-100 shadow-xl border border-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-200">
        <span className="text-sm font-medium leading-tight">{toast.message}</span>
        
        <div className="flex items-center gap-2 shrink-0">
          {toast.actionLabel && toast.onAction && (
            <button
              onClick={() => {
                toast.onAction?.();
                onDismiss();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white dark:bg-neutral-200 dark:hover:bg-neutral-300 dark:text-neutral-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{toast.actionLabel}</span>
            </button>
          )}

          <button
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 dark:text-neutral-500 dark:hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
