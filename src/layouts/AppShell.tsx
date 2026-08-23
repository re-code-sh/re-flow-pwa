import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TodayScreen } from '../views/today/TodayScreen';
import { HabitsView } from '../views/HabitsView';
import { LeisureView } from '../views/LeisureView';
import { SettingsView } from '../views/SettingsView';
import { BrainDump } from '../components/BrainDump';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { clsx } from 'clsx';

// Material Icons
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

export const AppShell: React.FC = () => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<'tasks' | 'habits' | 'leisure' | 'settings'>('tasks');
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col md:flex-row relative">
      {/* Desktop & Tablet Side Navigation Rail (>= 768px) */}
      <aside className="hidden md:flex flex-col justify-between w-64 h-screen sticky top-0 p-4 border-e border-line bg-bg/80 backdrop-blur-2xl z-40">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent-dark)] flex items-center justify-center shadow-accent-sm-glow">
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 24, color: 'var(--accent-ink, #1C1207)' }} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-ink">{t('appTitle')}</h2>
              <span className="text-[10px] font-bold text-[var(--accent)] tracking-wider uppercase">
                Web Edition
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={() => setCurrentTab('tasks')}
              className={clsx(
                'pressable w-full flex items-center gap-3.5 px-4 py-3 rounded-[16px] text-[14px] font-bold transition-all',
                currentTab === 'tasks'
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] ring-1 ring-[var(--accent-subtle)]'
                  : 'text-ink-2 hover:bg-white/[0.04] hover:text-ink'
              )}
            >
              {currentTab === 'tasks' ? (
                <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />
              ) : (
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 20 }} />
              )}
              <span>{t('tasksTab')}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('habits')}
              className={clsx(
                'pressable w-full flex items-center gap-3.5 px-4 py-3 rounded-[16px] text-[14px] font-bold transition-all',
                currentTab === 'habits'
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] ring-1 ring-[var(--accent-subtle)]'
                  : 'text-ink-2 hover:bg-white/[0.04] hover:text-ink'
              )}
            >
              {currentTab === 'habits' ? (
                <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
              ) : (
                <RepeatRoundedIcon sx={{ fontSize: 20 }} />
              )}
              <span>{t('habitsTab')}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('leisure')}
              className={clsx(
                'pressable w-full flex items-center gap-3.5 px-4 py-3 rounded-[16px] text-[14px] font-bold transition-all',
                currentTab === 'leisure'
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] ring-1 ring-[var(--accent-subtle)]'
                  : 'text-ink-2 hover:bg-white/[0.04] hover:text-ink'
              )}
            >
              <SpaRoundedIcon sx={{ fontSize: 20 }} />
              <span>{t('leisureTab')}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('settings')}
              className={clsx(
                'pressable w-full flex items-center gap-3.5 px-4 py-3 rounded-[16px] text-[14px] font-bold transition-all',
                currentTab === 'settings'
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)] ring-1 ring-[var(--accent-subtle)]'
                  : 'text-ink-2 hover:bg-white/[0.04] hover:text-ink'
              )}
            >
              <TuneRoundedIcon sx={{ fontSize: 20 }} />
              <span>{t('settingsTitle')}</span>
            </button>
          </nav>
        </div>

        {/* Bottom Rail Actions */}
        <div className="space-y-3 pt-4 border-t border-line">
          {/* Brain Vault Trigger Button */}
          <button
            type="button"
            onClick={() => setIsVaultOpen(true)}
            className="pressable w-full py-2.5 px-3 rounded-[14px] bg-white/[0.04] border border-line hover:border-[var(--accent-border)] hover:bg-[var(--accent-subtle)] text-ink-2 hover:text-[var(--accent)] text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <PsychologyOutlinedIcon sx={{ fontSize: 18 }} />
            <span>{t('brainVaultTitle')}</span>
          </button>

          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      </aside>

      {/* Main Content Workspace Container */}
      <main className="flex-1 w-full max-w-2xl lg:max-w-4xl mx-auto pb-28 md:pb-12 pt-1 md:pt-4 px-2 sm:px-4">
        {currentTab === 'tasks' && <TodayScreen onOpenSettings={() => setCurrentTab('settings')} />}
        {currentTab === 'habits' && <HabitsView />}
        {currentTab === 'leisure' && <LeisureView />}
        {currentTab === 'settings' && <SettingsView />}
      </main>

      {/* Mobile Floating Brain Dump Button (< 768px, bottom-20) */}
      <div className="md:hidden fixed bottom-20 start-4 z-40">
        <button
          type="button"
          onClick={() => setIsVaultOpen(true)}
          className="pressable flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1C1C21]/95 border border-line shadow-2xl backdrop-blur-xl text-ink-2 hover:text-ink transition-all"
        >
          <PsychologyOutlinedIcon sx={{ fontSize: 19, color: 'var(--accent)' }} />
          <span className="text-[12.5px] font-bold text-ink">{t('brainVaultTitle')}</span>
        </button>
      </div>

      {/* Mobile Bottom Frosted Glass Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2">
        <div className="max-w-md mx-auto rounded-[24px] bg-[#141418]/90 border border-white/[0.08] shadow-glass-card backdrop-blur-2xl p-1.5 flex items-center justify-between">
          {/* Tab 1: Tasks */}
          <button
            type="button"
            onClick={() => setCurrentTab('tasks')}
            className={clsx(
              'pressable flex-1 py-2 rounded-[18px] flex flex-col items-center justify-center gap-1 transition-all',
              currentTab === 'tasks'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                : 'text-ink-3 hover:text-ink-2'
            )}
          >
            {currentTab === 'tasks' ? (
              <CheckCircleRoundedIcon sx={{ fontSize: 19 }} />
            ) : (
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 19 }} />
            )}
            <span className="text-[10.5px] font-bold">{t('tasksTab')}</span>
          </button>

          {/* Tab 2: Habits */}
          <button
            type="button"
            onClick={() => setCurrentTab('habits')}
            className={clsx(
              'pressable flex-1 py-2 rounded-[18px] flex flex-col items-center justify-center gap-1 transition-all',
              currentTab === 'habits'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                : 'text-ink-3 hover:text-ink-2'
            )}
          >
            {currentTab === 'habits' ? (
              <AutoAwesomeRoundedIcon sx={{ fontSize: 19 }} />
            ) : (
              <RepeatRoundedIcon sx={{ fontSize: 19 }} />
            )}
            <span className="text-[10.5px] font-bold">{t('habitsTab')}</span>
          </button>

          {/* Tab 3: Leisure */}
          <button
            type="button"
            onClick={() => setCurrentTab('leisure')}
            className={clsx(
              'pressable flex-1 py-2 rounded-[18px] flex flex-col items-center justify-center gap-1 transition-all',
              currentTab === 'leisure'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                : 'text-ink-3 hover:text-ink-2'
            )}
          >
            <SpaRoundedIcon sx={{ fontSize: 19 }} />
            <span className="text-[10.5px] font-bold">{t('leisureTab')}</span>
          </button>

          {/* Tab 4: Settings */}
          <button
            type="button"
            onClick={() => setCurrentTab('settings')}
            className={clsx(
              'pressable flex-1 py-2 rounded-[18px] flex flex-col items-center justify-center gap-1 transition-all',
              currentTab === 'settings'
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]'
                : 'text-ink-3 hover:text-ink-2'
            )}
          >
            <TuneRoundedIcon sx={{ fontSize: 19 }} />
            <span className="text-[10.5px] font-bold">{t('settingsTitle')}</span>
          </button>
        </div>
      </nav>

      {/* Global Brain Dump Sheet */}
      <BrainDump
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />
    </div>
  );
};
