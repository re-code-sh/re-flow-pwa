import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions | string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((options: ToastOptions | string) => {
    const opt = typeof options === 'string' ? { message: options } : options;
    setToast(opt);
    setVisible(true);

    const duration = opt.duration || (opt.actionLabel ? 5000 : 2600);
    setTimeout(() => {
      setVisible(false);
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && visible && (
        <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-full bg-[#1C1C21] border border-glass-line px-5 py-2.5 shadow-toast animate-slide-down-fade max-w-[90vw]'
            )}
          >
            <span className="text-[13px] font-medium text-ink truncate">{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  setVisible(false);
                }}
                className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[12px] font-bold text-[var(--color-accent)] hover:brightness-110 active:scale-95 transition-transform"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
