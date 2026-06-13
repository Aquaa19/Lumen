import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import LogPaymentModal from '../components/LogPaymentModal';
import GlobalLayout from '../components/GlobalLayout';
import GlowOrb from '../components/GlowOrb';
import { BlurView } from '@react-native-community/blur';
import MaterialIcon from '../components/MaterialIcon';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { cashBalance, upiBalance, userProfile, transactions } = useMockStore();
  const [activeTab, setActiveTab] = useState<'total' | 'cash' | 'upi'>('total');
  const [isLogModalVisible, setIsLogModalVisible] = useState(false);

  // Compute balance safely
  const safeCashBalance = typeof cashBalance === 'number' && !isNaN(cashBalance) ? cashBalance : 0;
  const safeUpiBalance = typeof upiBalance === 'number' && !isNaN(upiBalance) ? upiBalance : 0;
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const currentBalance = 
    activeTab === 'total' ? safeCashBalance + safeUpiBalance :
    activeTab === 'cash' ? safeCashBalance : safeUpiBalance;

  // Filter transactions based on active tab
  const filteredTransactions = safeTransactions.filter(t => {
    if (!t) return false;
    if (activeTab === 'total') return true;
    return t.source === activeTab;
  });

  // Compute category budgets dynamically
  const foodSpent = filteredTransactions.filter(t => t.category === 'Food').reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const travelSpent = filteredTransactions.filter(t => t.category === 'Travel').reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const stationerySpent = filteredTransactions.filter(t => t.category === 'Stationery').reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const budgetLimits = {
    Food: 3000,
    Travel: 1500,
    Stationery: 500,
  };

  const getProgress = (spent: number, limit: number) => {
    if (!limit || isNaN(spent)) return 0;
    return Math.min(100, Math.max(0, (spent / limit) * 100));
  };

  const getCategoryIcon = (category: string): 'restaurant' | 'directions_car' | 'menu_book' | 'local_mall' | 'movie' | 'category' => {
    switch (category) {
      case 'Food': return 'restaurant';
      case 'Travel': return 'directions_car';
      case 'Stationery': return 'menu_book';
      case 'Shopping': return 'local_mall';
      case 'Entertainment': return 'movie';
      default: return 'category';
    }
  };

  return (
    <GlobalLayout
      activeTab="dashboard"
      navigation={navigation}
      rightAction="biometric"
    >

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="flex-1">
        {/* Wallet Segmented Toggle */}
        <View className="px-6 mt-4">
          <View className="flex-row p-1 bg-surface-container/30 rounded-full border border-white/5">
            {(['total', 'cash', 'upi'] as const).map(tab => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={isActive ? {
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 3,
                  } : undefined}
                  className="flex-1 py-2 rounded-full items-center"
                >
                  <Text 
                    className={`font-label-caps text-label-caps uppercase ${
                      isActive ? 'text-primary' : 'text-on-surface-variant/50'
                    }`}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dynamic Balance Card */}
        <View className="px-6 mt-6 relative">
          <GlassCard 
            active={true} 
            className="px-6" 
            contentClassName="pt-3 pb-6"
            backgroundChildren={
              <GlowOrb 
                size={260} 
                color="#adc6ff" 
                opacity={0.2} 
                style={{ position: 'absolute', top: -130, right: -130 }} 
                gradientId="balance-card-glow"
              />
            }
          >
            <View className="items-start">
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 12, lineHeight: 16, fontFamily: 'sans-serif-medium', color: 'rgba(194, 198, 214, 0.8)' }}
                className="uppercase tracking-wider mb-2"
              >
                {activeTab === 'total' ? 'Total Balance' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Balance`}
              </Text>
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 48, lineHeight: 56, fontWeight: 'bold', fontFamily: 'sans-serif-medium', color: 'white', letterSpacing: -1 }}
                className="tracking-tight mb-4"
              >
                ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <MaterialIcon name="trending_up" size={16} color="#4ade80" />
                <Text 
                  allowFontScaling={false}
                  className="text-green-400 text-sm font-medium"
                >
                  +₹450 this week
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Budget Progress Bars */}
        <View className="px-6 mt-8">
          <Text 
            allowFontScaling={false}
            style={{ fontSize: 20, lineHeight: 28, fontWeight: 'bold', fontFamily: 'sans-serif-medium', color: 'white' }}
            className="mb-4"
          >
            Monthly Budget
          </Text>
          <GlassCard contentClassName="p-4">
            {/* Food */}
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-1.5">
                <View className="flex-row items-center gap-2">
                  <MaterialIcon name="restaurant" size={18} color="#adc6ff" />
                  <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '500', fontFamily: 'sans-serif-medium', color: 'white' }}>Food</Text>
                </View>
                <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: 'bold', fontFamily: 'sans-serif-medium', color: 'white' }}>
                  ₹{foodSpent.toLocaleString('en-IN')} / ₹{budgetLimits.Food.toLocaleString('en-IN')} ({Math.round(getProgress(foodSpent, budgetLimits.Food))}%)
                </Text>
              </View>
              <View 
                style={{ height: 5 }} 
                className="w-full bg-[#13161d] rounded-full overflow-hidden"
              >
                <View 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${getProgress(foodSpent, budgetLimits.Food)}%` }} 
                />
              </View>
            </View>

            {/* Travel */}
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-1.5">
                <View className="flex-row items-center gap-2">
                  <MaterialIcon name="directions_car" size={18} color="#22d3ee" />
                  <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '500', fontFamily: 'sans-serif-medium', color: 'white' }}>Travel</Text>
                </View>
                <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: 'bold', fontFamily: 'sans-serif-medium', color: 'white' }}>
                  ₹{travelSpent.toLocaleString('en-IN')} / ₹{budgetLimits.Travel.toLocaleString('en-IN')} ({Math.round(getProgress(travelSpent, budgetLimits.Travel))}%)
                </Text>
              </View>
              <View 
                style={{ height: 5 }} 
                className="w-full bg-[#13161d] rounded-full overflow-hidden"
              >
                <View 
                  className="h-full bg-cyan-400 rounded-full" 
                  style={{ width: `${getProgress(travelSpent, budgetLimits.Travel)}%` }} 
                />
              </View>
            </View>

            {/* Stationery */}
            <View>
              <View className="flex-row justify-between items-center mb-1.5">
                <View className="flex-row items-center gap-2">
                  <MaterialIcon name="menu_book" size={18} color="#fbbf24" />
                  <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '500', fontFamily: 'sans-serif-medium', color: 'white' }}>Stationery</Text>
                </View>
                <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: 'bold', fontFamily: 'sans-serif-medium', color: 'white' }}>
                  ₹{stationerySpent.toLocaleString('en-IN')} / ₹{budgetLimits.Stationery.toLocaleString('en-IN')} ({Math.round(getProgress(stationerySpent, budgetLimits.Stationery))}%)
                </Text>
              </View>
              <View 
                style={{ height: 5 }} 
                className="w-full bg-[#13161d] rounded-full overflow-hidden"
              >
                <View 
                  className="h-full bg-amber-400 rounded-full" 
                  style={{ width: `${getProgress(stationerySpent, budgetLimits.Stationery)}%` }} 
                />
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Recent Activity List */}
        <View className="px-6 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text 
              allowFontScaling={false}
              style={{ fontSize: 20, lineHeight: 28, fontWeight: 'bold', fontFamily: 'sans-serif-medium', color: 'white' }}
            >
              Recent Activity
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Statistics')}>
              <Text 
                allowFontScaling={false}
                className="font-label-caps text-primary text-xs font-semibold tracking-wider"
              >
                SEE ALL
              </Text>
            </TouchableOpacity>
          </View>
          <GlassCard className="p-0">
            {filteredTransactions.map((tx, idx) => (
              <TouchableOpacity
                key={tx.id}
                onPress={() => navigation.navigate('TransactionDetail', { transactionId: tx.id })}
                className={`flex-row items-center justify-between p-4 ${
                  idx !== filteredTransactions.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <View className="flex-row items-center gap-3.5">
                  <View className="w-11 h-11 rounded-full bg-white/5 border border-white/10 items-center justify-center shadow-md">
                    <MaterialIcon name={getCategoryIcon(tx.category)} size={20} color="#e1e2ec" />
                  </View>
                  <View>
                    <Text className="text-[15px] text-white font-semibold">{tx.title}</Text>
                    <Text className="text-xs text-white font-bold mt-0.5">
                      {tx.title === 'Photocopy' ? 'Yesterday' : tx.timestamp}
                    </Text>
                  </View>
                </View>
                <Text className="text-base text-error font-bold">
                  -₹{tx.amount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </GlassCard>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setIsLogModalVisible(true)}
        activeOpacity={0.8}
        className="absolute bottom-24 right-6 w-14 h-14 rounded-full border border-white/20 items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.25)] z-50"
      >
        {Platform.OS === 'android' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurRadius={10}
            overlayColor="rgba(255, 255, 255, 0.15)"
          />
        ) : Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={15}
            reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              }
            ]}
          />
        )}
        <View className="z-10 items-center justify-center">
          <MaterialIcon name="add" size={28} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Log Payment Modal Sheet */}
      <LogPaymentModal 
        visible={isLogModalVisible} 
        onClose={() => setIsLogModalVisible(false)} 
      />
    </GlobalLayout>
  );
};
export default DashboardScreen;
