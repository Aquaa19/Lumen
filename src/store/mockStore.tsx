import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Transaction, UserProfile } from '../types';
import { INITIAL_TRANSACTIONS } from '../utils/constants';
import { formatTo24h, formatDateToShort } from '../utils/timeFormatter';
import googleServices from '../../android/app/google-services.json';

const storage = createMMKV();

interface MockStoreContextProps {
  isLoggedIn: boolean;
  hasCompletedSetup: boolean;
  cashBalance: number;
  upiBalance: number;
  monthlyBudget: number;
  pinCode: string | null;
  userProfile: UserProfile;
  transactions: Transaction[];
  categoryLimits: Record<string, number>;
  pinnedCategories: string[];
  login: () => void;
  logout: () => void;
  completeSetup: (cashOnHand: number, upiOnHand: number, monthlyBudget: number, pin: string | null, biometricLock: boolean) => void;
  addTransaction: (title: string, amount: number, source: 'cash' | 'upi', category: string, note?: string) => void;
  refundTransaction: (id: string) => void;
  selfTransfer: (amount: number, from: 'cash' | 'upi', to: 'cash' | 'upi') => void;
  setBiometricLock: (enabled: boolean) => void;
  setMonthlyBudget: (budget: number) => void;
  setPinCode: (pin: string | null) => void;
  addFunds: (amount: number, source: 'cash' | 'upi') => void;
  updateCategoryLimit: (category: string, limit: number) => void;
  togglePinCategory: (category: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const MockStoreContext = createContext<MockStoreContextProps | undefined>(undefined);

export const MockStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => storage.getBoolean('isLoggedIn') || false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(() => storage.getBoolean('hasCompletedSetup') || false);
  const [cashBalance, setCashBalance] = useState(() => storage.getNumber('cashBalance') ?? 0);
  const [upiBalance, setUpiBalance] = useState(() => storage.getNumber('upiBalance') ?? 0);
  const [monthlyBudget, setMonthlyBudget] = useState(() => storage.getNumber('monthlyBudget') ?? 0);
  const [pinCode, setPinCode] = useState<string | null>(() => storage.getString('pinCode') ?? null);
  
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

  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(() => {
    const saved = storage.getString('categoryLimits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      Food: 0,
      Travel: 0,
      Stationery: 0,
      Shopping: 0,
      Entertainment: 0,
      Others: 0
    };
  });

  const [pinnedCategories, setPinnedCategories] = useState<string[]>(() => {
    const saved = storage.getString('pinnedCategories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return ['Food', 'Travel', 'Stationery'];
  });

  // Configure Google Sign-In
  useEffect(() => {
    try {
      const oauthClients = googleServices?.client?.[0]?.oauth_client;
      const webClientId = oauthClients?.find((c: any) => c.client_type === 3)?.client_id;
      GoogleSignin.configure({
        webClientId: webClientId,
      });
    } catch (err) {
      console.log('GoogleSignin.configure failed:', err);
    }
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserProfile(prev => ({
          ...prev,
          name: user.displayName || prev.name,
          email: user.email || prev.email || 'aqua@lumen.app',
          avatar: user.photoURL || prev.avatar
        }));

        // Fetch setup state from Firestore
        try {
          const doc = await firestore().collection('users').doc(user.uid).get();
          if (doc.exists()) {
            const data = doc.data();
            if (data) {
              setHasCompletedSetup(data.hasCompletedSetup || false);
              if (data.cashBalance !== undefined) setCashBalance(data.cashBalance);
              if (data.upiBalance !== undefined) setUpiBalance(data.upiBalance);
              if (data.monthlyBudget !== undefined) setMonthlyBudget(data.monthlyBudget);
              if (data.pinCode !== undefined) setPinCode(data.pinCode);
              if (data.userProfile !== undefined) setUserProfile(data.userProfile);
              if (data.categoryLimits !== undefined) setCategoryLimits(data.categoryLimits);
              if (data.pinnedCategories !== undefined) setPinnedCategories(data.pinnedCategories);
            }
          }
        } catch (err) {
          console.log('Error reading setup from Firestore:', err);
        }
      } else {
        setIsLoggedIn(false);
        setHasCompletedSetup(false);
      }
    });

    return unsubscribe;
  }, []);

  // Listen to Firestore real-time snapshots when logged in
  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    // Listen to user document updates
    const userUnsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(docSnapshot => {
        if (docSnapshot && docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data) {
            if (data.cashBalance !== undefined) setCashBalance(data.cashBalance);
            if (data.upiBalance !== undefined) setUpiBalance(data.upiBalance);
            if (data.monthlyBudget !== undefined) setMonthlyBudget(data.monthlyBudget);
            if (data.pinCode !== undefined) setPinCode(data.pinCode);
            if (data.userProfile !== undefined) setUserProfile(data.userProfile);
            if (data.categoryLimits !== undefined) setCategoryLimits(data.categoryLimits);
            if (data.pinnedCategories !== undefined) setPinnedCategories(data.pinnedCategories);
          }
        }
      }, err => console.log('Firestore user snapshot error:', err));

    // Listen to transactions list updates
    const txUnsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('transactions')
      .onSnapshot(querySnapshot => {
        if (!querySnapshot) return;
        const list: Transaction[] = [];
        querySnapshot.forEach(doc => {
          list.push(doc.data() as Transaction);
        });
        // Sort transactions locally by date/timestamp desc if needed
        list.sort((a, b) => b.id.localeCompare(a.id)); // simple sort or date based
        if (list.length > 0) {
          setTransactions(list);
        }
      }, err => console.log('Firestore transactions snapshot error:', err));

    return () => {
      userUnsubscribe();
      txUnsubscribe();
    };
  }, [isLoggedIn]);

  // Sync state changes to MMKV local cache (offline backup)
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
    storage.set('monthlyBudget', monthlyBudget);
  }, [monthlyBudget]);

  useEffect(() => {
    if (pinCode) {
      storage.set('pinCode', pinCode);
    } else {
      storage.remove('pinCode');
    }
  }, [pinCode]);

  useEffect(() => {
    storage.set('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    storage.set('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    storage.set('categoryLimits', JSON.stringify(categoryLimits));
  }, [categoryLimits]);

  useEffect(() => {
    storage.set('pinnedCategories', JSON.stringify(pinnedCategories));
  }, [pinnedCategories]);

  // Sync category limits & pins up to Firestore
  useEffect(() => {
    const user = auth().currentUser;
    if (user && hasCompletedSetup) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .update({ categoryLimits, pinnedCategories })
        .catch(err => console.log('Firestore category settings sync failed:', err));
    }
  }, [categoryLimits, pinnedCategories, hasCompletedSetup]);

  // Sync monthly budget changes up to Firestore
  useEffect(() => {
    const user = auth().currentUser;
    if (user && hasCompletedSetup) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .update({ monthlyBudget })
        .catch(err => console.log('Firestore budget sync failed:', err));
    }
  }, [monthlyBudget, hasCompletedSetup]);

  // Sync PIN changes up to Firestore
  useEffect(() => {
    const user = auth().currentUser;
    if (user && hasCompletedSetup) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .update({ pinCode })
        .catch(err => console.log('Firestore PIN sync failed:', err));
    }
  }, [pinCode, hasCompletedSetup]);

  const login = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (idToken) {
        const credential = auth.GoogleAuthProvider.credential(idToken);
        await auth().signInWithCredential(credential);
      } else {
        throw new Error('Google Sign-In did not return an ID token.');
      }
    } catch (err: any) {
      console.log('Google Sign-In failed:', err);
      showToast(err?.message || 'Google Sign-In failed');
    }
  };

  const logout = async () => {
    try {
      await auth().signOut();
    } catch {}
    setIsLoggedIn(false);
    setHasCompletedSetup(false);
    setCashBalance(0);
    setUpiBalance(0);
    setMonthlyBudget(0);
    setPinCode(null);
    setUserProfile(prev => ({ ...prev, biometricLock: false }));
    setTransactions(INITIAL_TRANSACTIONS);
    setCategoryLimits({
      Food: 0,
      Travel: 0,
      Stationery: 0,
      Shopping: 0,
      Entertainment: 0,
      Others: 0
    });
    setPinnedCategories(['Food', 'Travel', 'Stationery']);
    storage.clearAll();
  };

  const completeSetup = async (cashOnHand: number, upiOnHand: number, budget: number, pin: string | null, biometricLock: boolean) => {
    setCashBalance(cashOnHand);
    setUpiBalance(upiOnHand);
    setMonthlyBudget(budget);
    setPinCode(pin);
    const updatedProfile = { ...userProfile, biometricLock };
    setUserProfile(updatedProfile);
    setHasCompletedSetup(true);
    setIsLoggedIn(true);

    const user = auth().currentUser;
    if (user) {
      try {
        await firestore().collection('users').doc(user.uid).set({
          cashBalance: cashOnHand,
          upiBalance: upiOnHand,
          monthlyBudget: budget,
          pinCode: pin,
          userProfile: updatedProfile,
          hasCompletedSetup: true,
          categoryLimits,
          pinnedCategories
        });
      } catch (err) {
        console.log('Error writing setup to Firestore:', err);
      }
    }
  };

  const updateCategoryLimit = (category: string, limit: number) => {
    setCategoryLimits(prev => ({
      ...prev,
      [category]: limit
    }));
  };

  const togglePinCategory = (category: string) => {
    setPinnedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
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

    const nextCash = source === 'cash' ? Math.max(0, cashBalance - amount) : cashBalance;
    const nextUpi = source === 'upi' ? Math.max(0, upiBalance - amount) : upiBalance;

    setCashBalance(nextCash);
    setUpiBalance(nextUpi);
    setTransactions((prev: Transaction[]) => [newTx, ...prev]);

    const user = auth().currentUser;
    if (user) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .collection('transactions')
        .doc(newTx.id)
        .set(newTx)
        .catch(err => console.log('Firestore write failed:', err));

      firestore()
        .collection('users')
        .doc(user.uid)
        .update({ cashBalance: nextCash, upiBalance: nextUpi })
        .catch(err => console.log('Firestore balance update failed:', err));
    }
  };

  const refundTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const nextCash = tx.source === 'cash' ? cashBalance + tx.amount : cashBalance;
    const nextUpi = tx.source === 'upi' ? upiBalance + tx.amount : upiBalance;

    setCashBalance(nextCash);
    setUpiBalance(nextUpi);
    setTransactions((prev: Transaction[]) => prev.filter(t => t.id !== id));

    const user = auth().currentUser;
    if (user) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .collection('transactions')
        .doc(id)
        .delete()
        .catch(err => console.log('Firestore delete failed:', err));

      firestore()
        .collection('users')
        .doc(user.uid)
        .update({ cashBalance: nextCash, upiBalance: nextUpi })
        .catch(err => console.log('Firestore balance update failed:', err));
    }
  };

  const selfTransfer = (amount: number, from: 'cash' | 'upi', to: 'cash' | 'upi') => {
    const nextCash = from === 'cash' ? Math.max(0, cashBalance - amount) : cashBalance + amount;
    const nextUpi = from === 'upi' ? Math.max(0, upiBalance - amount) : upiBalance + amount;

    setCashBalance(nextCash);
    setUpiBalance(nextUpi);

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

    const user = auth().currentUser;
    if (user) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .collection('transactions')
        .doc(transferTx.id)
        .set(transferTx)
        .catch(err => console.log('Firestore transfer write failed:', err));

      firestore()
        .collection('users')
        .doc(user.uid)
        .update({ cashBalance: nextCash, upiBalance: nextUpi })
        .catch(err => console.log('Firestore balance update failed:', err));
    }
  };

  const setBiometricLock = (enabled: boolean) => {
    const updatedProfile = { ...userProfile, biometricLock: enabled };
    setUserProfile(updatedProfile);

    const user = auth().currentUser;
    if (user) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .update({ userProfile: updatedProfile })
        .catch(err => console.log('Firestore profile update failed:', err));
    }
  };

  const addFunds = (amount: number, source: 'cash' | 'upi') => {
    const nextCash = source === 'cash' ? cashBalance + amount : cashBalance;
    const nextUpi = source === 'upi' ? upiBalance + amount : upiBalance;

    setCashBalance(nextCash);
    setUpiBalance(nextUpi);

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

    const user = auth().currentUser;
    if (user) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .collection('transactions')
        .doc(addTx.id)
        .set(addTx)
        .catch(err => console.log('Firestore add funds write failed:', err));

      firestore()
        .collection('users')
        .doc(user.uid)
        .update({ cashBalance: nextCash, upiBalance: nextUpi })
        .catch(err => console.log('Firestore balance update failed:', err));
    }
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <MockStoreContext.Provider
      value={{
        isLoggedIn,
        hasCompletedSetup,
        cashBalance,
        upiBalance,
        monthlyBudget,
        pinCode,
        userProfile,
        transactions,
        login,
        logout,
        completeSetup,
        addTransaction,
        refundTransaction,
        selfTransfer,
        setBiometricLock,
        setMonthlyBudget,
        setPinCode,
        addFunds,
        categoryLimits,
        pinnedCategories,
        updateCategoryLimit,
        togglePinCategory,
        toastMessage,
        showToast
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
