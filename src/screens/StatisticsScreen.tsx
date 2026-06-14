import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Filter, FeGaussianBlur } from 'react-native-svg';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import GlobalLayout from '../components/GlobalLayout';
import MaterialIcon from '../components/MaterialIcon';
import GlowOrb from '../components/GlowOrb';
import LinearGradient from 'react-native-linear-gradient';

export const StatisticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { transactions, monthlyBudget } = useMockStore();
  const insets = useSafeAreaInsets();
  // Matches the exact bottom placement of your GlobalBottomNavbar
  const navbarBottomMargin = Math.max(insets.bottom, 12); 
  // 70 (Navbar Height) + exact bottom margin + 4px (to protect the drop shadow)
  const bottomPadding = 70 + navbarBottomMargin + 4;
  
  // Compute total spent dynamically (only expenses)
  const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Dynamic path builder
  const getDynamicPath = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) {
      // Flat line at the bottom (90 spent)
      return {
        fill: "M0,90 L100,90 L100,100 L0,100 Z",
        line: "M0,90 L100,90"
      };
    }

    const weeklyTotals = [0, 0, 0, 0];
    expenses.forEach(t => {
      try {
        const parts = t.date.split(' ');
        const day = parseInt(parts[0], 10);
        if (day <= 7) weeklyTotals[0] += t.amount;
        else if (day <= 14) weeklyTotals[1] += t.amount;
        else if (day <= 21) weeklyTotals[2] += t.amount;
        else weeklyTotals[3] += t.amount;
      } catch {
        weeklyTotals[0] += t.amount;
      }
    });

    const cumulative = [0, 0, 0, 0];
    cumulative[0] = weeklyTotals[0];
    cumulative[1] = cumulative[0] + weeklyTotals[1];
    cumulative[2] = cumulative[1] + weeklyTotals[2];
    cumulative[3] = cumulative[2] + weeklyTotals[3];

    const maxSpent = cumulative[3];
    if (maxSpent === 0) {
      return {
        fill: "M0,90 L100,90 L100,100 L0,100 Z",
        line: "M0,90 L100,90"
      };
    }

    const getY = (val: number) => {
      const scale = (val / maxSpent);
      return 90 - scale * 70; // 90 is bottom, 20 is top
    };

    const y0 = 90;
    const y1 = getY(cumulative[0]);
    const y2 = getY(cumulative[1]);
    const y3 = getY(cumulative[2]);
    const y4 = getY(cumulative[3]);

    const linePath = `M0,${y0} Q25,${y1} 50,${y2} T75,${y3} T100,${y4}`;
    const fillPath = `${linePath} L100,100 L0,100 Z`;

    return {
      fill: fillPath,
      line: linePath
    };
  };

  const path = getDynamicPath();

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
  });

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
        fontWeight: '900', // Forces maximum thickness
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

          {/* Spent Chart Card */}
          <GlassCard className="p-4 mb-6">
            <View className="mb-6">
              {/* Top Row: Label & Trend Metric */}
              <View className="flex-row justify-between items-center mb-1">
                <Text 
                  allowFontScaling={false}
                  style={{ fontSize: 12, lineHeight: 16, fontFamily: 'Montserrat-Bold', fontWeight: 'bold', color: '#c2c6d6' }}
                  className="uppercase tracking-wider"
                >
                  Total Spent
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
              {/* Bottom Row: Amount */}
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 48, lineHeight: 56, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: '#adc6ff', letterSpacing: -1 }}
              >
                ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {/* SVG Spending Curve */}
            <View className="h-44 w-full relative justify-end">
              <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
  <Defs>
    <SvgLinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0%" stopColor="#adc6ff" stopOpacity="0.25" />
      <Stop offset="100%" stopColor="#adc6ff" stopOpacity="0" />
    </SvgLinearGradient>
    
    {/* --- The True Blur Filter --- */}
    {/* The x/y/width/height expansion prevents the blur from getting clipped at the edges */}
    <Filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <FeGaussianBlur stdDeviation="3" result="blur" />
    </Filter>
  </Defs>

  {/* Background Grid Lines */}
  <Path d="M0,25 L100,25" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
  <Path d="M0,50 L100,50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
  <Path d="M0,75 L100,75" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

  {/* Fill Path (Underneath everything) */}
  <Path
    d={path.fill}
    fill="url(#chartFill)"
  />

  {/* --- The Blurred Glow Layer --- */}
  {/* Replaces the multi-layer stack with one perfectly smooth neon glow */}
  <Path
    d={path.line}
    fill="none"
    stroke="#adc6ff"
    strokeWidth="5"
    strokeOpacity="0.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    filter="url(#glow)"
  />
  
  {/* Main Solid Line Path (On top) */}
  <Path
    d={path.line}
    fill="none"
    stroke="#adc6ff"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</Svg>
              {/* Axis labels */}
              <View className="flex-row justify-between mt-2">
                <Text style={{ fontFamily: 'Montserrat-Bold', fontWeight: '700', color: 'rgba(255, 255, 255, 0.92)', fontSize: 15 }} className="font-label-caps">1st</Text>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontWeight: '700', color: 'rgba(255, 255, 255, 0.92)', fontSize: 15 }} className="font-label-caps">15th</Text>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontWeight: '700', color: 'rgba(255, 255, 255, 0.92)', fontSize: 15 }} className="font-label-caps">30th</Text>
              </View>
            </View>
          </GlassCard>

          <Text 
            allowFontScaling={false}
            style={{ fontSize: 20, lineHeight: 28, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white' }}
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
                    <MaterialIcon name={getCategoryIcon(stat.name)} size={22} color={stat.color || '#adc6ff'} />
                  </View>
                  
                  {/* Text Block */}
                  <View className="flex-col items-start">
                    <Text 
                      style={{ fontFamily: 'Montserrat-Bold', fontSize: 22 }} 
                      className="text-white font-bold"
                    >
                      {stat.name}
                    </Text>
                    {/* Transaction Count */}
                    <Text 
                      style={{ fontSize: 16, fontFamily: 'Montserrat-Bold', color: 'rgba(255, 255, 255, 0.63)' }} // Changed to Bold, added exact size
                      className="text-xl mt-0.5" // Removed text-sm, added font-bold
                    >
                      {stat.count} Transactions
                    </Text>
                  </View>
                </View>

                {/* Right Group (Metrics) */}
                <View className="flex-col items-end">
                  <Text 
                    style={{ fontFamily: 'Montserrat-Bold', fontSize: 22 }} 
                    className="text-white font-bold"
                  >
                    ₹{stat.amount.toFixed(2)}
                  </Text>
                  <Text 
                    style={{ fontFamily: 'Montserrat-Bold' }} 
                    className="text-sm text-primary font-bold mt-1"
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
