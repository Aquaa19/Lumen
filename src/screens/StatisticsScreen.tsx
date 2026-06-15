import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Filter, FeGaussianBlur, Circle, G } from 'react-native-svg';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import GlobalLayout from '../components/GlobalLayout';
import MaterialIcon from '../components/MaterialIcon';
import GlowOrb from '../components/GlowOrb';
import LinearGradient from 'react-native-linear-gradient';

export const StatisticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { transactions, monthlyBudget, categories } = useMockStore();
  const insets = useSafeAreaInsets();
  // Matches the exact bottom placement of your GlobalBottomNavbar
  const navbarBottomMargin = Math.max(insets.bottom, 12); 
  // 70 (Navbar Height) + exact bottom margin + 4px (to protect the drop shadow)
  const bottomPadding = 70 + navbarBottomMargin + 4;
  
  // Compute total spent dynamically (only expenses)
  const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Compute category breakdown metrics
  const categoryStats = categories.map(cat => {
    const catTxs = transactions.filter(t => t.category === cat.name && t.type === 'expense');
    const amount = catTxs.reduce((sum, t) => sum + t.amount, 0);
    const count = catTxs.length;
    const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
    return {
      ...cat,
      amount,
      count,
      percentage
    };
  });

  // Prepare active stats for the donut chart
  const activeStats = categoryStats.filter(s => s.amount > 0);
  const totalPercentage = activeStats.reduce((sum, s) => sum + s.percentage, 0);

  // Normalize percentages so they sum to exactly 100 if totalSpent > 0
  let adjustedStats = [...activeStats];
  if (totalSpent > 0 && adjustedStats.length > 0) {
    const sumAdjusted = adjustedStats.reduce((sum, s) => sum + s.percentage, 0);
    if (sumAdjusted !== 100) {
      // Add or subtract difference from the largest segment
      const maxIndex = adjustedStats.findIndex(s => s.percentage === Math.max(...adjustedStats.map(x => x.percentage)));
      if (maxIndex !== -1) {
        adjustedStats[maxIndex].percentage += (100 - sumAdjusted);
      }
    }
  }

  const radius = 34;
  const circumference = 2 * Math.PI * radius; // ~213.63
  let accumulatedPercent = 0;

  return (
    <GlobalLayout
      activeTab="statistics"
      navigation={navigation}
      title="Lumen Growth"
    >
      <View className="flex-1 relative">
        {/* Glow Orb 1: Top-Left */}
        <GlowOrb 
          size={400} 
          color="#adc6ff" 
          opacity={0.25} 
          style={{ position: 'absolute', top: -160, left: -160 }} 
          gradientId="stats-glow-top-left"
        />

        {/* Glow Orb 2: Shifted beside first category card as a semi-circle */}
        <GlowOrb 
          size={500} 
          color="#adc6ff" 
          opacity={0.3} 
          style={{ position: 'absolute', top: 400, right: -250 }} 
          gradientId="stats-glow-bottom-right"
        />

        <ScrollView contentContainerStyle={{ paddingBottom: 130 }} className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          {/* Month Selector */}
          <View className="items-center mb-6">
            <View className="glass-panel rounded-full px-5 py-2.5 flex-row items-center gap-5 border border-white/10">
              <TouchableOpacity>
                <MaterialIcon name="chevron_left" color="#c2c6d6" size={26} />
              </TouchableOpacity>
              
              <Text 
                allowFontScaling={false}
                style={{ 
                  fontFamily: 'Montserrat-Bold', 
                  fontSize: 16,      // Explicitly sets a strong size
                  letterSpacing: 0.5 
                }} 
                className="text-white"
              >
                June 2026
              </Text>
              
              <TouchableOpacity>
                <MaterialIcon name="chevron_right" color="#c2c6d6" size={26} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Spent Donut Chart Card */}
          <GlassCard className="p-5 mb-6">
            {/* Top Row: Title & Budget Warning status */}
            <View className="flex-row justify-between items-center mb-5">
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 12, lineHeight: 16, fontFamily: 'Montserrat-Bold', color: '#c2c6d6' }}
                className="uppercase tracking-wider"
              >
                Category Spending
              </Text>
              <View className="flex-row items-center gap-1">
                <MaterialIcon 
                  name={monthlyBudget === 0 || totalSpent <= monthlyBudget ? "check_circle" : "warning"} 
                  color={monthlyBudget === 0 || totalSpent <= monthlyBudget ? "#4ade80" : "#ef4444"} 
                  size={14} 
                />
                <Text 
                  style={{ fontFamily: 'Montserrat-Bold' }} 
                  className={`font-label-caps text-label-caps ${monthlyBudget === 0 || totalSpent <= monthlyBudget ? "text-emerald-400" : "text-error"}`}
                >
                  {monthlyBudget === 0 ? "Under budget" : totalSpent <= monthlyBudget ? `${Math.round((totalSpent / monthlyBudget) * 100)}% of budget` : "Over budget!"}
                </Text>
              </View>
            </View>

            {/* Donut Chart Container */}
            <View className="align-center items-center justify-center relative my-4" style={{ height: 200 }}>
              <Svg height="100%" width="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                <Defs>
                  <Filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <FeGaussianBlur stdDeviation="2" result="blur" />
                  </Filter>
                </Defs>
                <G transform="rotate(-90 50 50)">
                  {totalSpent === 0 || adjustedStats.length === 0 ? (
                    // Empty placeholder state circle
                    <Circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="6"
                    />
                  ) : (
                    adjustedStats.map((stat) => {
                      const strokeDash = (stat.percentage * circumference) / 100;
                      const strokeOffset = - (accumulatedPercent * circumference) / 100;
                      accumulatedPercent += stat.percentage;

                      return (
                        <Circle
                          key={stat.name}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={stat.color || '#adc6ff'}
                          strokeWidth="7"
                          strokeDasharray={`${strokeDash} ${circumference}`}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                        />
                      );
                    })
                  )}
                </G>
              </Svg>

              {/* Absolute Center Labels */}
              <View style={StyleSheet.absoluteFill} className="justify-center items-center pointer-events-none">
                <Text 
                  allowFontScaling={false}
                  style={{ fontFamily: 'Montserrat-Regular', fontSize: 11, color: '#c2c6d6', letterSpacing: 1 }} 
                  className="uppercase"
                >
                  Total Spent
                </Text>
                <Text 
                  allowFontScaling={false}
                  style={{ fontFamily: 'Montserrat-Bold', fontSize: 24, color: 'white', marginTop: 4 }}
                >
                  ₹{totalSpent.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Custom Clear Legend Row/Grid */}
            {adjustedStats.length > 0 && (
              <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-white/5">
                {adjustedStats.map(stat => (
                  <View key={stat.name} className="flex-row items-center gap-1.5">
                    <View style={{ backgroundColor: stat.color }} className="w-2.5 h-2.5 rounded-full" />
                    <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                      {stat.name} <Text style={{ color: '#adc6ff' }}>{stat.percentage}%</Text>
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </GlassCard>

          <Text 
            allowFontScaling={false}
            style={{ fontSize: 20, lineHeight: 28, fontFamily: 'Montserrat-Bold', color: 'white' }}
            className="mb-4"
          >
            Category Breakdown
          </Text>

          {/* Category Breakdown List */}
          <View className="gap-3">
            {categoryStats.map(stat => (
              <GlassCard 
                key={stat.name} 
                contentClassName="flex-row items-center justify-between p-4"
              >
                {/* Left Group (Identity) */}
                <View className="flex-row items-center gap-4">
                  {/* Icon Wrapper */}
                  <View 
                    style={{ backgroundColor: stat.bgColor || 'rgba(0,0,0,0.3)', borderColor: stat.color ? stat.color + '33' : 'rgba(255,255,255,0.1)' }}
                    className="w-12 h-12 rounded-full border items-center justify-center"
                  >
                    <MaterialIcon name={stat.icon as any} size={22} color={stat.color || '#adc6ff'} />
                  </View>
                  
                  {/* Text Block */}
                  <View className="flex-col items-start">
                    <Text 
                      style={{ fontFamily: 'Montserrat-Bold', fontSize: 22, color: 'white' }}
                    >
                      {stat.name}
                    </Text>
                    {/* Transaction Count */}
                    <Text 
                      style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: 'rgba(255, 255, 255, 0.63)', marginTop: 2 }}
                    >
                      {stat.count} Transactions
                    </Text>
                  </View>
                </View>

                {/* Right Group (Metrics) */}
                <View className="flex-col items-end">
                  <Text 
                    style={{ fontFamily: 'Montserrat-Bold', fontSize: 22, color: 'white' }}
                  >
                    ₹{stat.amount.toFixed(2)}
                  </Text>
                  <Text 
                    style={{ fontFamily: 'Montserrat-Bold', fontSize: 13, color: '#adc6ff', marginTop: 4 }}
                  >
                    {stat.percentage}%
                  </Text>
                </View>
              </GlassCard>
            ))}
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
    </GlobalLayout>
  );
};
export default StatisticsScreen;
