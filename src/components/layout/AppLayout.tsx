import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleOutlineRounded,
  CheckCircleRounded,
  RepeatRounded,
  AutoAwesomeRounded,
  SpaOutlined,
  SpaRounded,
  PsychologyOutlined,
  TuneRounded,
} from '../ui/icons';
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
      icon: CheckCircleOutlineRounded,
      activeIcon: CheckCircleRounded,
    },
    {
      id: 1,
      label: t('habitsTab'),
      icon: RepeatRounded,
      activeIcon: AutoAwesomeRounded,
    },
    {
      id: 2,
      label: t('leisureTab'),
      icon: SpaOutlined,
      activeIcon: SpaRounded,
    },
  ];

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F7] relative flex flex-col md:flex-row overflow-x-hidden">
      <AmbientGlow />

      {/* Desktop Floating Glass Nav Rail (Right side in RTL, Left side in LTR) */}
      <aside className="hidden md:flex flex-col items-center justify-between p-6 z-30 shrink-0 sticky top-0 h-screen w-24 border-e border-white/[0.04]">
        {/* Top App Accent Indicator */}
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.09] flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 rounded-full bg-[var(--accent)] shadow-[0_0_14px_var(--accent-glow)] animate-pulse" />
          </div>
        </div>

        {/* Desktop Navigation Rail Buttons */}
        <div className="flex flex-col gap-3 p-2 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl">
          {navItems.map((item) => {
            const isSelected = currentTab === item.id;
            const Icon = isSelected ? item.activeIcon : item.icon;
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
                <Icon style={{ fontSize: 20 }} className={clsx('transition-transform', isSelected && 'scale-110')} />
                <span className="text-[10.5px] font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Rail Actions: Brain Vault & Settings */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => appActions.openVaultSheet()}
            title={t('brainVaultTitle')}
            className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.08] transition-all pressable"
          >
            <PsychologyOutlined style={{ fontSize: 20 }} />
          </button>
          <button
            type="button"
            onClick={() => appActions.openSettingsModal()}
            title={t('settingsTitle')}
            className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.08] transition-all pressable"
          >
            <TuneRounded style={{ fontSize: 20 }} />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area (Constrained for ergonomic readability) */}
      <main className="flex-1 w-full max-w-xl md:max-w-2xl mx-auto px-4 md:px-6 z-10 flex flex-col min-h-screen">
        {children}
      </main>

      {/* Mobile Floating Brain Vault FAB (Only visible on Today tab) */}
      {currentTab === 0 && (
        <div className="md:hidden fixed bottom-[74px] start-4 z-40 animate-fadeIn">
          <Pressable
            onTap={() => appActions.openVaultSheet()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-b from-[#232329] to-[#141418] border border-white/[0.09] shadow-[0_8px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl text-white/70"
          >
            <PsychologyOutlined style={{ fontSize: 18 }} className="text-white/70" />
            <span className="text-[12.5px] font-semibold">{t('brainVaultTitle')}</span>
          </Pressable>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar Matching Flutter _LiquidGlassNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pb-3 pointer-events-none">
        <div className="max-w-[440px] mx-auto pointer-events-auto bg-gradient-to-b from-[#222228] to-[#131317] border border-white/[0.085] rounded-[24px] p-2 backdrop-blur-2xl shadow-[0_18px_40px_rgba(0,0,0,0.7)] flex items-center justify-around gap-1.5">
          {navItems.map((item) => {
            const isSelected = currentTab === item.id;
            const Icon = isSelected ? item.activeIcon : item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => appActions.setCurrentTab(item.id)}
                className={clsx(
                  'flex-1 py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer pressable border',
                  isSelected
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                    : 'bg-transparent text-white/40 border-transparent hover:text-white/60'
                )}
              >
                <Icon style={{ fontSize: 20 }} className={clsx('transition-transform duration-200', isSelected && 'scale-108')} />
                <span className={clsx('text-[11.5px] tracking-tight', isSelected ? 'font-bold' : 'font-medium')}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
