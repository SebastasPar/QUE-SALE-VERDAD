import { create } from 'zustand';

export interface PaymentReceipt {
  receiptNumber: string; // Formato "B001-00XXXXX"
  customerEmail: string;
  totalSoles: number;
  igvSoles: number; // 18% IGV
  subtotalSoles: number; // 82% Base imponible
  coinsAcquired: number;
  gateway: 'culqi';
  emailStatus: 'sent';
  paymentMethod: 'yape' | 'plin' | 'card';
  issuedAt: string;
}

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
  gateway?: 'culqi';
  receipt?: PaymentReceipt;
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

const getStoredUserInfo = (): { id: string | null; email: string } => {
  try {
    const rawAuth = localStorage.getItem('quesale_auth_storage');
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      return {
        id: parsed.state?.user?.id || null,
        email: parsed.state?.user?.email || 'santiago.lima@quesale.pe',
      };
    }
  } catch {}
  return { id: null, email: 'santiago.lima@quesale.pe' };
};

export const generateCulqiReceipt = (params: {
  totalSoles: number;
  coinsAcquired: number;
  paymentMethod: 'yape' | 'plin' | 'card';
  customerEmail?: string;
}): PaymentReceipt => {
  const randomDigits = Math.floor(10000 + Math.random() * 90000)
    .toString()
    .padStart(5, '0');
  const receiptNumber = `B001-00${randomDigits}`;
  const totalSoles = Number(params.totalSoles.toFixed(2));
  const igvSoles = Number((totalSoles * 0.18).toFixed(2));
  const subtotalSoles = Number((totalSoles - igvSoles).toFixed(2));
  const storedUser = getStoredUserInfo();
  const customerEmail =
    params.customerEmail && params.customerEmail.trim() !== ''
      ? params.customerEmail.trim()
      : storedUser.email;

  return {
    receiptNumber,
    customerEmail,
    totalSoles,
    igvSoles,
    subtotalSoles,
    coinsAcquired: params.coinsAcquired,
    gateway: 'culqi',
    emailStatus: 'sent',
    paymentMethod: params.paymentMethod,
    issuedAt: new Date().toISOString(),
  };
};

interface WalletState {
  currentUserId: string | null;
  balance: number;
  transactions: WalletTransaction[];
  receipts: PaymentReceipt[];
  lastReceipt: PaymentReceipt | null;
  emailSentFlag: boolean;
  // Actions
  canAfford: (amount: number) => boolean;
  spendCoins: (amount: number, title: string, description: string, category: 'join' | 'create', activityId?: string) => boolean;
  refundCoins: (amount: number, title: string, description: string, activityId?: string) => void;
  rechargeCoins: (
    soles: number,
    coins: number,
    method: 'yape' | 'plin' | 'card',
    reference?: string,
    customerEmail?: string
  ) => PaymentReceipt;
  processCulqiPayment: (params: {
    totalSoles: number;
    coinsAcquired: number;
    method: 'yape' | 'plin' | 'card';
    customerEmail?: string;
    reference?: string;
  }) => PaymentReceipt;
  clearEmailSentFlag: () => void;
  resetWallet: (initialBalance?: number) => void;
  initUserWallet: (userId: string | null) => void;
}

const getWalletStorageKey = (userId: string | null) => {
  return userId ? `quesale_wallet_${userId}` : 'quesale_wallet_guest';
};

export const loadUserWalletData = (
  userId: string | null
): { balance: number; transactions: WalletTransaction[]; receipts: PaymentReceipt[] } => {
  const key = getWalletStorageKey(userId);
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.balance === 'number' && Array.isArray(parsed.transactions)) {
        return {
          balance: parsed.balance,
          transactions: parsed.transactions,
          receipts: Array.isArray(parsed.receipts) ? parsed.receipts : [],
        };
      }
    }
  } catch {}

  const defaultTx = createWelcomeTransaction(INITIAL_WELCOME_COINS);
  const initialData = {
    balance: INITIAL_WELCOME_COINS,
    transactions: [defaultTx],
    receipts: [] as PaymentReceipt[],
  };
  try {
    localStorage.setItem(key, JSON.stringify(initialData));
  } catch {}
  return initialData;
};

