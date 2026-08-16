import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Repeat,
  Sparkles,
  Flower2,
  BrainCircuit,
  Sliders,
  BarChart3,
  Edit3,
} from 'lucide-react';
import { useAppStore, appActions } from '../../state/useAppStore';
import { AmbientGlow } from './AmbientGlow';
import { clsx } from 'clsx';
import { Pressable } from '../ui/Pressable';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const { currentTab, lang } = useAppStore();

  const navItems = [
    {
      id: 0,
      label: t('tasksTab'),
      icon: CheckCircle2,
    },
    {
      id: 1,
      label: t('habitsTab'),
      icon: Repeat,
    },
    {
      id: 2,
      label: t('leisureTab'),
      icon: Flower2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F7] relative flex flex-col md:flex-row overflow-x-hidden">
      <AmbientGlow />

      {/* Desktop Floating Glass Nav Rail (Left in LTR, Right in RTL) */}
      <aside className="hidden md:flex flex-col items-center justify-between p-6 z-30 shrink-0 sticky top-0 h-screen w-24">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.09] flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]" />
          </div>
        </div>

        {/* Navigation Rail Buttons */}
        <div className="flex flex-col gap-3 p-2 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => appActions.setCurrentTab(item.id)}
                title={item.label}
                className={clsx(
                  'w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer pressable',
                  isSelected
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] shadow-[0_0_15px_var(--accent-glow)]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                )}
              >
                <Icon className={clsx('w-5 h-5 transition-transform', isSelected && 'scale-110')} />
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Rail Actions (Brain Vault & Settings) */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => appActions.openVaultSheet()}
            title={t('brainVaultTitle')}
            className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.08] transition-all pressable"
          >
            <BrainCircuit className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => appActions.openSettingsModal()}
            title={t('settingsTitle')}
            className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.08] transition-all pressable"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area (Constrained for ergonomic readability) */}
      <main className="flex-1 w-full max-w-xl md:max-w-2xl mx-auto px-4 md:px-6 z-10 flex flex-col min-h-screen">
        {children}
      </main>

      {/* Mobile Floating Brain Vault FAB */}
      <div className="md:hidden fixed bottom-[78px] start-4 z-40">
        <Pressable
          onTap={() => appActions.openVaultSheet()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-b from-[#232329] to-[#141418] border border-white/[0.09] shadow-[0_8px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl text-white/70"
        >
          <BrainCircuit className="w-4 h-4 text-white/70" />
          <span className="text-[12.5px] font-semibold">{t('brainVaultTitle')}</span>
        </Pressable>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pb-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto bg-gradient-to-b from-white/[0.072] to-white/[0.030] border border-white/[0.085] rounded-[22px] p-1.5 backdrop-blur-2xl shadow-[0_18px_40px_rgba(0,0,0,0.7)] flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => appActions.setCurrentTab(item.id)}
                className={clsx(
                  'flex-1 py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer pressable',
                  isSelected
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]'
                    : 'text-white/40 border border-transparent'
                )}
              >
                <Icon className={clsx('w-5 h-5 transition-transform', isSelected && 'scale-110')} />
                <span className="text-[11px] font-semibold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
