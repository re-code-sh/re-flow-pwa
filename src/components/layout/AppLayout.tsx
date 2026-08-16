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
    document.documentElement.dir = nextLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  };

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    { id: 'tasks', label: t('app.tasksTab'), icon: CheckCircle2 },
    { id: 'habits', label: t('app.habitsTab'), icon: Repeat },
    { id: 'leisure', label: t('app.leisureTab'), icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F7] selection:bg-[var(--color-accent)]/30 selection:text-ink overflow-x-hidden relative">
      {/* Exact Flutter _Ambient Background Radial Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top Right Blob */}
        <div
          className="absolute -top-[22vh] -right-[18vw] w-[75vw] max-w-[600px] h-[75vw] max-h-[600px] rounded-full blur-[100px] pointer-events-none opacity-90"
          style={{
            background:
              'radial-gradient(circle, rgba(120, 140, 190, 0.12) 0%, rgba(120, 140, 190, 0) 70%)',
          }}
        />
        {/* Bottom Left Blob */}
        <div
          className="absolute -bottom-[25vh] -left-[20vw] w-[80vw] max-w-[650px] h-[80vw] max-h-[650px] rounded-full blur-[110px] pointer-events-none transition-all duration-700 opacity-90"
          style={{
            background: `radial-gradient(circle, var(--color-accent-soft) 0%, rgba(0, 0, 0, 0) 70%)`,
          }}
        />
      </div>

      <div className="flex w-full min-h-screen relative z-10">
        {/* Desktop / Tablet Sidebar (hidden on mobile) */}
        <aside className="hidden md:flex flex-col justify-between w-64 p-6 border-r border-glass-line/40 bg-[#060608]/85 backdrop-blur-2xl shrink-0 sticky top-0 h-screen z-30">
          <div className="space-y-8">
            {/* App Branding */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] shadow-[0_0_18px_var(--color-accent-glow)]">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-ink">{t('app.title')}</span>
                <span className="text-[10.5px] font-mono text-ink3">re.flow • pwa</span>
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
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/35 shadow-sm'
                        : 'text-ink2 hover:text-ink hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 stroke-[1.75]" />
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
                <Brain className="w-4 h-4 text-purple-300 stroke-[1.75]" />
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
                        isActive ? 'scale-125 ring-2 ring-white/60 shadow-sm' : 'opacity-55 hover:opacity-90'
                      }`}
                      style={{ backgroundColor: item.color }}
                      title={currentLang === 'fa' ? item.labelFa : item.labelEn}
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
                <Globe className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>{currentLang.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main View Area constrained to exact Flutter 480px width */}
        <main className="flex-1 max-w-[480px] mx-auto px-4 pt-2 sm:pt-4 w-full">
          <div key={currentTab} className="animate-tab-fade">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Action Button (_VaultFab at startFloat, elevated above bottom navbar) */}
      <div className="md:hidden fixed start-4 bottom-[88px] z-30">
        <button
          type="button"
          onClick={() => setIsVaultOpen(true)}
          className="pressable flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-b from-[#25252C] to-[#141418] border border-glass-line shadow-2xl active:scale-95 transition-transform"
          aria-label={t('vault.brainVaultTitle')}
        >
          <Brain className="w-4 h-4 text-ink2 stroke-[1.75]" />
          <span className="text-[12.5px] font-semibold text-ink2">
            {t('vault.brainVaultTitle')}
          </span>
        </button>
      </div>

      {/* Floating Bottom Navigation Bar (maxWidth 440, floating at bottom with safe-area spacing) */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] px-4 pointer-events-none">
        <div className="max-w-[440px] mx-auto pointer-events-auto">
          <GlassCard
            radius="card"
            className="p-1.5 shadow-2xl bg-gradient-to-b from-[#18181E]/95 to-[#0B0B0E]/95 border-glass-line backdrop-blur-2xl"
          >
            <nav className="flex items-center justify-around gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={`pressable flex flex-col items-center justify-center py-2 px-3 rounded-[16px] flex-1 transition-all ${
                      isSelected
                        ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/35 shadow-sm'
                        : 'text-ink3 hover:text-ink border border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 stroke-[1.75] transition-transform ${isSelected ? 'scale-110' : ''}`} />
                    <span className={`text-[11.5px] mt-0.5 tracking-tight ${isSelected ? 'font-bold' : 'font-medium'}`}>
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
