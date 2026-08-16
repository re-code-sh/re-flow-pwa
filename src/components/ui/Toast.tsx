import React from 'react';
import { useAppStore, appActions } from '../../state/useAppStore';
import { Pressable } from './Pressable';

export const ToastContainer: React.FC = () => {
  const { toasts, lang } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center pointer-events-none px-4 gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-full bg-[#1C1C21]/95 border border-white/[0.085] shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-float transition-all"
        >
          <span className="text-[13px] font-semibold text-[#F5F5F7] text-center">
            {toast.message}
          </span>
          {toast.actionLabel && (
            <Pressable
              onTap={() => {
                toast.onAction?.();
                appActions.removeToast(toast.id);
              }}
              className="px-3 py-1.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[12px] font-bold"
            >
              {toast.actionLabel}
            </Pressable>
          )}
        </div>
      ))}
    </div>
  );
};
