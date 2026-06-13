import React, { createContext, useContext, useState, useEffect } from 'react';
import { createMMKV } from 'react-native-mmkv';
import { Transaction, UserProfile } from '../types';
import { INITIAL_TRANSACTIONS } from '../utils/constants';
import { formatTo24h, formatDateToShort } from '../utils/timeFormatter';

const storage = createMMKV();

interface MockStoreContextProps {
  isLoggedIn: boolean;
  hasCompletedSetup: boolean;
  cashBalance: number;
  upiBalance: number;
  userProfile: UserProfile;
  transactions: Transaction[];
  login: () => void;
  logout: () => void;
  completeSetup: (cashOnHand: number) => void;
  addTransaction: (title: string, amount: number, source: 'cash' | 'upi', category: string, note?: string) => void;
  refundTransaction: (id: string) => void;
  selfTransfer: (amount: number, from: 'cash' | 'upi', to: 'cash' | 'upi') => void;
  setBiometricLock: (enabled: boolean) => void;
  addFunds: (amount: number, source: 'cash' | 'upi') => void;
}

const MockStoreContext = createContext<MockStoreContextProps | undefined>(undefined);

export const MockStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => storage.getBoolean('isLoggedIn') || false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(() => storage.getBoolean('hasCompletedSetup') || false);
  const [cashBalance, setCashBalance] = useState(() => storage.getNumber('cashBalance') ?? 500);
  const [upiBalance, setUpiBalance] = useState(() => storage.getNumber('upiBalance') ?? 11950);
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = storage.getString('userProfile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      name: 'Aquaa',
      email: 'aqua@lumen.app',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-R0o7cKI1uoOIi1fiP2jA2MEeVeZWgGNf8YaOtMgTX9nCZgoVxoZiwctZRye-cWsn4BQDZxTycd5xfZID1So06n5o8El7-uNh_cKEIGWE-j3jDTPwz2pgtsPtRkfB3TMlBpBr5ODq8i8LzTxDfByd6OWew5K1me7a_3-fQOKZ8B6UVH6rLD3-hIK4h7qfXNvSTQfdnU5IFzjIW0ojnwHEHuP8taBkqDEWUsPcVTkQRxC3PxTVz9H2NI5PlYYc5LngxIr6T_RvW-ne',
      biometricLock: true
    };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = storage.getString('transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_TRANSACTIONS;
  });

  // Sync state changes to MMKV
  useEffect(() => {
    storage.set('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    storage.set('hasCompletedSetup', hasCompletedSetup);
  }, [hasCompletedSetup]);

  useEffect(() => {
    storage.set('cashBalance', cashBalance);
  }, [cashBalance]);

  useEffect(() => {
    storage.set('upiBalance', upiBalance);
  }, [upiBalance]);

  useEffect(() => {
    storage.set('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    storage.set('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setHasCompletedSetup(false);
    setCashBalance(500);
    setUpiBalance(11950);
    setTransactions(INITIAL_TRANSACTIONS);
    storage.clearAll();
  };

  const completeSetup = (cashOnHand: number) => {
    setCashBalance(cashOnHand);
    setHasCompletedSetup(true);
    setIsLoggedIn(true);
  };

  const addTransaction = (title: string, amount: number, source: 'cash' | 'upi', category: string, note?: string) => {
    const now = new Date();
    const newTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      amount,
      type: 'expense',
      source,
      category,
      timestamp: formatTo24h(now),
      date: formatDateToShort(now),
      note
    };

    if (source === 'cash') {
      setCashBalance((prev: number) => Math.max(0, prev - amount));
    } else {
      setUpiBalance((prev: number) => Math.max(0, prev - amount));
    }

    setTransactions((prev: Transaction[]) => [newTx, ...prev]);
  };

  const refundTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    if (tx.source === 'cash') {
      setCashBalance((prev: number) => prev + tx.amount);
    } else {
      setUpiBalance((prev: number) => prev + tx.amount);
    }

    // Filter out transaction or mark as refunded (let's delete it so it updates UI balances and lists)
    setTransactions((prev: Transaction[]) => prev.filter(t => t.id !== id));
  };

  const selfTransfer = (amount: number, from: 'cash' | 'upi', to: 'cash' | 'upi') => {
    if (from === 'cash') {
      setCashBalance((prev: number) => Math.max(0, prev - amount));
      setUpiBalance((prev: number) => prev + amount);
    } else {
      setUpiBalance((prev: number) => Math.max(0, prev - amount));
      setCashBalance((prev: number) => prev + amount);
    }

    const now = new Date();
    const transferTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      title: 'Wallet Transfer',
      amount,
      type: 'transfer',
      source: from,
      category: 'Others',
      timestamp: formatTo24h(now),
      date: formatDateToShort(now),
      note: `Transferred ${from.toUpperCase()} to ${to.toUpperCase()}`
    };
    setTransactions((prev: Transaction[]) => [transferTx, ...prev]);
  };

  const setBiometricLock = (enabled: boolean) => {
    setUserProfile(prev => ({ ...prev, biometricLock: enabled }));
  };

  const addFunds = (amount: number, source: 'cash' | 'upi') => {
    if (source === 'cash') {
      setCashBalance((prev) => prev + amount);
    } else {
      setUpiBalance((prev) => prev + amount);
    }

    const now = new Date();
    const addTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      title: 'Added Funds',
      amount,
      type: 'income',
      source,
      category: 'Others',
      timestamp: formatTo24h(now),
      date: formatDateToShort(now),
      note: `Added funds to ${source.toUpperCase()} Wallet`
    };
    setTransactions((prev: Transaction[]) => [addTx, ...prev]);
  };

  return (
    <MockStoreContext.Provider
      value={{
        isLoggedIn,
        hasCompletedSetup,
        cashBalance,
        upiBalance,
        userProfile,
        transactions,
        login,
        logout,
        completeSetup,
        addTransaction,
        refundTransaction,
        selfTransfer,
        setBiometricLock,
        addFunds
      }}
    >
      {children}
    </MockStoreContext.Provider>
  );
};

export const useMockStore = () => {
  const context = useContext(MockStoreContext);
  if (!context) {
    throw new Error('useMockStore must be used within a MockStoreProvider');
  }
  return context;
};
