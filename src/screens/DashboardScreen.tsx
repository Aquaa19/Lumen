import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import LogPaymentModal from '../components/LogPaymentModal';
import AddFundsModal from '../components/AddFundsModal';
import GlobalLayout from '../components/GlobalLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { DEFAULT_CATEGORIES } from '../utils/constants';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { cashBalance, upiBalance, transactions, categoryLimits, pinnedCategories, categories } = useMockStore();
  const activeTab = 'total';
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 12);
  const fabBottom = bottomMargin + 70 + 16; // 70 navbar height + 16 spacing
  // 70 (Navbar Height) + exact bottom margin + 4px (to protect the drop shadow)
  const bottomPadding = 70 + bottomMargin + 4;
  const [isLogModalVisible, setIsLogModalVisible] = useState(false);
  const [isAddFundsModalVisible, setIsAddFundsModalVisible] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isFabExpanded, setIsFabExpanded] = useState(false);

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
        setIsAddFundsModalVisible(true);
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

  // Helper to parse dates
  const parseTxDate = (dateStr: string) => {
    const parts = dateStr.split(' ');
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    const months: { [key: string]: number } = {
      JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
      JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
    };
    const month = months[monthStr] ?? 0;
    const year = 2026;
    return new Date(year, month, day);
  };

  // Calculate weekly spent and net change dynamically
  const now = new Date();
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const thisWeeksTransactions = safeTransactions.filter(t => {
    if (!t) return false;
    try {
      return parseTxDate(t.date) >= sevenDaysAgo;
    } catch {
      return false;
    }
  });

  const totalSpentThisWeek = thisWeeksTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const totalIncomeThisWeek = thisWeeksTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const netWeeklyChange = totalIncomeThisWeek - totalSpentThisWeek;

  // Compute category budgets dynamically
  const getProgress = (spent: number, limit: number) => {
    if (!limit || isNaN(spent)) return 0;
    return Math.min(100, Math.max(0, (spent / limit) * 100));
  };



  return (
    <GlobalLayout
      activeTab="dashboard"
      navigation={navigation}
    >
      <View className="flex-1 relative">
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} className="flex-1" showsVerticalScrollIndicator={false}>
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
                Total Balance
              </Text>
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 48, lineHeight: 56, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white', letterSpacing: -1 }}
                className="tracking-tight mb-4"
              >
                ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <MaterialIcon 
                  name={netWeeklyChange >= 0 ? "trending_up" : "trending_down"} 
                  size={16} 
                  color={netWeeklyChange >= 0 ? "#4ade80" : "#f87171"} 
                />
                <Text 
                  allowFontScaling={false}
                  className={netWeeklyChange >= 0 ? "text-green-400 text-sm font-medium" : "text-red-400 text-sm font-medium"}
                >
                  {netWeeklyChange >= 0 ? `+₹${netWeeklyChange.toLocaleString('en-IN')}` : `-₹${Math.abs(netWeeklyChange).toLocaleString('en-IN')}`} this week
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
            {pinnedCategories.length === 0 ? (
              <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-center py-4">
                No pinned categories. Configure them in Settings under Custom Categories.
              </Text>
            ) : (
              pinnedCategories.map((catName, idx) => {
                const spent = filteredTransactions.filter(t => t.category === catName).reduce((sum, t) => sum + (t.amount ?? 0), 0);
                const limit = categoryLimits[catName] ?? 0;
                const progress = getProgress(spent, limit);
                
                // Get matching category properties (color, icon)
                const catInfo = categories.find(c => c.name === catName) ?? {
                  icon: 'category',
                  color: '#94a3b8'
                };

                return (
                  <View key={catName} className={idx < pinnedCategories.length - 1 ? "mb-5" : ""}>
                    <View className="flex-row justify-between items-center mb-1.5">
                      <View className="flex-row items-center gap-2">
                        <MaterialIcon name={catInfo.icon} size={18} color={catInfo.color} />
                        <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: '500', fontFamily: 'Montserrat-Regular', color: 'white' }}>{catName}</Text>
                      </View>
                      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white' }}>
                        ₹{spent.toLocaleString('en-IN')} / ₹{limit.toLocaleString('en-IN')} ({Math.round(progress)}%)
                      </Text>
                    </View>
                    <View 
                      style={{ height: 5 }} 
                      className="w-full bg-[#13161d] rounded-full overflow-hidden"
                    >
                      <View 
                        className="h-full rounded-full" 
                        style={{ width: `${progress}%`, backgroundColor: catInfo.color }} 
                      />
                    </View>
                  </View>
                );
              })
            )}
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
            <TouchableOpacity onPress={() => navigation.navigate('Payments')}>
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 12, fontWeight: '700', fontFamily: 'Montserrat-Bold', color: '#e1e2ec' }}
                className="font-label-caps text-primary text-xs font-semibold tracking-wider"
              >
                SEE ALL
              </Text>
            </TouchableOpacity>
          </View>
          <GlassCard className="p-0">
            {(() => {
              const recentTxs = filteredTransactions.slice(0, 10);
              return recentTxs.map((tx, idx) => (
                <TouchableOpacity
                  key={tx.id}
                  onPress={() => navigation.navigate('TransactionDetail', { transactionId: tx.id })}
                  className={`flex-row items-center justify-between p-4 ${
                    idx !== recentTxs.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <View className="flex-row items-center gap-3.5">
                    {(() => {
                      const catConfig = categories.find(c => c.name === tx.category) || { color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)', icon: 'category' };
                      return (
                        <View 
                          style={{ backgroundColor: catConfig.bgColor, borderColor: catConfig.color + '33' }}
                          className="w-11 h-11 rounded-full border items-center justify-center shadow-md"
                        >
                          <MaterialIcon name={catConfig.icon as any} size={20} color={catConfig.color} />
                        </View>
                      );
                    })()}
                    <View>
                      <Text className="text-[15px] text-white font-semibold">{tx.title}</Text>
                      <Text className="text-xs text-white font-bold mt-0.5">
                        {tx.title === 'Photocopy' ? 'Yesterday' : tx.date} • {tx.timestamp}
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
              ));
            })()}
          </GlassCard>
        </View>
      </ScrollView>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']} // True Pitch Black
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 140,
        }}
        pointerEvents="none"
      />
      </View>

      {/* Backdrop Dim/Blur overlay when FAB is expanded */}
      {isFabExpanded && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleFab}
          style={[StyleSheet.absoluteFill, { zIndex: 40 }]}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={15}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.5)"
          />
        </TouchableOpacity>
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

      {/* Add Funds Modal Sheet */}
      <AddFundsModal
        visible={isAddFundsModalVisible}
        onClose={() => setIsAddFundsModalVisible(false)}
      />
    </GlobalLayout>
  );
};
export default DashboardScreen;
