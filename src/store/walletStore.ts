import { create } from 'zustand';

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  title: string;
  description: string;
  date: string;
  category: 'welcome' | 'join' | 'create' | 'refund' | 'recharge';
  activityId?: string;
  paymentMethod?: 'yape' | 'plin' | 'card';
  solesAmount?: number;
}

export const INITIAL_WELCOME_COINS = 100;

export const createWelcomeTransaction = (amount = INITIAL_WELCOME_COINS): WalletTransaction => ({
  id: `tx-welcome-${Date.now()}`,
  type: 'credit',
  amount,
  title: 'Monedas de bienvenida 🎉',
  description: `Saldo inicial gratuito de ${amount} SaleCoins para reservar tus primeras salidas sin gastar`,
  date: new Date().toISOString(),
  category: 'welcome',
});

interface WalletState {
  currentUserId: string | null;
  balance: number;
  transactions: WalletTransaction[];
  // Actions
  canAfford: (amount: number) => boolean;
  spendCoins: (amount: number, title: string, description: string, category: 'join' | 'create', activityId?: string) => boolean;
  refundCoins: (amount: number, title: string, description: string, activityId?: string) => void;
  rechargeCoins: (soles: number, coins: number, method: 'yape' | 'plin' | 'card', reference?: string) => void;
  resetWallet: (initialBalance?: number) => void;
  initUserWallet: (userId: string | null) => void;
}

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

const getWalletStorageKey = (userId: string | null) => {
  return userId ? `quesale_wallet_${userId}` : 'quesale_wallet_guest';
};

export const loadUserWalletData = (userId: string | null): { balance: number; transactions: WalletTransaction[] } => {
  const key = getWalletStorageKey(userId);
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.balance === 'number' && Array.isArray(parsed.transactions)) {
        return parsed;
      }
    }
  } catch {}

  const defaultTx = createWelcomeTransaction(INITIAL_WELCOME_COINS);
  const initialData = {
    balance: INITIAL_WELCOME_COINS,
    transactions: [defaultTx],
  };
  try {
    localStorage.setItem(key, JSON.stringify(initialData));
  } catch {}
  return initialData;
};

const saveUserWalletData = (userId: string | null, balance: number, transactions: WalletTransaction[]) => {
  const key = getWalletStorageKey(userId);
  try {
    localStorage.setItem(key, JSON.stringify({ balance, transactions }));
  } catch {}
};

const initialUserId = getStoredUserId();
const initialData = loadUserWalletData(initialUserId);

// Clean up any legacy single-user storage that might keep obsolete 350 balance
try {
  localStorage.removeItem('quesale_wallet_storage');
} catch {}

export const useWalletStore = create<WalletState>()((set, get) => ({
  currentUserId: initialUserId,
  balance: initialData.balance,
  transactions: initialData.transactions,

  canAfford: (amount: number) => {
    return get().balance >= amount;
  },

  spendCoins: (amount, title, description, category, activityId) => {
    const currentBalance = get().balance;
    if (currentBalance < amount) {
      return false;
    }

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'debit',
      amount,
      title,
      description,
      date: new Date().toISOString(),
      category,
      activityId,
    };

    const nextBalance = currentBalance - amount;
    const nextTransactions = [newTx, ...get().transactions];

    saveUserWalletData(get().currentUserId, nextBalance, nextTransactions);
    set({
      balance: nextBalance,
      transactions: nextTransactions,
    });
    return true;
  },

  refundCoins: (amount, title, description, activityId) => {
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'credit',
      amount,
      title,
      description,
      date: new Date().toISOString(),
      category: 'refund',
      activityId,
    };

    const nextBalance = get().balance + amount;
    const nextTransactions = [newTx, ...get().transactions];

    saveUserWalletData(get().currentUserId, nextBalance, nextTransactions);
    set({
      balance: nextBalance,
      transactions: nextTransactions,
    });
  },

  rechargeCoins: (soles, coins, method, reference) => {
    const methodNames = {
      yape: 'Yape',
      plin: 'Plin',
      card: 'Tarjeta Débito/Crédito',
    };

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'credit',
      amount: coins,
      title: `Recarga exitosa (+${coins} SaleCoins)`,
      description: `Pago de S/ ${soles.toFixed(2)} mediante ${methodNames[method]}${reference ? ` (Ref: ${reference})` : ''}`,
      date: new Date().toISOString(),
      category: 'recharge',
      paymentMethod: method,
      solesAmount: soles,
    };

    const nextBalance = get().balance + coins;
    const nextTransactions = [newTx, ...get().transactions];

    saveUserWalletData(get().currentUserId, nextBalance, nextTransactions);
    set({
      balance: nextBalance,
      transactions: nextTransactions,
    });
  },

  resetWallet: (initialBalance = INITIAL_WELCOME_COINS) => {
    const welcomeTx = createWelcomeTransaction(initialBalance);
    const nextTransactions = [welcomeTx];
    saveUserWalletData(get().currentUserId, initialBalance, nextTransactions);

    set({
      balance: initialBalance,
      transactions: nextTransactions,
    });
  },

  initUserWallet: (userId: string | null) => {
    const data = loadUserWalletData(userId);
    set({
      currentUserId: userId,
      balance: data.balance,
      transactions: data.transactions,
    });
  },
}));
