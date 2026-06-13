import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Alert, StyleSheet } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import LogPaymentModal from '../components/LogPaymentModal';
import GlobalLayout from '../components/GlobalLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = ['total', 'cash', 'upi'] as const;

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { cashBalance, upiBalance, transactions, addFunds } = useMockStore();
  const [activeTab, setActiveTab] = useState<'total' | 'cash' | 'upi'>('total');
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 12);
  const fabBottom = bottomMargin + 70 + 16; // 70 navbar height + 16 spacing
  const [isLogModalVisible, setIsLogModalVisible] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isFabExpanded, setIsFabExpanded] = useState(false);

  const tabIndexAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  const toggleFab = () => {
    const toValue = isFabExpanded ? 0 : 1;
    Animated.spring(fabAnim, {
      toValue,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
    setIsFabExpanded(!isFabExpanded);
  };

  const fabItems = [
    {
      label: 'Log Payment',
      icon: 'credit_card',
      color: '#3B82F6',
      onPress: () => {
        toggleFab();
        setIsLogModalVisible(true);
      },
    },
    {
      label: 'Add Funds',
      icon: 'trending_up',
      color: '#4ade80',
      onPress: () => {
        toggleFab();
        // Mock Add Funds: add 1000 to Cash balance
        addFunds(1000, 'cash');
        Alert.alert('Add Funds', 'Successfully added ₹1,000.00 mock funds to Cash Wallet.');
      },
    },
    {
      label: 'Self Transfer',
      icon: 'swap_horiz',
      color: '#fbbf24',
      onPress: () => {
        toggleFab();
        navigation.navigate('SelfTransfer');
      },
    },
  ];

  useEffect(() => {
    const index = TABS.indexOf(activeTab);
    Animated.spring(tabIndexAnim, {
      toValue: index,
      useNativeDriver: true,
      bounciness: 12,
      speed: 12,
    }).start();
  }, [activeTab, tabIndexAnim]);

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
    >

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="flex-1">
        {/* Wallet Segmented Toggle */}
        <View className="px-6 mt-4">
          <View 
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            className="flex-row p-1 bg-surface-container/30 rounded-full border border-white/5 relative"
          >
            {containerWidth > 0 && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 4,
                  bottom: 4,
                  left: 4,
                  width: (containerWidth - 8) / 3,
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  transform: [
                    {
                      translateX: tabIndexAnim.interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: [0, (containerWidth - 8) / 3, ((containerWidth - 8) / 3) * 2],
                      }),
                    },
                    {
                      scaleX: tabIndexAnim.interpolate({
                        inputRange: [0, 0.5, 1, 1.5, 2],
                        outputRange: [1, 1.15, 1, 1.15, 1],
                      }),
                    },
                  ],
                }}
              />
            )}
            {TABS.map(tab => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                  className="flex-1 py-2 rounded-full items-center justify-center z-10"
                >
                  <Text 
                    className={`font-label-caps text-label-caps uppercase font-bold ${
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
                style={{ fontSize: 12, lineHeight: 16, fontFamily: 'Montserrat-Regular', color: 'rgba(194, 198, 214, 0.8)' }}
                className="uppercase tracking-wider mb-2"
              >
                {activeTab === 'total' ? 'Total Balance' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Balance`}
              </Text>
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 48, lineHeight: 56, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white', letterSpacing: -1 }}
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
            style={{ fontSize: 20, lineHeight: 28, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white' }}
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
                  <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '500', fontFamily: 'Montserrat-Regular', color: 'white' }}>Food</Text>
                </View>
                <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white' }}>
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
                  <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '500', fontFamily: 'Montserrat-Regular', color: 'white' }}>Travel</Text>
                </View>
                <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white' }}>
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
                  <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '500', fontFamily: 'Montserrat-Regular', color: 'white' }}>Stationery</Text>
                </View>
                <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white' }}>
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
              style={{ fontSize: 20, lineHeight: 28, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white' }}
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
                 <Text 
                  style={{ fontFamily: 'Montserrat-Bold' }} 
                  className={`text-base font-bold ${
                    tx.type === 'income' ? 'text-green-400' : tx.type === 'transfer' ? 'text-primary' : 'text-error'
                  }`}
                >
                  {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '-'}₹{tx.amount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </GlassCard>
        </View>
      </ScrollView>

      {/* Backdrop Dim overlay when FAB is expanded */}
      {isFabExpanded && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleFab}
          style={[StyleSheet.absoluteFill, { zIndex: 40 }]}
          className="bg-black/50"
        />
      )}

      {/* Expandable FAB Options Container */}
      <View 
        pointerEvents="box-none"
        className="absolute right-6 items-end justify-end z-50"
        style={{ height: 300, width: 250, bottom: fabBottom }} // Height prevents Android tap clipping, Width gives labels room
      >
  {fabItems.map((item, index) => {
    const translateY = fabAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -64 * (index + 1)],
    });
    const scale = fabAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const opacity = fabAnim.interpolate({
      inputRange: [0, 0.8, 1],
      outputRange: [0, 0.8, 1],
    });

    return (
      <Animated.View
        key={item.label}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 6, 
          transform: [{ translateY }], // <-- ONLY Translate the row
          opacity,                     // <-- Fade the whole row
        }}
        className="flex-row items-center justify-end pr-1.5 w-full"
      >
        {/* Option Label */}
        <View className="bg-surface-container-high/90 border border-white/10 px-3 py-1.5 rounded-xl shadow-md mr-3">
          <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xs font-bold uppercase tracking-wider">
            {item.label}
          </Text>
        </View>

        {/* Option Button - SCALE THIS INDEPENDENTLY */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            onPress={item.onPress}
            activeOpacity={0.8}
            style={{ backgroundColor: item.color }}
            className="w-11 h-11 rounded-full items-center justify-center shadow-lg border border-white/10"
          >
            <MaterialIcon name={item.icon} size={20} color="#10131A" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  })}

  {/* Main Floating Action Button */}
  <TouchableOpacity
    onPress={toggleFab}
    activeOpacity={0.85}
    style={{ backgroundColor: '#adc6ff' }}
    className="w-14 h-14 rounded-full border border-white/20 items-center justify-center shadow-[0_0_20px_rgba(173,198,255,0.3)]"
  >
    <Animated.View
      style={{
        transform: [
          {
            rotate: fabAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '135deg'],
            }),
          },
        ],
      }}
    >
      <MaterialIcon name="add" size={28} color="#10131A" />
    </Animated.View>
  </TouchableOpacity>
</View>

      {/* Log Payment Modal Sheet */}
      <LogPaymentModal 
        visible={isLogModalVisible} 
        onClose={() => setIsLogModalVisible(false)} 
      />
    </GlobalLayout>
  );
};
export default DashboardScreen;
