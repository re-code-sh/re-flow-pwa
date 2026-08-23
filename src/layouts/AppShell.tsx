import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TodayScreen } from '../views/today/TodayScreen';
import { HabitsView } from '../views/HabitsView';
import { LeisureView } from '../views/LeisureView';
import { SettingsView } from '../views/SettingsView';
import { BrainDump } from '../components/BrainDump';
import { clsx } from 'clsx';

// Material Icons
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';

export const AppShell: React.FC = () => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<'tasks' | 'habits' | 'leisure' | 'settings'>('tasks');
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-ink relative selection:bg-[var(--accent-subtle)] selection:text-[var(--accent)]">
      {/* ================= DESKTOP & TABLET DETACHED FLOATING GLASS RAIL (>= 768px) ================= */}
      <aside className="hidden md:flex fixed start-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2 p-2 rounded-[26px] bg-[#0d0d12]/85 backdrop-blur-2xl border border-white/[0.08] shadow-2xl">
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

        {/* 3 Core Navigation Tabs */}
        <nav className="flex flex-col gap-1.5">
          {/* Tab 1: Tasks */}
          <button
            type="button"
            onClick={() => setCurrentTab('tasks')}
            className={clsx(
              'pressable flex flex-col items-center justify-center w-14 h-14 rounded-[18px] text-[11px] transition-all gap-1',
              currentTab === 'tasks'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] font-bold shadow-sm'
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
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] font-bold shadow-sm'
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
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] font-bold shadow-sm'
                : 'text-ink-3 hover:text-ink-2 hover:bg-white/[0.04]'
            )}
            title={t('leisureTab')}
          >
            <SpaRoundedIcon sx={{ fontSize: 22 }} />
            <span className="text-[10.5px] leading-none">{t('leisureTab')}</span>
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

      {/* ================= CENTERED MOBILE-FIRST CANVAS CONTAINER ================= */}
      <main className="w-full max-w-md sm:max-w-lg mx-auto min-h-screen px-4 pt-3 pb-32 flex flex-col justify-start">
        {currentTab === 'tasks' && (
          <TodayScreen onOpenSettings={() => setCurrentTab('settings')} />
        )}
        {currentTab === 'habits' && <HabitsView />}
        {currentTab === 'leisure' && <LeisureView />}
        {currentTab === 'settings' && <SettingsView />}
      </main>

      {/* ================= MOBILE FLOATING BRAIN DUMP BUTTON (< 768px) ================= */}
      <div className="md:hidden fixed bottom-20 end-5 z-30">
        <button
          type="button"
          onClick={() => setIsVaultOpen(true)}
          className="pressable flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1C21]/95 border border-line shadow-2xl backdrop-blur-xl text-ink-2 hover:text-ink transition-all"
        >
          <span className="text-[12px] font-bold text-ink">{t('brainVaultTitle')}</span>
          <PsychologyOutlinedIcon sx={{ fontSize: 18, color: 'var(--accent)' }} />
        </button>
      </div>

      {/* ================= MOBILE FLOATING BOTTOM PILL BAR (< 768px) ================= */}
      <nav className="md:hidden fixed bottom-5 left-4 right-4 max-w-sm mx-auto z-40 rounded-full bg-[#0d0d12]/85 backdrop-blur-2xl border border-white/[0.08] shadow-2xl px-3 py-1.5 flex items-center justify-between">
        {/* Tab 1: Tasks */}
        <button
          type="button"
          onClick={() => setCurrentTab('tasks')}
          className={clsx(
            'pressable flex-1 py-2 rounded-full flex items-center justify-center gap-2 transition-all',
            currentTab === 'tasks'
              ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] font-bold'
              : 'text-ink-3 hover:text-ink-2 font-medium'
          )}
        >
          {currentTab === 'tasks' ? (
            <CheckCircleRoundedIcon sx={{ fontSize: 19 }} />
          ) : (
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 19 }} />
          )}
          <span className="text-[12px]">{t('tasksTab')}</span>
        </button>

        {/* Tab 2: Habits */}
        <button
          type="button"
          onClick={() => setCurrentTab('habits')}
          className={clsx(
            'pressable flex-1 py-2 rounded-full flex items-center justify-center gap-2 transition-all',
            currentTab === 'habits'
              ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] font-bold'
              : 'text-ink-3 hover:text-ink-2 font-medium'
          )}
        >
          {currentTab === 'habits' ? (
            <AutoAwesomeRoundedIcon sx={{ fontSize: 19 }} />
          ) : (
            <RepeatRoundedIcon sx={{ fontSize: 19 }} />
          )}
          <span className="text-[12px]">{t('habitsTab')}</span>
        </button>

        {/* Tab 3: Leisure */}
        <button
          type="button"
          onClick={() => setCurrentTab('leisure')}
          className={clsx(
            'pressable flex-1 py-2 rounded-full flex items-center justify-center gap-2 transition-all',
            currentTab === 'leisure'
              ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] font-bold'
              : 'text-ink-3 hover:text-ink-2 font-medium'
          )}
        >
          <SpaRoundedIcon sx={{ fontSize: 19 }} />
          <span className="text-[12px]">{t('leisureTab')}</span>
        </button>
      </nav>

      {/* Global Brain Dump Sheet */}
      <BrainDump isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
    </div>
  );
};
