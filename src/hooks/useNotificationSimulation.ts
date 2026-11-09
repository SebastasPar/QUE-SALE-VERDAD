import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { getUserJoinedIds, getStorageActivities } from './useActivities';

export function useNotificationSimulation() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { user, token, hasCompletedOnboarding } = useAuthStore();
  const { simulateChatMessage } = useNotificationStore();
  const hasTriggeredInitialRef = useRef(false);

  // Listen for custom activity update events (like simulated new member joins)
  useEffect(() => {
    const handleActivityUpdated = (e: any) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      if (e.detail?.planId) {
        queryClient.invalidateQueries({ queryKey: ['activity', e.detail.planId] });
        queryClient.invalidateQueries({ queryKey: ['chat', e.detail.planId] });
      }
    };

    window.addEventListener('quesale_activities_updated', handleActivityUpdated);
    return () => {
      window.removeEventListener('quesale_activities_updated', handleActivityUpdated);
    };
  }, [queryClient]);

  // Initial ambient notification (ONLY if user has joined a plan)
  useEffect(() => {
    // Only trigger if user is logged in, has completed onboarding and has joined at least one plan
    if (!token || !hasCompletedOnboarding || !user?.id) return;
    if (hasTriggeredInitialRef.current) return;

    const joinedIds = getUserJoinedIds(user.id);
    if (joinedIds.length === 0) return; // NO notifications for new users who haven't joined any plan!

    const timer = setTimeout(() => {
      hasTriggeredInitialRef.current = true;
      const currentJoined = getUserJoinedIds(user.id);
      if (currentJoined.length === 0) return;

      const activities = getStorageActivities(user.id);
      const joinedAct = activities.find((a) => currentJoined.includes(a.id));
      if (!joinedAct) return;

      // Do not trigger if already looking at this plan's chat
      if (location.pathname === `/chat/${joinedAct.id}`) return;

      simulateChatMessage({
        planId: joinedAct.id,
        planTitle: joinedAct.title,
        sender: 'Compañero de salida',
        message: '¡Hola! Ya llegué al punto de encuentro. ¿Quiénes ya están en camino?',
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [token, hasCompletedOnboarding, user?.id, location.pathname, simulateChatMessage]);

  // Periodic ambient simulation (every 90s, ONLY for plans the user has actually joined)
  useEffect(() => {
    if (!token || !hasCompletedOnboarding || !user?.id) return;

    const interval = setInterval(() => {
      const currentJoined = getUserJoinedIds(user.id);
      if (currentJoined.length === 0) return; // NO notifications if not in any plan!

      const activities = getStorageActivities(user.id);
      const joinedActs = activities.filter((a) => currentJoined.includes(a.id));
      if (joinedActs.length === 0) return;

      const randomJoined = joinedActs[Math.floor(Math.random() * joinedActs.length)];

      const activeChatId = location.pathname.startsWith('/chat/')
        ? location.pathname.split('/chat/')[1]
        : null;

      if (activeChatId !== randomJoined.id) {
        simulateChatMessage({
          planId: randomJoined.id,
          planTitle: randomJoined.title,
        });
      }
    }, 90000);

    return () => clearInterval(interval);
  }, [token, hasCompletedOnboarding, user?.id, location.pathname, simulateChatMessage]);
}
