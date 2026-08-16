import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Repeat,
  Sparkles,
  Brain,
  Globe,
  Flame,
} from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { APP_ACCENTS, type AccentCode } from '../../lib/theme';
import { GlassCard } from '../ui/GlassCard';
import { VaultDrawer } from '../vault/VaultDrawer';

export type ActiveTab = 'tasks' | 'habits' | 'leisure';

interface AppLayoutProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onTabChange,
  children,
}) => {
  const { t, i18n } = useTranslation();
  const { accent, setAccent } = useTheme();
  const currentLang = (i18n.language || 'fa').startsWith('en') ? 'en' : 'fa';

  const [isVaultOpen, setIsVaultOpen] = useState(false);

  const handleToggleLang = () => {
    const nextLang = currentLang === 'fa' ? 'en' : 'fa';
    i18n.changeLanguage(nextLang);
  };

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'tasks', label: t('app.tasksTab'), icon: CheckCircle2 },
    { id: 'habits', label: t('app.habitsTab'), icon: Repeat },
    { id: 'leisure', label: t('app.leisureTab'), icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-[var(--color-accent)]/30 selection:text-ink">
      {/* Background ambient radial glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[340px] rounded-full blur-[140px] opacity-20 transition-all duration-700"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />

      <div className="flex w-full min-h-screen">
        {/* Desktop Sidebar (hidden on mobile) */}
        <aside className="hidden md:flex flex-col justify-between w-64 p-6 border-r border-glass-line/40 bg-bg/80 backdrop-blur-xl shrink-0 sticky top-0 h-screen z-30">
          <div className="space-y-8">
            {/* App Branding */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)] shadow-accent-glow">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-ink">{t('app.title')}</span>
                <span className="text-[10px] font-mono text-ink3">re.flow pwa</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 shadow-sm'
                        : 'text-ink2 hover:text-ink hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Brain Dump Action */}
            <button
              type="button"
              onClick={() => setIsVaultOpen(true)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-2xl glass-surface text-ink hover:border-white/25 active:scale-95 transition-all text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>{t('vault.brainVaultTitle')}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-ink3 font-mono">
                ⌘K
              </span>
            </button>
          </div>

          {/* Bottom Settings & Accents in Sidebar */}
          <div className="space-y-4 pt-4 border-t border-glass-line/40">
            {/* Accent Theme Switcher */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                {(Object.keys(APP_ACCENTS) as AccentCode[]).map((key) => {
                  const item = APP_ACCENTS[key];
                  const isActive = accent === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAccent(key)}
                      className={`h-5 w-5 rounded-full transition-transform active:scale-90 ${
                        isActive ? 'scale-125 ring-2 ring-white/60' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: item.color }}
                    />
                  );
                })}
              </div>

              {/* Language Switch */}
              <button
                type="button"
                onClick={handleToggleLang}
                className="flex items-center gap-1 text-xs font-semibold text-ink3 hover:text-ink transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentLang.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-xl mx-auto px-4 pt-4 sm:pt-6 w-full">
          {children}
        </main>
      </div>

      {/* Floating Brain Dump FAB on Mobile */}
      <div className="md:hidden fixed start-5 bottom-24 z-40">
        <button
          type="button"
          onClick={() => setIsVaultOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full glass-surface border border-white/20 text-ink shadow-2xl active:scale-90 transition-transform"
          aria-label={t('vault.brainVaultTitle')}
        >
          <Brain className="w-5 h-5 text-purple-300" />
        </button>
      </div>

      {/* Mobile Floating Bottom Navigation Bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 pb-4 px-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <GlassCard
            radius="pill"
            className="p-1.5 shadow-2xl bg-[#17171B]/85 border-white/10 backdrop-blur-2xl"
          >
            <nav className="flex items-center justify-around">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={`flex flex-col items-center justify-center py-2 px-4 rounded-full flex-1 transition-all ${
                      isSelected
                        ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] shadow-sm'
                        : 'text-ink3 hover:text-ink'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10.5px] font-semibold mt-1 tracking-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </GlassCard>
        </div>
      </div>

      {/* Brain Dump Vault Drawer */}
      <VaultDrawer isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
    </div>
  );
};
