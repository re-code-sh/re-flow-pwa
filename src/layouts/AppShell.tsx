import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TodayScreen } from '../views/today/TodayScreen';
import { HabitsView } from '../views/HabitsView';
import { LeisureView } from '../views/LeisureView';
import { SettingsView } from '../views/SettingsView';
import { SettingsSheet } from '../views/settings/SettingsSheet';
import { BrainDump } from '../components/BrainDump';
import { clsx } from 'clsx';

// Material Icons
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';

export const AppShell: React.FC = () => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<'tasks' | 'habits' | 'leisure' | 'settings'>('tasks');
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

  const handleOpenSettings = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileSettingsOpen(true);
    } else {
      setCurrentTab('settings');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink relative selection:bg-[var(--accent-subtle)] selection:text-[var(--accent)]">
      {/* ================= DESKTOP & TABLET DETACHED FLOATING GLASS RAIL (>= 768px) ================= */}
      <aside
        className="hidden md:flex fixed start-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2 p-2 rounded-[26px] bg-[var(--accent-tint-subtle)]/90 backdrop-blur-2xl border border-[var(--accent-border-tint)] transition-all duration-300"
        style={{
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 35px -10px var(--accent-subtle)',
        }}
      >
        {/* Brand App Icon Button */}
        <button
          type="button"
          onClick={() => setCurrentTab('tasks')}
          className="w-11 h-11 rounded-[18px] bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] flex items-center justify-center shadow-accent-sm-glow transition-all hover:scale-105"
          title={t('appTitle')}
        >
          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 24, color: 'var(--accent-ink, #1C1207)' }} />
        </button>

        <div className="w-6 h-[1px] bg-white/10 my-1" />

        {/* 4 Core Navigation Tabs on Desktop */}
        <nav className="flex flex-col gap-1.5">
          {/* Tab 1: Tasks */}
          <button
            type="button"
            onClick={() => setCurrentTab('tasks')}
            className={clsx(
              'pressable flex flex-col items-center justify-center w-14 h-14 rounded-[18px] text-[11px] transition-all gap-1',
              currentTab === 'tasks'
                ? 'bg-[var(--accent-tint-active)] text-[var(--accent)] border border-[var(--accent-border-active)] font-bold shadow-sm'
                : 'text-ink-3 hover:text-ink-2 hover:bg-white/[0.04]'
            )}
            title={t('tasksTab')}
          >
            {currentTab === 'tasks' ? (
              <CheckCircleRoundedIcon sx={{ fontSize: 22 }} />
            ) : (
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 22 }} />
            )}
            <span className="text-[10.5px] leading-none">{t('tasksTab')}</span>
          </button>

          {/* Tab 2: Habits */}
          <button
            type="button"
            onClick={() => setCurrentTab('habits')}
            className={clsx(
              'pressable flex flex-col items-center justify-center w-14 h-14 rounded-[18px] text-[11px] transition-all gap-1',
              currentTab === 'habits'
                ? 'bg-[var(--accent-tint-active)] text-[var(--accent)] border border-[var(--accent-border-active)] font-bold shadow-sm'
                : 'text-ink-3 hover:text-ink-2 hover:bg-white/[0.04]'
            )}
            title={t('habitsTab')}
          >
            {currentTab === 'habits' ? (
              <AutoAwesomeRoundedIcon sx={{ fontSize: 22 }} />
            ) : (
              <RepeatRoundedIcon sx={{ fontSize: 22 }} />
            )}
            <span className="text-[10.5px] leading-none">{t('habitsTab')}</span>
          </button>

          {/* Tab 3: Leisure */}
          <button
            type="button"
            onClick={() => setCurrentTab('leisure')}
            className={clsx(
              'pressable flex flex-col items-center justify-center w-14 h-14 rounded-[18px] text-[11px] transition-all gap-1',
              currentTab === 'leisure'
                ? 'bg-[var(--accent-tint-active)] text-[var(--accent)] border border-[var(--accent-border-active)] font-bold shadow-sm'
                : 'text-ink-3 hover:text-ink-2 hover:bg-white/[0.04]'
            )}
            title={t('leisureTab')}
          >
            {currentTab === 'leisure' ? (
              <SpaRoundedIcon sx={{ fontSize: 22 }} />
            ) : (
              <SpaOutlinedIcon sx={{ fontSize: 22 }} />
            )}
            <span className="text-[10.5px] leading-none">{t('leisureTab')}</span>
          </button>

          {/* Tab 4: Settings (Desktop Rail) */}
          <button
            type="button"
            onClick={() => setCurrentTab('settings')}
            className={clsx(
              'pressable flex flex-col items-center justify-center w-14 h-14 rounded-[18px] text-[11px] transition-all gap-1',
              currentTab === 'settings'
                ? 'bg-[var(--accent-tint-active)] text-[var(--accent)] border border-[var(--accent-border-active)] font-bold shadow-sm'
                : 'text-ink-3 hover:text-ink-2 hover:bg-white/[0.04]'
            )}
            title={t('settingsTitle')}
          >
            <TuneRoundedIcon sx={{ fontSize: 22 }} />
            <span className="text-[10.5px] leading-none">{t('settingsTitle')}</span>
          </button>
        </nav>

        <div className="w-6 h-[1px] bg-white/10 my-1" />

        {/* Floating Brain Vault Trigger in Rail */}
        <button
          type="button"
          onClick={() => setIsVaultOpen(true)}
          className="pressable flex flex-col items-center justify-center w-14 h-14 rounded-[18px] text-ink-3 hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-all gap-1"
          title={t('brainVaultTitle')}
        >
          <PsychologyOutlinedIcon sx={{ fontSize: 22 }} />
          <span className="text-[10px] leading-none">{t('brainVaultTitle')}</span>
        </button>
      </aside>

      {/* ================= UNIFIED SCALING CANVAS CONTAINER ================= */}
      <main className="w-full max-w-xl lg:max-w-2xl mx-auto min-h-[100dvh] px-4 sm:px-6 pt-4 pb-36 sm:pb-32 flex flex-col justify-start">
        <div key={currentTab} className="w-full animate-view-in">
          {currentTab === 'tasks' && (
            <TodayScreen onOpenSettings={handleOpenSettings} />
          )}
          {currentTab === 'habits' && <HabitsView />}
          {currentTab === 'leisure' && <LeisureView />}
          {currentTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* ================= SUB-CANVAS BOTTOM AMBIENT ATMOSPHERE GLOW ================= */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-48 z-20 overflow-hidden select-none">
        <div
          className="w-full h-full transition-all duration-500"
          style={{
            background:
              'radial-gradient(ellipse 70% 130px at 50% 100%, var(--accent-subtle), transparent)',
          }}
        />
      </div>

      {/* ================= MOBILE FLOATING BRAIN DUMP BUTTON (< 768px, micro-aligned with Tasks tab) ================= */}
      <div className="md:hidden fixed bottom-[5.85rem] left-4 right-4 max-w-sm mx-auto px-1.5 z-30 pointer-events-none flex justify-start select-none">
        <button
          type="button"
          onClick={() => setIsVaultOpen(true)}
          className="pointer-events-auto pressable flex items-center gap-2.5 px-4 py-2 rounded-[20px] bg-[var(--accent-tint-surface)]/95 border border-[var(--accent-border-tint)] backdrop-blur-xl shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <PsychologyOutlinedIcon sx={{ fontSize: 18, color: 'var(--accent)', opacity: 0.92 }} />
          <span className="text-xs font-semibold text-white/90 leading-none">
            {t('brainVaultTitle')}
          </span>
        </button>
      </div>

      {/* ================= MOBILE FLOATING BOTTOM PILL BAR (< 768px, z-40, 1:1 Android Parity) ================= */}
      <nav
        className="md:hidden fixed bottom-4 left-4 right-4 max-w-sm mx-auto z-40 h-[72px] rounded-[28px] bg-[var(--accent-tint-subtle)]/90 border border-[var(--accent-border-tint)] backdrop-blur-2xl p-1.5 flex items-center justify-between transition-all duration-300"
        style={{
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 10px 30px -10px var(--accent-glow)',
        }}
      >
        {/* Tab 1: Tasks / کارها */}
        <button
          type="button"
          onClick={() => setCurrentTab('tasks')}
          className={clsx(
            'pressable flex-1 h-full flex flex-col items-center justify-center gap-1 rounded-[22px] transition-all',
            currentTab === 'tasks'
              ? 'bg-[var(--accent-tint-active)] border border-[var(--accent-border-active)] text-[var(--accent)] font-semibold shadow-sm'
              : 'text-white/45 hover:text-white/80'
          )}
        >
          {currentTab === 'tasks' ? (
            <CheckCircleRoundedIcon sx={{ fontSize: 20, color: 'var(--accent)' }} />
          ) : (
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 20 }} />
          )}
          <span className="text-[11px] font-medium leading-none">{t('tasksTab')}</span>
        </button>

        {/* Tab 2: Habits / عادتها */}
        <button
          type="button"
          onClick={() => setCurrentTab('habits')}
          className={clsx(
            'pressable flex-1 h-full flex flex-col items-center justify-center gap-1 rounded-[22px] transition-all',
            currentTab === 'habits'
              ? 'bg-[var(--accent-tint-active)] border border-[var(--accent-border-active)] text-[var(--accent)] font-semibold shadow-sm'
              : 'text-white/45 hover:text-white/80'
          )}
        >
          {currentTab === 'habits' ? (
            <AutoAwesomeRoundedIcon sx={{ fontSize: 20, color: 'var(--accent)' }} />
          ) : (
            <RepeatRoundedIcon sx={{ fontSize: 20 }} />
          )}
          <span className="text-[11px] font-medium leading-none">{t('habitsTab')}</span>
        </button>

        {/* Tab 3: Leisure / تفریحها */}
        <button
          type="button"
          onClick={() => setCurrentTab('leisure')}
          className={clsx(
            'pressable flex-1 h-full flex flex-col items-center justify-center gap-1 rounded-[22px] transition-all',
            currentTab === 'leisure'
              ? 'bg-[var(--accent-tint-active)] border border-[var(--accent-border-active)] text-[var(--accent)] font-semibold shadow-sm'
              : 'text-white/45 hover:text-white/80'
          )}
        >
          {currentTab === 'leisure' ? (
            <SpaRoundedIcon sx={{ fontSize: 20, color: 'var(--accent)' }} />
          ) : (
            <SpaOutlinedIcon sx={{ fontSize: 20 }} />
          )}
          <span className="text-[11px] font-medium leading-none">{t('leisureTab')}</span>
        </button>
      </nav>

      {/* Global Brain Dump Sheet */}
      <BrainDump isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />

      {/* Mobile Modal Settings Bottom Sheet (suppresses bottom nav when open) */}
      <SettingsSheet isOpen={isMobileSettingsOpen} onClose={() => setIsMobileSettingsOpen(false)} />
    </div>
  );
};
