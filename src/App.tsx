import React, { useEffect } from 'react';
import { useAppStore } from './state/useAppStore';
import { AppLayout } from './components/layout/AppLayout';
import { TodayScreen } from './components/today/TodayScreen';
import { HabitsScreen } from './components/habits/HabitsScreen';
import { LeisureScreen } from './components/leisure/LeisureScreen';
import { VaultScreen } from './components/vault/VaultScreen';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { FocusScreen } from './components/focus/FocusScreen';
import { VaultSheet } from './components/vault/VaultSheet';
import { StatsScreen } from './components/stats/StatsScreen';
import { SettingsModal } from './components/settings/SettingsModal';
import { ToastContainer } from './components/ui/Toast';
import { applyAccentTheme } from './core/theme';

export const App: React.FC = () => {
  const { currentTab, isOnboarded, accent, lang } = useAppStore();

  useEffect(() => {
    applyAccentTheme(accent);
  }, [accent]);

  if (!isOnboarded) {
    return (
      <>
        <OnboardingScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <AppLayout>
        {currentTab === 0 && <TodayScreen />}
        {currentTab === 1 && <HabitsScreen />}
        {currentTab === 2 && <LeisureScreen />}
        {currentTab === 3 && <VaultScreen />}
      </AppLayout>

      {/* Global Modals and Drawers */}
      <FocusScreen />
      <VaultSheet />
      <StatsScreen />
      <SettingsModal />
      <ToastContainer />
    </>
  );
};
