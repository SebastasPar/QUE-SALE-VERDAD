import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '../queryClient';
import { useWalletStore } from './walletStore';
import { useNotificationStore } from './notificationStore';

export type UserRole = 'user' | 'venue';

export interface VenueDetails {
  businessName: string;
  ruc: string;
  venueCategory: string;
  branchesCount: number;
  address: string;
  district?: string;
  phone: string;
  discountOffer?: string;
}

export interface VenueSubscription {
  status: 'active' | 'past_due' | 'canceled';
  planId: 'single' | 'multi' | 'chain';
  planName: string;
  monthlyPricePen: number;
  activatedAt: string;
  renewsAt: string;
  receiptNumber?: string;
  paymentMethod?: 'yape' | 'plin' | 'card';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  interests: string[];
  avatarUrl?: string;
  bio?: string;
  venueDetails?: VenueDetails;
  subscription?: VenueSubscription;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hasCompletedOnboarding: boolean;
  login: (
    token: string,
    user: Omit<User, 'interests'> & { interests?: string[]; bio?: string; id?: string },
    hasCompletedOnboarding?: boolean
  ) => void;
  logout: () => void;
  setInterests: (interests: string[]) => void;
  setProfileDetails: (details: { avatarUrl?: string; bio?: string }) => void;
  updateProfile: (details: Partial<User>) => void;
  updateSubscription: (subscription: Partial<VenueSubscription>) => void;
  updateVenueDetails: (details: Partial<VenueDetails>) => void;
  completeOnboarding: () => void;
}

const ACCOUNTS_DIRECTORY_KEY = 'quesale_accounts_directory';

export const getStoredAccountByEmail = (email: string): Partial<User> | null => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_DIRECTORY_KEY);
    if (!raw) return null;
    const directory = JSON.parse(raw) as Record<string, Partial<User>>;
    return directory[email.trim().toLowerCase()] || null;
  } catch {
    return null;
  }
};

const saveAccountToDirectory = (user: User) => {
  try {
    if (!user.email) return;
    const raw = localStorage.getItem(ACCOUNTS_DIRECTORY_KEY);
    const directory = raw ? (JSON.parse(raw) as Record<string, Partial<User>>) : {};
    directory[user.email.trim().toLowerCase()] = user;
    localStorage.setItem(ACCOUNTS_DIRECTORY_KEY, JSON.stringify(directory));
  } catch {}
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasCompletedOnboarding: false,
      login: (token, user, hasCompletedOnboardingVal = true) => {
        const storedProfile = user.email ? getStoredAccountByEmail(user.email) : null;
        const finalRole: UserRole = user.role || storedProfile?.role || 'user';
        const emailPrefix = user.email ? user.email.split('@')[0] : '';
        const mainWord = emailPrefix.split('.')[0].split('_')[0].split('-')[0];
        const fallbackName = mainWord ? (mainWord.charAt(0).toUpperCase() + mainWord.slice(1)) : 'Usuario';
        const finalName = user.name && user.name.trim() !== ''
          ? user.name
          : (user.venueDetails?.businessName || storedProfile?.name || fallbackName);
        const targetUserId = user.id || storedProfile?.id || `${finalRole === 'venue' ? 'venue' : 'user'}-${Date.now()}`;

        // Clear React Query cache so previous user queries don't leak in memory
        try {
          queryClient.clear();
        } catch {}

        // SaleCoins wallet applies exclusively to personal users, never to venues
        if (finalRole !== 'venue') {
          useWalletStore.getState().initUserWallet(targetUserId);
        } else {
          useWalletStore.getState().initUserWallet(null);
        }

        // Initialize notifications for this specific user
        useNotificationStore.getState().initUserNotifications(targetUserId);

        set((state) => {
          const nextUser: User = {
            id: targetUserId,
            name: finalName,
            email: user.email,
            role: finalRole,
            avatarUrl: user.avatarUrl ?? storedProfile?.avatarUrl ?? (state.user?.avatarUrl || ''),
            bio: user.bio ?? storedProfile?.bio ?? (state.user?.bio || ''),
            interests: user.interests && user.interests.length > 0
              ? user.interests
              : (storedProfile?.interests || state.user?.interests || []),
            venueDetails: finalRole === 'venue'
              ? (user.venueDetails || storedProfile?.venueDetails || state.user?.venueDetails)
              : undefined,
            subscription: finalRole === 'venue'
              ? (user.subscription || storedProfile?.subscription || state.user?.subscription)
              : undefined,
          };

          saveAccountToDirectory(nextUser);

          return {
            token,
            hasCompletedOnboarding: finalRole === 'venue' ? true : hasCompletedOnboardingVal,
            user: nextUser,
          };
        });
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
        set((state) => {
          if (!state.user) return { user: null };
          const nextUser = { ...state.user, interests };
          saveAccountToDirectory(nextUser);
          return { user: nextUser };
        }),
      setProfileDetails: ({ avatarUrl, bio }) =>
        set((state) => {
          if (!state.user) return { user: null };
          const nextUser = {
            ...state.user,
            avatarUrl: avatarUrl !== undefined ? avatarUrl : state.user.avatarUrl,
            bio: bio !== undefined ? bio : state.user.bio,
          };
          saveAccountToDirectory(nextUser);
          return { user: nextUser };
        }),
      updateProfile: (details) =>
        set((state) => {
          if (!state.user) return { user: null };
          const nextUser = { ...state.user, ...details };
          saveAccountToDirectory(nextUser);
          return { user: nextUser };
        }),
      updateSubscription: (subscription) =>
        set((state) => {
          if (!state.user) return { user: null };
          const currentSub: VenueSubscription = state.user.subscription || {
            status: 'active',
            planId: (state.user.venueDetails?.branchesCount || 1) > 1 ? 'multi' : 'single',
            planName: (state.user.venueDetails?.branchesCount || 1) > 1 ? 'Plan Multisede' : 'Plan Sede Única',
            monthlyPricePen: (state.user.venueDetails?.branchesCount || 1) > 1 ? 179 : 99,
            activatedAt: new Date().toISOString(),
            renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };
          const nextUser: User = {
            ...state.user,
            subscription: { ...currentSub, ...subscription },
          };
          saveAccountToDirectory(nextUser);
          return { user: nextUser };
        }),
      updateVenueDetails: (details) =>
        set((state) => {
          if (!state.user) return { user: null };
          const currentVenue: VenueDetails = state.user.venueDetails || {
            businessName: state.user.name,
            ruc: '20600000001',
            venueCategory: 'Gastronomía',
            branchesCount: 1,
            address: 'Lima, Perú',
            phone: '999999999',
          };
          const nextUser: User = {
            ...state.user,
            name: details.businessName || state.user.name,
            venueDetails: { ...currentVenue, ...details },
          };
          saveAccountToDirectory(nextUser);
          return { user: nextUser };
        }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'quesale_auth_storage',
    }
  )
);
