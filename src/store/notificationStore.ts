import { create } from 'zustand';
import { getUserJoinedIds, getStorageActivities } from '../hooks/useActivities';

export type NotificationType = 'chat_message' | 'new_member' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  linkUrl?: string;
  planId?: string;
  activityTitle?: string;
  senderName?: string;
  senderAvatarUrl?: string;
  memberName?: string;
  memberAvatarUrl?: string;
}

interface NotificationState {
  currentUserId: string | null;
  notifications: AppNotification[];
  activeToast: AppNotification | null;
  isModalOpen: boolean;
  filter: 'all' | 'chat_message' | 'new_member';

  // Actions
  initUserNotifications: (userId: string | null) => void;
  addNotification: (
    data: Omit<AppNotification, 'id' | 'timestamp' | 'read'>,
    triggerToast?: boolean
  ) => AppNotification;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  dismissToast: () => void;
  showToast: (notification: AppNotification) => void;
  setModalOpen: (isOpen: boolean) => void;
  setFilter: (filter: 'all' | 'chat_message' | 'new_member') => void;
  getUnreadCount: () => number;

  // Simulation helpers
  simulateChatMessage: (options?: { planId?: string; planTitle?: string; sender?: string; message?: string }) => boolean;
  simulateNewMember: (options?: { planId?: string; planTitle?: string; memberName?: string }) => boolean;
  scheduleNewMemberForActivity: (planId: string, planTitle: string, delaySeconds?: number) => void;
}

