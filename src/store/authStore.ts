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

export interface SubscriptionPaymentDetails {
  payerPhone?: string;
  approvalCode?: string;
  cardHolder?: string;
  cardLast4?: string;
  cardExpiry?: string;
}

export interface VenueSubscription {
  status: 'active' | 'past_due' | 'canceled';
  planId: 'single';
  planName: string;
  monthlyPricePen: number;
  activatedAt: string;
  renewsAt: string;
  receiptNumber?: string;
  paymentMethod?: 'yape' | 'plin' | 'card';
  paymentDetails?: SubscriptionPaymentDetails;
  maxPlansPerMonth?: number;
  boostDurationHours?: number;
  priorityRadiusKm?: number;
}

const DEFAULT_VENUE_PLAN_NAME = 'Plan Mensual Empresas';
const DEFAULT_VENUE_PRICE_PEN = 99;
const DEFAULT_MAX_PLANS_PER_MONTH = 8;
const DEFAULT_BOOST_DURATION_HOURS = 3;
const DEFAULT_PRIORITY_RADIUS_KM = 5;

const resolvePlanName = (incoming?: string, fallback?: string): string => {
  const candidate = (incoming || fallback || '').trim();
  if (!candidate || candidate === 'Plan Multisede' || candidate === 'Plan Sede Única') {
    return DEFAULT_VENUE_PLAN_NAME;
  }
  return candidate;
};

const normalizeVenueSubscription = (
  subscription?: Partial<VenueSubscription>,
  fallback?: VenueSubscription
): VenueSubscription => {
  const nowIso = new Date().toISOString();
  const defaultRenewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const mergedPaymentDetails =
    subscription?.paymentDetails !== undefined
      ? { ...(fallback?.paymentDetails || {}), ...subscription.paymentDetails }
      : fallback?.paymentDetails;

  return {
    status: subscription?.status || fallback?.status || 'active',
    planId: 'single',
    planName: resolvePlanName(subscription?.planName, fallback?.planName),
    monthlyPricePen: DEFAULT_VENUE_PRICE_PEN,
    activatedAt: subscription?.activatedAt || fallback?.activatedAt || nowIso,
    renewsAt: subscription?.renewsAt || fallback?.renewsAt || defaultRenewsAt,
    receiptNumber: subscription?.receiptNumber ?? fallback?.receiptNumber,
    paymentMethod: subscription?.paymentMethod ?? fallback?.paymentMethod,
    paymentDetails: mergedPaymentDetails,
    maxPlansPerMonth: DEFAULT_MAX_PLANS_PER_MONTH,
    boostDurationHours: DEFAULT_BOOST_DURATION_HOURS,
    priorityRadiusKm: DEFAULT_PRIORITY_RADIUS_KM,
  };
};

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
  cancelSubscription: () => void;
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
              ? (() => {
                  const rawSub = user.subscription || storedProfile?.subscription || state.user?.subscription;
                  return rawSub ? normalizeVenueSubscription(rawSub) : undefined;
                })()
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
          const nextSub = normalizeVenueSubscription(subscription, state.user.subscription);
          const nextUser: User = {
            ...state.user,
            subscription: nextSub,
          };
          saveAccountToDirectory(nextUser);
          return { user: nextUser };
        }),
      cancelSubscription: () =>
        set((state) => {
          if (!state.user) return { user: null };
          const nextSub = normalizeVenueSubscription(
            { status: 'canceled' },
            state.user.subscription
          );
          const nextUser: User = {
            ...state.user,
            subscription: nextSub,
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
      onRehydrateStorage: () => (state) => {
        if (state?.user?.role === 'venue' && state.user.subscription) {
          state.user = {
            ...state.user,
            subscription: normalizeVenueSubscription(state.user.subscription),
          };
          saveAccountToDirectory(state.user);
        }
      },
    }
  )
);
