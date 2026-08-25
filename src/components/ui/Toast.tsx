import React, { createContext, useContext, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { ViewTransition } from './ViewTransition';

interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, actionLabel?: string, onAction?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let globalShowToast: ((message: string, actionLabel?: string, onAction?: () => void) => void) | null = null;

export function toast(message: string, actionLabel?: string, onAction?: () => void) {
  if (globalShowToast) {
    globalShowToast(message, actionLabel, onAction);
  }
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentToast, setCurrentToast] = useState<ToastOptions | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showToast = useCallback((message: string, actionLabel?: string, onAction?: () => void) => {
    setCurrentToast({ message, actionLabel, onAction });
    setIsVisible(true);

    const duration = actionLabel ? 5000 : 2500;
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setCurrentToast(null), 300);
    }, duration);
  }, []);

  globalShowToast = showToast;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {currentToast && (
        <div
          className={clsx(
            'fixed top-5 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          )}
        >
          <ViewTransition name="global-toast-pill" share="morph">
            <div className="pointer-events-auto max-w-md mx-4 px-4 py-2.5 rounded-full bg-[#1C1C21]/95 border border-line shadow-2xl backdrop-blur-xl flex items-center gap-3">
              <span className="text-[13px] font-semibold text-ink">{currentToast.message}</span>
              {currentToast.actionLabel && (
                <button
                  type="button"
                  onClick={() => {
                    currentToast.onAction?.();
                    setIsVisible(false);
                  }}
                  className="pressable px-3 py-1 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] text-[12px] font-bold"
                >
                  {currentToast.actionLabel}
                </button>
              )}
            </div>
          </ViewTransition>
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
