import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import GlobalLayout from '../components/GlobalLayout';
import MaterialIcon from '../components/MaterialIcon';

export const StatisticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { transactions } = useMockStore();

  // Compute total spent dynamically
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Compute category breakdown metrics
  const categoryStats = DEFAULT_CATEGORIES.map(cat => {
    const catTxs = transactions.filter(t => t.category === cat.name);
    const amount = catTxs.reduce((sum, t) => sum + t.amount, 0);
    const count = catTxs.length;
    const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
    return {
      ...cat,
      amount,
      count,
      percentage
    };
  }).filter(stat => stat.count > 0); // Only show categories with transactions

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
      activeTab="statistics"
      navigation={navigation}
      title="FINANCE INTELLIGENCE"
      rightAction="profile"
    >

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="flex-1 px-6 pt-6">
        {/* Month Selector */}
        <View className="items-center mb-6">
          <Text 
            allowFontScaling={false}
            style={{ fontSize: 28, lineHeight: 34, fontWeight: 'bold', fontFamily: 'sans-serif-medium', color: '#e1e2ec' }}
            className="mb-3"
          >
            Statistics
          </Text>
          <View className="glass-panel rounded-full px-4 py-2 flex-row items-center gap-4 border border-white/10">
            <TouchableOpacity><MaterialIcon name="chevron_left" color="#8c909f" size={20} /></TouchableOpacity>
            <Text className="font-title-md text-title-md text-on-surface">June 2026</Text>
            <TouchableOpacity><MaterialIcon name="chevron_right" color="#8c909f" size={20} /></TouchableOpacity>
          </View>
        </View>

        {/* Spent Chart Card */}
        <GlassCard className="p-4 mb-6">
          <View className="flex-row justify-between items-end mb-6">
            <View>
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 12, lineHeight: 16, fontFamily: 'sans-serif-medium', color: '#c2c6d6' }}
                className="uppercase tracking-wider mb-1"
              >
                Total Spent
              </Text>
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 48, lineHeight: 56, fontWeight: 'bold', fontFamily: 'sans-serif-medium', color: '#adc6ff', letterSpacing: -1 }}
              >
                ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MaterialIcon name="trending_up" color="#4ade80" size={14} />
              <Text className="font-label-caps text-label-caps text-tertiary">
                +12% vs last month
              </Text>
            </View>
          </View>

          {/* SVG Spending Curve */}
          <View className="h-44 w-full relative justify-end">
            <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              {/* Fill Path */}
              <Path
                d="M0,80 Q20,60 40,70 T80,40 T100,20 L100,100 L0,100 Z"
                fill="url(#chartFill)"
              />
              {/* Line Path */}
              <Path
                d="M0,80 Q20,60 40,70 T80,40 T100,20"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
              />
            </Svg>
            {/* Axis labels */}
            <View className="flex-row justify-between mt-2">
              <Text className="font-label-caps text-[10px] text-on-surface-variant">1st</Text>
              <Text className="font-label-caps text-[10px] text-on-surface-variant">15th</Text>
              <Text className="font-label-caps text-[10px] text-on-surface-variant">30th</Text>
            </View>
          </View>
        </GlassCard>

        {/* Breakdown Title */}
        <Text 
          allowFontScaling={false}
          style={{ fontSize: 20, lineHeight: 28, fontWeight: 'bold', fontFamily: 'sans-serif-medium', color: 'white' }}
          className="mb-4"
        >
          Category Breakdown
        </Text>

        {/* Category Breakdown List */}
        <View className="gap-3">
          {categoryStats.map(stat => (
            <GlassCard key={stat.name} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 items-center justify-center">
                  <MaterialIcon name={getCategoryIcon(stat.name)} size={22} color="#3B82F6" />
                </View>
                <View>
                  <Text className="font-title-md text-body-sm text-on-surface font-semibold">{stat.name}</Text>
                  <Text className="font-body-sm text-[12px] text-on-surface-variant">{stat.count} Transactions</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-title-md text-body-sm text-on-surface font-bold">
                  ₹{stat.amount.toFixed(2)}
                </Text>
                <Text className="font-label-caps text-label-caps text-primary">{stat.percentage}%</Text>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </GlobalLayout>
  );
};
export default StatisticsScreen;