const SAMPLE_MEMBERS = [
  { name: 'Valeria Rivas', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
  { name: 'Gonzalo Morales', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { name: 'Camila Soto', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
  { name: 'Rodrigo Salas', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
  { name: 'Lucía Benavides', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80' },
  { name: 'Sebastián Paredes', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80' },
];

const SAMPLE_CHAT_MESSAGES = [
  '¡Hola a todos! Ya estoy de camino al punto de encuentro 🚲',
  '¿Saben si hay estacionamiento cerca o mejor llego en taxi?',
  '¡Buenísimo el plan de hoy! Nos vemos en unos 20 minutos.',
  'Chicos, llevo un parlante bluetooth pequeño con música chill.',
  '¿Alguien más viene en bici desde Miraflores para ir juntos?',
  'Confirmo mi asistencia, ¡tengo muchas ganas de conocer al grupo!',
];

const getStoredUserId = (): string | null => {
  try {
    const rawAuth = localStorage.getItem('quesale_auth_storage');
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      return parsed.state?.user?.id || null;
    }
  } catch {}
  return null;
};

const getNotificationStorageKey = (userId: string | null) => {
  return userId ? `quesale_notifications_${userId}` : 'quesale_notifications_guest';
};

export const loadUserNotifications = (userId: string | null): AppNotification[] => {
  if (!userId) return [];
  const key = getNotificationStorageKey(userId);
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  // Brand new users start with 0 notifications!
  return [];
};

const saveUserNotifications = (userId: string | null, notifications: AppNotification[]) => {
  if (!userId) return;
  const key = getNotificationStorageKey(userId);
  try {
    localStorage.setItem(key, JSON.stringify(notifications));
  } catch {}
};

// Purge any legacy single-user notifications storage that leaks seed notifications
try {
  localStorage.removeItem('quesale_notifications_storage');
} catch {}

const initialUserId = getStoredUserId();
const initialNotifications = loadUserNotifications(initialUserId);

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  currentUserId: initialUserId,
  notifications: initialNotifications,
  activeToast: null,
  isModalOpen: false,
  filter: 'all',

  initUserNotifications: (userId: string | null) => {
    const loaded = loadUserNotifications(userId);
    set({
      currentUserId: userId,
      notifications: loaded,
      activeToast: null,
    });
  },

  addNotification: (data, triggerToast = true) => {
    const newNotif: AppNotification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const nextNotifications = [newNotif, ...get().notifications];
    saveUserNotifications(get().currentUserId, nextNotifications);

    set({
      notifications: nextNotifications,
      activeToast: triggerToast ? newNotif : get().activeToast,
    });

    return newNotif;
  },

  markAsRead: (id) => {
    const nextNotifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveUserNotifications(get().currentUserId, nextNotifications);

    set({
      notifications: nextNotifications,
      activeToast: get().activeToast?.id === id ? null : get().activeToast,
    });
  },

  markAllAsRead: () => {
    const nextNotifications = get().notifications.map((n) => ({ ...n, read: true }));
    saveUserNotifications(get().currentUserId, nextNotifications);

    set({
      notifications: nextNotifications,
    });
  },

  clearNotification: (id) => {
    const nextNotifications = get().notifications.filter((n) => n.id !== id);
    saveUserNotifications(get().currentUserId, nextNotifications);

    set({
      notifications: nextNotifications,
      activeToast: get().activeToast?.id === id ? null : get().activeToast,
    });
  },

  clearAll: () => {
    saveUserNotifications(get().currentUserId, []);
    set({ notifications: [], activeToast: null });
  },

  dismissToast: () => {
    set({ activeToast: null });
  },

  showToast: (notification) => {
    set({ activeToast: notification });
  },

  setModalOpen: (isOpen) => {
    set({ isModalOpen: isOpen });
  },

  setFilter: (filter) => {
    set({ filter });
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },

  // Simulate a chat message notification (only if user is joined to a plan or plan is specified)
  simulateChatMessage: (options) => {
    const randomMember = SAMPLE_MEMBERS[Math.floor(Math.random() * SAMPLE_MEMBERS.length)];
    const randomText = SAMPLE_CHAT_MESSAGES[Math.floor(Math.random() * SAMPLE_CHAT_MESSAGES.length)];
    const currentUserId = get().currentUserId;

    let targetPlanId = options?.planId;
    let targetPlanTitle = options?.planTitle;

    if (!targetPlanId) {
      // Find plans user has joined
      const joinedIds = getUserJoinedIds(currentUserId || undefined);
      if (joinedIds.length === 0) {
        // User has NOT joined any plan, do not generate random chat notifications
        return false;
      }
      const activities = getStorageActivities(currentUserId || undefined);
      const joinedAct = activities.find((a) => joinedIds.includes(a.id));
      if (!joinedAct) return false;
      targetPlanId = joinedAct.id;
      targetPlanTitle = joinedAct.title;
    }

    const sender = options?.sender || randomMember.name;
    const text = options?.message || randomText;

    get().addNotification({
      type: 'chat_message',
      title: `Nuevo mensaje en ${targetPlanTitle || 'tu salida'}`,
      message: `${sender}: "${text}"`,
      linkUrl: `/chat/${targetPlanId}`,
      planId: targetPlanId,
      activityTitle: targetPlanTitle,
      senderName: sender,
      senderAvatarUrl: randomMember.avatar,
    }, true);

    return true;
  },

  // Simulate a new member joining a created plan (only if user created a plan or plan is specified)
  simulateNewMember: (options) => {
    const randomMember = SAMPLE_MEMBERS[Math.floor(Math.random() * SAMPLE_MEMBERS.length)];
    const currentUserId = get().currentUserId;

    let targetPlanId = options?.planId;
    let targetPlanTitle = options?.planTitle;

    if (!targetPlanId || !targetPlanTitle) {
      // Search for plan created by current user
      const activities = getStorageActivities(currentUserId || undefined);
      const userAct = activities.find(
        (a) => (a.creatorId && a.creatorId === currentUserId) || (a.id.startsWith('new-') && a.organizerName?.includes('(Tú)'))
      );
      if (!userAct) {
        // User has NOT created any plan, do not simulate new member notification
        return false;
      }
      targetPlanId = userAct.id;
      targetPlanTitle = userAct.title;
    }

    const memberName = options?.memberName || randomMember.name;

    // Increment currentAttendees in activities for this plan
    try {
      const rawActs = localStorage.getItem('quesale_activities');
      if (rawActs) {
        const acts = JSON.parse(rawActs);
        const idx = acts.findIndex((a: any) => String(a.id) === String(targetPlanId));
        if (idx !== -1) {
          const act = acts[idx];
          if (act.currentAttendees < act.maxAttendees) {
            act.currentAttendees += 1;
            acts[idx] = act;
            localStorage.setItem('quesale_activities', JSON.stringify(acts));
            window.dispatchEvent(new CustomEvent('quesale_activities_updated', { detail: { planId: targetPlanId } }));
          }
        }
      }
    } catch (e) {
      console.warn('Error updating attendees during simulation', e);
    }

    // Append to that chat as a system announcement
    try {
      const chatKey = `quesale_chats_${targetPlanId}`;
      const rawChat = localStorage.getItem(chatKey);
      if (rawChat) {
        const msgs = JSON.parse(rawChat);
        msgs.push({
          id: `sys_join_${Date.now()}`,
          planId: targetPlanId,
          senderId: 'system',
          senderName: 'Sistema',
          content: `¡${memberName} se ha unido a la salida grupal y confirmó su cupo! 🎉`,
          createdAt: new Date().toISOString(),
          type: 'system',
        });
        localStorage.setItem(chatKey, JSON.stringify(msgs));
      }
    } catch (e) {
      console.warn('Error appending system chat message', e);
    }

    get().addNotification({
      type: 'new_member',
      title: '🎉 ¡Nuevo miembro en tu plan!',
      message: `${memberName} reservó su cupo con sus SaleCoins para "${targetPlanTitle}".`,
      linkUrl: `/activity/${targetPlanId}`,
      planId: targetPlanId,
      activityTitle: targetPlanTitle,
      memberName: memberName,
      memberAvatarUrl: randomMember.avatar,
    }, true);

    return true;
  },

  scheduleNewMemberForActivity: (planId, planTitle, delaySeconds = 12) => {
    setTimeout(() => {
      get().simulateNewMember({
        planId,
        planTitle,
      });
    }, delaySeconds * 1000);
  },
}));
