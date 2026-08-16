import { useState, useEffect } from 'react';
import { AppAccentCode, AppLanguage, Habit } from '../core/types';
import { applyAccentTheme, DEFAULT_ACCENT } from '../core/theme';
import { setAppLanguage } from '../i18n';

export interface ToastItem {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export interface TaskEditData {
  taskId: string;
  title: string;
  isBoulder: boolean;
  reminderTime: number | null;
}

interface AppStoreState {
  currentTab: number; // 0: today, 1: habits, 2: leisure, 3: vault
  accent: AppAccentCode;
  lang: AppLanguage;
  isOnboarded: boolean;
  isMorningWizardOpen: boolean;
  isEveningModalOpen: boolean;
  isVaultSheetOpen: boolean;
  isSettingsModalOpen: boolean;
  isStatsModalOpen: boolean;
  isWeeklyReviewModalOpen: boolean;
  isFocusScreenOpen: boolean;
  isHabitEditorOpen: boolean;
  editingHabit: Habit | null;
  isFrictionModalOpen: boolean;
  frictionHabit: Habit | null;
  isTaskEditModalOpen: boolean;
  editingTask: TaskEditData | null;
  toasts: ToastItem[];
}

let globalState: AppStoreState = {
  currentTab: 0,
  accent: (localStorage.getItem('app_accent') as AppAccentCode) || DEFAULT_ACCENT,
  lang: (localStorage.getItem('app_language') as AppLanguage) || 'fa',
  isOnboarded: localStorage.getItem('onboarded_v1') === 'true',
  isMorningWizardOpen: false,
  isEveningModalOpen: false,
  isVaultSheetOpen: false,
  isSettingsModalOpen: false,
  isStatsModalOpen: false,
  isWeeklyReviewModalOpen: false,
  isFocusScreenOpen: false,
  isHabitEditorOpen: false,
  editingHabit: null,
  isFrictionModalOpen: false,
  frictionHabit: null,
  isTaskEditModalOpen: false,
  editingTask: null,
  toasts: [],
};

// Initial theme apply
applyAccentTheme(globalState.accent);

const listeners = new Set<() => void>();

function updateStore(updater: (prev: AppStoreState) => AppStoreState) {
  globalState = updater(globalState);
  listeners.forEach((l) => l());
}

export function useAppStore() {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    const listener = () => setState(globalState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}

export const appActions = {
  setCurrentTab: (tab: number) => {
    updateStore((s) => ({ ...s, currentTab: tab }));
  },
  setAccent: (accent: AppAccentCode) => {
    localStorage.setItem('app_accent', accent);
    applyAccentTheme(accent);
    updateStore((s) => ({ ...s, accent }));
  },
  setLanguage: (lang: AppLanguage) => {
    setAppLanguage(lang);
    updateStore((s) => ({ ...s, lang }));
  },
  toggleLanguage: () => {
    const next = globalState.lang === 'fa' ? 'en' : 'fa';
    setAppLanguage(next);
    updateStore((s) => ({ ...s, lang: next }));
  },
  setOnboarded: (val: boolean) => {
    localStorage.setItem('onboarded_v1', val ? 'true' : 'false');
    updateStore((s) => ({ ...s, isOnboarded: val }));
  },
  openMorningWizard: () => updateStore((s) => ({ ...s, isMorningWizardOpen: true })),
  closeMorningWizard: () => updateStore((s) => ({ ...s, isMorningWizardOpen: false })),
  openEveningModal: () => updateStore((s) => ({ ...s, isEveningModalOpen: true })),
  closeEveningModal: () => updateStore((s) => ({ ...s, isEveningModalOpen: false })),
  openVaultSheet: () => updateStore((s) => ({ ...s, isVaultSheetOpen: true })),
  closeVaultSheet: () => updateStore((s) => ({ ...s, isVaultSheetOpen: false })),
  openSettingsModal: () => updateStore((s) => ({ ...s, isSettingsModalOpen: true })),
  closeSettingsModal: () => updateStore((s) => ({ ...s, isSettingsModalOpen: false })),
  openStatsModal: () => updateStore((s) => ({ ...s, isStatsModalOpen: true })),
  closeStatsModal: () => updateStore((s) => ({ ...s, isStatsModalOpen: false })),
  openWeeklyReviewModal: () => updateStore((s) => ({ ...s, isWeeklyReviewModalOpen: true })),
  closeWeeklyReviewModal: () => updateStore((s) => ({ ...s, isWeeklyReviewModalOpen: false })),
  openFocusScreen: () => updateStore((s) => ({ ...s, isFocusScreenOpen: true })),
  closeFocusScreen: () => updateStore((s) => ({ ...s, isFocusScreenOpen: false })),
  openHabitEditor: (habit?: Habit | null) =>
    updateStore((s) => ({ ...s, isHabitEditorOpen: true, editingHabit: habit || null })),
  closeHabitEditor: () =>
    updateStore((s) => ({ ...s, isHabitEditorOpen: false, editingHabit: null })),
  openFrictionModal: (habit: Habit) =>
    updateStore((s) => ({ ...s, isFrictionModalOpen: true, frictionHabit: habit })),
  closeFrictionModal: () =>
    updateStore((s) => ({ ...s, isFrictionModalOpen: false, frictionHabit: null })),
  openTaskEditModal: (data: TaskEditData) =>
    updateStore((s) => ({ ...s, isTaskEditModalOpen: true, editingTask: data })),
  closeTaskEditModal: () =>
    updateStore((s) => ({ ...s, isTaskEditModalOpen: false, editingTask: null })),
  showToast: (message: string, options?: { actionLabel?: string; onAction?: () => void; duration?: number }) => {
    const id = String(Date.now() + Math.random());
    const item: ToastItem = {
      id,
      message,
      actionLabel: options?.actionLabel,
      onAction: options?.onAction,
      duration: options?.duration || (options?.actionLabel ? 5000 : 2500),
    };
    updateStore((s) => ({ ...s, toasts: [...s.toasts, item] }));
    setTimeout(() => {
      updateStore((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));
    }, item.duration);
  },
  removeToast: (id: string) => {
    updateStore((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));
  },
};