const saveUserWalletData = (
  userId: string | null,
  balance: number,
  transactions: WalletTransaction[],
  receipts: PaymentReceipt[]
) => {
  const key = getWalletStorageKey(userId);
  try {
    localStorage.setItem(key, JSON.stringify({ balance, transactions, receipts }));
  } catch {}
};

const initialUser = getStoredUserInfo();
const initialData = loadUserWalletData(initialUser.id);

try {
  localStorage.removeItem('quesale_wallet_storage');
} catch {}

export const useWalletStore = create<WalletState>()((set, get) => ({
  currentUserId: initialUser.id,
  balance: initialData.balance,
  transactions: initialData.transactions,
  receipts: initialData.receipts,
  lastReceipt: initialData.receipts.length > 0 ? initialData.receipts[0] : null,
  emailSentFlag: false,

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

    saveUserWalletData(get().currentUserId, nextBalance, nextTransactions, get().receipts);
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

    saveUserWalletData(get().currentUserId, nextBalance, nextTransactions, get().receipts);
    set({
      balance: nextBalance,
      transactions: nextTransactions,
    });
  },

  rechargeCoins: (soles, coins, method, reference, customerEmail) => {
    const methodNames = {
      yape: 'Yape',
      plin: 'Plin',
      card: 'Tarjeta Débito/Crédito',
    };

    const receipt = generateCulqiReceipt({
      totalSoles: soles,
      coinsAcquired: coins,
      paymentMethod: method,
      customerEmail,
    });

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'credit',
      amount: coins,
      title: `Recarga Culqi exitosa (+${coins} SaleCoins)`,
      description: `Boleta ${receipt.receiptNumber} • S/ ${soles.toFixed(2)} (IGV S/ ${receipt.igvSoles.toFixed(2)}) vía ${methodNames[method]} (Culqi)${reference ? ` • Ref: ${reference}` : ''} • Enviada a ${receipt.customerEmail}`,
      date: receipt.issuedAt,
      category: 'recharge',
      paymentMethod: method,
      solesAmount: soles,
      gateway: 'culqi',
      receipt,
    };

    const nextBalance = get().balance + coins;
    const nextTransactions = [newTx, ...get().transactions];
    const nextReceipts = [receipt, ...get().receipts];

    saveUserWalletData(get().currentUserId, nextBalance, nextTransactions, nextReceipts);
    set({
      balance: nextBalance,
      transactions: nextTransactions,
      receipts: nextReceipts,
      lastReceipt: receipt,
      emailSentFlag: receipt.emailStatus === 'sent',
    });

    return receipt;
  },

  processCulqiPayment: ({ totalSoles, coinsAcquired, method, customerEmail, reference }) => {
    return get().rechargeCoins(totalSoles, coinsAcquired, method, reference, customerEmail);
  },

  clearEmailSentFlag: () => {
    set({ emailSentFlag: false });
  },

  resetWallet: (initialBalance = INITIAL_WELCOME_COINS) => {
    const welcomeTx = createWelcomeTransaction(initialBalance);
    const nextTransactions = [welcomeTx];
    saveUserWalletData(get().currentUserId, initialBalance, nextTransactions, []);

    set({
      balance: initialBalance,
      transactions: nextTransactions,
      receipts: [],
      lastReceipt: null,
      emailSentFlag: false,
    });
  },

  initUserWallet: (userId: string | null) => {
    const data = loadUserWalletData(userId);
    set({
      currentUserId: userId,
      balance: data.balance,
      transactions: data.transactions,
      receipts: data.receipts,
      lastReceipt: data.receipts.length > 0 ? data.receipts[0] : null,
      emailSentFlag: false,
    });
  },
}));
