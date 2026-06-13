import { Transaction } from '../types';

export const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: 'restaurant', color: '#ffb786', bgColor: 'rgba(255, 183, 134, 0.1)' },
  { name: 'Travel', icon: 'directions_car', color: '#22d3ee', bgColor: 'rgba(34, 211, 238, 0.1)' },
  { name: 'Stationery', icon: 'menu_book', color: '#fb1324', bgColor: 'rgba(251, 191, 36, 0.1)' },
  { name: 'Shopping', icon: 'local_mall', color: '#adc6ff', bgColor: 'rgba(173, 198, 255, 0.1)' },
  { name: 'Entertainment', icon: 'movie', color: '#c084fc', bgColor: 'rgba(192, 132, 252, 0.1)' },
  { name: 'Others', icon: 'category', color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)' }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    title: 'Samosa',
    amount: 15.00,
    type: 'expense',
    source: 'cash',
    category: 'Food',
    timestamp: '16:30',
    date: '12 JUN',
    note: 'Snack at canteen'
  },
  {
    id: '2',
    title: 'Uber',
    amount: 150.00,
    type: 'expense',
    source: 'upi',
    category: 'Travel',
    timestamp: '14:20',
    date: '24 JUN',
    note: 'Trip to Airport'
  },
  {
    id: '3',
    title: 'Chai',
    amount: 15.00,
    type: 'expense',
    source: 'cash',
    category: 'Food',
    timestamp: '10:15',
    date: '10 JUN',
    note: 'Morning tea'
  },
  {
    id: '4',
    title: 'Photocopy',
    amount: 15.00,
    type: 'expense',
    source: 'upi',
    category: 'Stationery',
    timestamp: '11:30',
    date: '08 JUN',
    note: 'Lab manual print'
  }
];
