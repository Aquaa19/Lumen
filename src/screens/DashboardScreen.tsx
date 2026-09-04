import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet, useWindowDimensions } from 'react-native';
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
import SpeedIcon from '../public/assets/icons/SpeedIcon';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { 
    cashBalance, upiBalance, transactions, categoryLimits, pinnedCategories, categories, goals, deleteGoal, monthlyBudget,
    includeCashInTotal, includeBankInTotal 
  } = useMockStore();
  const [activeTab, setActiveTab] = useState<'total' | 'upi' | 'cash'>('total');
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.max(280, screenWidth - 48);
  const carouselScrollRef = useRef<ScrollView>(null);
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

  const computedTotalBalance = 
    (includeCashInTotal ? safeCashBalance : 0) + (includeBankInTotal ? safeUpiBalance : 0);

  const currentBalance = 
    activeTab === 'total' ? computedTotalBalance :
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
    const year = new Date().getFullYear();
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

  // Weekly net change per account
  const computeWeeklyNet = (source?: 'cash' | 'upi') => {
    const list = source 
      ? thisWeeksTransactions.filter(t => t.source === source)
      : thisWeeksTransactions;
    const spent = list.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount ?? 0), 0);
    const income = list.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount ?? 0), 0);
    return income - spent;
  };

  const totalWeeklyNet = computeWeeklyNet();
  const upiWeeklyNet = computeWeeklyNet('upi');
  const cashWeeklyNet = computeWeeklyNet('cash');
  const netWeeklyChange = activeTab === 'total' ? totalWeeklyNet : activeTab === 'upi' ? upiWeeklyNet : cashWeeklyNet;

  // Compute category budgets dynamically
  const getProgress = (spent: number, limit: number) => {
    if (!limit || isNaN(spent)) return 0;
    return Math.min(100, Math.max(0, (spent / limit) * 100));
  };

  // Goals & Spending limits calculations
  const totalGoalTargetAmount = goals ? goals.reduce((sum, g) => sum + g.targetAmount, 0) : 0;
  // Calculate remaining monthly budget available for weekly spending after taking goals out
  const remainingBudgetForSpend = Math.max(0, monthlyBudget - totalGoalTargetAmount);
  const weeklySpendingLimit = remainingBudgetForSpend / 4.33;

  return (
    <GlobalLayout
      activeTab="dashboard"
      navigation={navigation}
    >
      <View className="flex-1 relative">
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Segmented Account Switcher */}
        <View className="px-6 mt-5 mb-3">
          <View className="flex-row p-1 rounded-full bg-white/[0.04] border border-white/10">
            {(
              [
                { id: 'total', label: 'Total' },
                { id: 'upi', label: 'Bank (UPI)' },
                { id: 'cash', label: 'Cash' },
              ] as const
            ).map((tab, idx) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => {
                    setActiveTab(tab.id);
                    carouselScrollRef.current?.scrollTo({ x: idx * (cardWidth + 12), animated: true });
                  }}
                  activeOpacity={0.8}
                  className={`flex-1 py-1.5 rounded-full items-center justify-center ${
                    isActive ? 'bg-primary/25 border border-primary/40' : ''
                  }`}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: isActive ? 'Montserrat-Bold' : 'Montserrat-Medium',
                      fontSize: 12,
                      color: isActive ? '#93c5fd' : 'rgba(194, 198, 214, 0.6)',
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Swipeable Accounts Carousel */}
        <ScrollView
          ref={carouselScrollRef}
          horizontal
          pagingEnabled={false}
          snapToInterval={cardWidth + 12}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          onMomentumScrollEnd={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / (cardWidth + 12));
            const tabs: ('total' | 'upi' | 'cash')[] = ['total', 'upi', 'cash'];
            if (tabs[index] && tabs[index] !== activeTab) {
              setActiveTab(tabs[index]);
            }
          }}
        >
          {/* Card 1: Total Balance */}
          <View style={{ width: cardWidth }}>
            <GlassCard
              active={activeTab === 'total'}
              contentClassName="pt-3 pb-6 px-6"
              backgroundChildren={
                <GlowOrb
                  size={260}
                  color="#adc6ff"
                  opacity={0.2}
                  style={{ position: 'absolute', top: -130, right: -130 }}
                  gradientId="balance-card-glow-total"
                />
              }
            >
              <View className="items-start w-full">
                <View className="flex-row items-center justify-between w-full mb-2">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcon name="account_balance_wallet" size={16} color="#adc6ff" />
                    <Text
                      allowFontScaling={false}
                      style={{ fontSize: 12, lineHeight: 16, fontFamily: 'Montserrat-Regular', color: 'rgba(194, 198, 214, 0.8)' }}
                      className="uppercase tracking-wider"
                    >
                      Total Balance
                    </Text>
                  </View>
                  <View className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
                    <Text style={{ fontSize: 10, fontFamily: 'Montserrat-SemiBold', color: '#93c5fd' }}>
                      {includeBankInTotal && includeCashInTotal
                        ? 'Bank + Cash'
                        : includeBankInTotal
                        ? 'Bank Only'
                        : 'Cash Only'}
                    </Text>
                  </View>
                </View>

                <Text
                  allowFontScaling={false}
                  style={{ fontSize: 44, lineHeight: 52, fontFamily: 'Montserrat-Bold', color: 'white', letterSpacing: -1 }}
                  className="tracking-tight mb-4"
                >
                  ₹{computedTotalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>

                <View className="flex-row items-center justify-between w-full">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcon
                      name={totalWeeklyNet >= 0 ? "trending_up" : "trending_down"}
                      size={16}
                      color={totalWeeklyNet >= 0 ? "#4ade80" : "#f87171"}
                    />
                    <Text
                      allowFontScaling={false}
                      style={{ fontFamily: 'Montserrat-Medium' }}
                      className={totalWeeklyNet >= 0 ? "text-green-400 text-sm font-medium" : "text-red-400 text-sm font-medium"}
                    >
                      {totalWeeklyNet >= 0 ? `+₹${totalWeeklyNet.toLocaleString('en-IN')}` : `-₹${Math.abs(totalWeeklyNet).toLocaleString('en-IN')}`} this week
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    Swipe for accounts →
                  </Text>
                </View>
              </View>
            </GlassCard>
          </View>

          {/* Card 2: Bank Account (UPI) */}
          <View style={{ width: cardWidth }}>
            <GlassCard
              active={activeTab === 'upi'}
              contentClassName="pt-3 pb-6 px-6"
              backgroundChildren={
                <GlowOrb
                  size={260}
                  color="#3B82F6"
                  opacity={0.22}
                  style={{ position: 'absolute', top: -130, right: -130 }}
                  gradientId="balance-card-glow-upi"
                />
              }
            >
              <View className="items-start w-full">
                <View className="flex-row items-center justify-between w-full mb-2">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcon name="account_balance" size={16} color="#60a5fa" />
                    <Text
                      allowFontScaling={false}
                      style={{ fontSize: 12, lineHeight: 16, fontFamily: 'Montserrat-Regular', color: 'rgba(194, 198, 214, 0.8)' }}
                      className="uppercase tracking-wider"
                    >
                      Bank Account (UPI)
                    </Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded-full border ${
                    includeBankInTotal ? 'bg-primary/20 border-primary/40' : 'bg-white/5 border-white/10'
                  }`}>
                    <Text style={{ fontSize: 10, fontFamily: 'Montserrat-SemiBold', color: includeBankInTotal ? '#60a5fa' : '#8c909f' }}>
                      {includeBankInTotal ? 'In Total' : 'Excluded'}
                    </Text>
                  </View>
                </View>

                <Text
                  allowFontScaling={false}
                  style={{ fontSize: 44, lineHeight: 52, fontFamily: 'Montserrat-Bold', color: '#60a5fa', letterSpacing: -1 }}
                  className="tracking-tight mb-4"
                >
                  ₹{safeUpiBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>

                <View className="flex-row items-center justify-between w-full">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcon
                      name={upiWeeklyNet >= 0 ? "trending_up" : "trending_down"}
                      size={16}
                      color={upiWeeklyNet >= 0 ? "#4ade80" : "#f87171"}
                    />
                    <Text
                      allowFontScaling={false}
                      style={{ fontFamily: 'Montserrat-Medium' }}
                      className={upiWeeklyNet >= 0 ? "text-green-400 text-sm font-medium" : "text-red-400 text-sm font-medium"}
                    >
                      {upiWeeklyNet >= 0 ? `+₹${upiWeeklyNet.toLocaleString('en-IN')}` : `-₹${Math.abs(upiWeeklyNet).toLocaleString('en-IN')}`} this week
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 11, color: 'rgba(96,165,250,0.6)' }}>
                    Online / UPI
                  </Text>
                </View>
              </View>
            </GlassCard>
          </View>

          {/* Card 3: Cash Wallet */}
          <View style={{ width: cardWidth }}>
            <GlassCard
              active={activeTab === 'cash'}
              contentClassName="pt-3 pb-6 px-6"
              backgroundChildren={
                <GlowOrb
                  size={260}
                  color="#34d399"
                  opacity={0.18}
                  style={{ position: 'absolute', top: -130, right: -130 }}
                  gradientId="balance-card-glow-cash"
                />
              }
            >
              <View className="items-start w-full">
                <View className="flex-row items-center justify-between w-full mb-2">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcon name="payments" size={16} color="#34d399" />
                    <Text
                      allowFontScaling={false}
                      style={{ fontSize: 12, lineHeight: 16, fontFamily: 'Montserrat-Regular', color: 'rgba(194, 198, 214, 0.8)' }}
                      className="uppercase tracking-wider"
                    >
                      Cash on Hand
                    </Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded-full border ${
                    includeCashInTotal ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/10'
                  }`}>
                    <Text style={{ fontSize: 10, fontFamily: 'Montserrat-SemiBold', color: includeCashInTotal ? '#34d399' : '#8c909f' }}>
                      {includeCashInTotal ? 'In Total' : 'Excluded'}
                    </Text>
                  </View>
                </View>

                <Text
                  allowFontScaling={false}
                  style={{ fontSize: 44, lineHeight: 52, fontFamily: 'Montserrat-Bold', color: '#34d399', letterSpacing: -1 }}
                  className="tracking-tight mb-4"
                >
                  ₹{safeCashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>

                <View className="flex-row items-center justify-between w-full">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcon
                      name={cashWeeklyNet >= 0 ? "trending_up" : "trending_down"}
                      size={16}
                      color={cashWeeklyNet >= 0 ? "#4ade80" : "#f87171"}
                    />
                    <Text
                      allowFontScaling={false}
                      style={{ fontFamily: 'Montserrat-Medium' }}
                      className={cashWeeklyNet >= 0 ? "text-green-400 text-sm font-medium" : "text-red-400 text-sm font-medium"}
                    >
                      {cashWeeklyNet >= 0 ? `+₹${cashWeeklyNet.toLocaleString('en-IN')}` : `-₹${Math.abs(cashWeeklyNet).toLocaleString('en-IN')}`} this week
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 11, color: 'rgba(52,211,153,0.6)' }}>
                    Physical Cash
                  </Text>
                </View>
              </View>
            </GlassCard>
          </View>
        </ScrollView>

        {/* Carousel Pagination Dots */}
        <View className="flex-row justify-center items-center gap-2 mt-3 mb-1">
          {(
            [
              { id: 'total', color: '#adc6ff' },
              { id: 'upi', color: '#60a5fa' },
              { id: 'cash', color: '#34d399' },
            ] as const
          ).map((dot, idx) => {
            const isActive = activeTab === dot.id;
            return (
              <TouchableOpacity
                key={dot.id}
                onPress={() => {
                  setActiveTab(dot.id);
                  carouselScrollRef.current?.scrollTo({ x: idx * (cardWidth + 12), animated: true });
                }}
                activeOpacity={0.8}
                style={{
                  width: isActive ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isActive ? dot.color : 'rgba(255, 255, 255, 0.2)',
                }}
              />
            );
          })}
        </View>

        {/* Weekly Spending Limit Card (only when monthly budget is configured) */}
        {monthlyBudget > 0 && (
          <View className="px-6 mt-6">
            <GlassCard className="px-5 py-4 border-l-4 border-l-blue-400">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 11, color: 'rgba(255,255,255,0.6)' }} className="uppercase tracking-wider mb-1">
                    Safe Weekly Spending Limit
                  </Text>
                  <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: 'white' }}>
                    ₹{weeklySpendingLimit.toLocaleString('en-IN', { maximumFractionDigits: 2 })} / week
                  </Text>
                </View>
                <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }} className="w-10 h-10 rounded-full items-center justify-center">
                  <SpeedIcon size={20} color="#adc6ff" />
                </View>
              </View>
              {totalGoalTargetAmount > 0 && (
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 11, color: '#4ade80', marginTop: 6 }}>
                  Adjusted for savings goal allocations: -₹{totalGoalTargetAmount.toLocaleString('en-IN')}
                </Text>
              )}
            </GlassCard>
          </View>
        )}

        {/* Financial Goals Tracker */}
        {goals && goals.length > 0 && (
          <View className="px-6 mt-8">
            <Text 
              allowFontScaling={false}
              style={{ fontSize: 20, lineHeight: 28, fontFamily: 'Montserrat-Bold', color: 'white' }}
              className="mb-4"
            >
              Financial Goals
            </Text>
            <View className="gap-3">
              {goals.map((goal) => {
                // Determine how much is saved based on income vs expenses or mock it
                // We'll set a basic progress calculation. E.g. 0% to start or based on user setup
                const completionPercentage = Math.round((goal.currentSaved / goal.targetAmount) * 100);
                return (
                  <GlassCard key={goal.id} contentClassName="p-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <View>
                        <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, color: 'white' }}>
                          {goal.title}
                        </Text>
                        <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                          Target: {goal.deadline}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                        <MaterialIcon name="delete" size={18} color="#f87171" />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row justify-between items-center mb-1.5">
                      <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                        ₹{goal.currentSaved.toLocaleString('en-IN')} saved of ₹{goal.targetAmount.toLocaleString('en-IN')}
                      </Text>
                      <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 12, color: '#4ade80' }}>
                        {completionPercentage}%
                      </Text>
                    </View>
                    <View style={{ height: 6 }} className="w-full bg-black/40 rounded-full overflow-hidden">
                      <View 
                        className="h-full bg-emerald-400 rounded-full" 
                        style={{ width: `${Math.max(5, Math.min(100, completionPercentage))}%` }} 
                      />
                    </View>
                  </GlassCard>
                );
              })}
            </View>
          </View>
        )}

        {/* Budget Progress Bars */}
        <View className="px-6 mt-8">
          {(() => {
            const monthsList = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const currentMonthCode = monthsList[now.getMonth()];
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const currentMonthLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

            // Filter expenses strictly for the active real-time month (auto-resets at month change)
            const currentMonthExpenses = filteredTransactions.filter(t => {
              if (!t || t.type !== 'expense') return false;
              const parts = t.date.split(' ');
              return parts[1] === currentMonthCode;
            });

            return (
              <>
                <View className="flex-row justify-between items-center mb-4">
                  <Text 
                    allowFontScaling={false}
                    style={{ fontSize: 20, lineHeight: 28, fontFamily: 'Montserrat-Bold', color: 'white' }}
                  >
                    Monthly Budget
                  </Text>
                  <View className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10">
                    <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize: 11, color: '#adc6ff' }}>
                      {currentMonthLabel}
                    </Text>
                  </View>
                </View>
                <GlassCard contentClassName="p-4">
                  {pinnedCategories.length === 0 ? (
                    <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-center py-4">
                      No pinned categories. Configure them in Settings under Custom Categories.
                    </Text>
                  ) : (
                    pinnedCategories.map((catName, idx) => {
                      const spent = currentMonthExpenses.filter(t => t.category === catName).reduce((sum, t) => sum + (t.amount ?? 0), 0);
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
                              <Text style={{ fontSize: 16, lineHeight: 24, fontFamily: 'Montserrat-Medium', color: 'white' }}>{catName}</Text>
                            </View>
                            <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: 'Montserrat-Bold', color: 'white' }}>
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
              </>
            );
          })()}
        </View>

        {/* Recent Activity List */}
        <View className="px-6 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center gap-2">
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 20, lineHeight: 28, fontFamily: 'Montserrat-Bold', color: 'white' }}
              >
                Recent Activity
              </Text>
              {activeTab !== 'total' && (
                <View className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                  <Text style={{ fontSize: 10, fontFamily: 'Montserrat-Medium', color: activeTab === 'cash' ? '#34d399' : '#60a5fa' }}>
                    {activeTab === 'cash' ? 'Cash' : 'Bank (UPI)'}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Payments')}>
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 12, fontFamily: 'Montserrat-Bold', color: '#e1e2ec' }}
                className="font-label-caps text-primary text-xs font-semibold tracking-wider"
              >
                SEE ALL
              </Text>
            </TouchableOpacity>
          </View>
          <GlassCard className="p-0">
            {(() => {
              const recentTxs = filteredTransactions.slice(0, 10);
              if (recentTxs.length === 0) {
                return (
                  <View className="py-6 items-center justify-center">
                    <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-sm">
                      No recent transactions for {activeTab === 'cash' ? 'Cash' : activeTab === 'upi' ? 'Bank (UPI)' : 'this account'}
                    </Text>
                  </View>
                );
              }
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
                      const isIncome = tx.type === 'income';
                      const isTransfer = tx.type === 'transfer';
                      const defaultCat = categories.find(c => c.name === tx.category) || { color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)', icon: 'category' };
                      const iconName = isIncome ? 'trending_up' : isTransfer ? 'swap_horiz' : defaultCat.icon;
                      const iconColor = isIncome ? '#4ade80' : isTransfer ? '#60a5fa' : defaultCat.color;
                      const iconBg = isIncome ? 'rgba(74, 222, 128, 0.15)' : isTransfer ? 'rgba(96, 165, 250, 0.15)' : defaultCat.bgColor;

                      return (
                        <View 
                          style={{ backgroundColor: iconBg, borderColor: iconColor + '33' }}
                          className="w-11 h-11 rounded-full border items-center justify-center shadow-md"
                        >
                          <MaterialIcon name={iconName as any} size={20} color={iconColor} />
                        </View>
                      );
                    })()}
                    <View>
                      <Text style={{ fontFamily: 'Montserrat-SemiBold' }} className="text-[15px] text-white">{tx.title}</Text>
                      <Text style={{ fontFamily: 'Montserrat-Medium' }} className="text-xs text-white/60 mt-0.5">
                        {tx.date} • {tx.timestamp} • {tx.source.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                   <Text 
                    style={{ fontFamily: 'Montserrat-Bold' }} 
                    className={`text-base ${
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
          <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xs uppercase tracking-wider">
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
