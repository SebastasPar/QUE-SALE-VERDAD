/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { AppInitializer } from './routes/app-initializer';
import { useThemeStore } from './store/themeStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Feed from './pages/Feed';
import ActivityDetailWrapper from './pages/ActivityDetail';
import CreateActivity from './pages/CreateActivity';
import Profile from './pages/Profile';
import PlanChatPage from './pages/PlanChatPage';
import Chats from './pages/Chats';
import RechargePage from './pages/RechargePage';

// Notifications
import { NotificationToast } from './components/notifications/NotificationToast';
import { NotificationModal } from './components/notifications/NotificationModal';
import { useNotificationSimulation } from './hooks/useNotificationSimulation';

function ThemeSync() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  return null;
}

function NotificationManager() {
  useNotificationSimulation();
  return (
    <>
      <NotificationToast />
      <NotificationModal />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <BrowserRouter>
        <AppInitializer>
          <NotificationManager />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/activity/create" element={<CreateActivity />} />
            <Route path="/activity/:id" element={<ActivityDetailWrapper />} />
            <Route path="/chat/:planId" element={<PlanChatPage />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/recharge" element={<RechargePage />} />
          </Routes>
        </AppInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
