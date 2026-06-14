export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  source: 'cash' | 'upi';
  category: string;
  timestamp: string; // e.g. '14:30'
  date: string;      // e.g. '24 JUN' or '12 JUN'
  note?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  biometricLock: boolean;
}

export interface Category {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  isCustom?: boolean;
}

export interface MockStoreState {
  isLoggedIn: boolean;
  hasCompletedSetup: boolean;
  cashBalance: number;
  upiBalance: number;
  userProfile: UserProfile;
  transactions: Transaction[];
}
