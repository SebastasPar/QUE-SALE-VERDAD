import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '../queryClient';
import { useWalletStore } from './walletStore';
import { useNotificationStore } from './notificationStore';

export interface User {
  id: string;
  name: string;
  email: string;
  interests: string[];
  avatarUrl?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hasCompletedOnboarding: boolean;
  login: (token: string, user: Omit<User, 'interests'> & { interests?: string[]; bio?: string; id?: string }, hasCompletedOnboarding?: boolean) => void;
  logout: () => void;
  setInterests: (interests: string[]) => void;
  setProfileDetails: (details: { avatarUrl?: string; bio?: string }) => void;
  updateProfile: (details: Partial<User>) => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasCompletedOnboarding: false,
      login: (token, user, hasCompletedOnboardingVal = true) => {
        const emailPrefix = user.email ? user.email.split('@')[0] : '';
        const mainWord = emailPrefix.split('.')[0].split('_')[0].split('-')[0];
        const fallbackName = mainWord ? (mainWord.charAt(0).toUpperCase() + mainWord.slice(1)) : 'Usuario';
        const finalName = user.name && user.name.trim() !== '' ? user.name : fallbackName;
        const targetUserId = user.id || `user-${Date.now()}`;
        
        // Clear React Query cache so previous user queries don't leak in memory
        try {
          queryClient.clear();
        } catch {}

        // Initialize wallet for this specific user
        useWalletStore.getState().initUserWallet(targetUserId);

        // Initialize notifications for this specific user
        useNotificationStore.getState().initUserNotifications(targetUserId);

        set((state) => ({ 
          token, 
          hasCompletedOnboarding: hasCompletedOnboardingVal, 
          user: { 
            id: targetUserId,
            name: finalName, 
            email: user.email,
            avatarUrl: user.avatarUrl ?? (state.user?.avatarUrl || ''), 
            bio: user.bio ?? (state.user?.bio || ''),
            interests: user.interests && user.interests.length > 0 ? user.interests : (state.user?.interests || []) 
          } 
        }));
      },
      logout: () => {
        try {
          queryClient.clear();
        } catch {}
        useWalletStore.getState().initUserWallet(null);
        useWalletStore.getState().resetWallet(100);
        useNotificationStore.getState().initUserNotifications(null);
        set({ user: null, token: null, hasCompletedOnboarding: false });
      },
      setInterests: (interests) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, interests } : null 
        })),
      setProfileDetails: ({ avatarUrl, bio }) =>
        set((state) => ({
          user: state.user ? {
            ...state.user,
            avatarUrl: avatarUrl !== undefined ? avatarUrl : state.user.avatarUrl,
            bio: bio !== undefined ? bio : state.user.bio
          } : null
        })),
      updateProfile: (details) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...details } : null
        })),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'quesale_auth_storage',
    }
  )
);
