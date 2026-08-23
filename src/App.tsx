import React from 'react';
import { AppShell } from './layouts/AppShell';
import { ToastProvider } from './components/ui/Toast';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
};

export default App;
