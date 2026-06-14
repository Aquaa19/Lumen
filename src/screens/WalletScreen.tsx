import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';
import TotalBalanceIcon from '../public/assets/icons/TotalBalanceIcon';
import CashIcon from '../public/assets/icons/CashIcon';

export const WalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { cashBalance, upiBalance } = useMockStore();

  const safeCashBalance = typeof cashBalance === 'number' && !isNaN(cashBalance) ? cashBalance : 0;
  const safeUpiBalance = typeof upiBalance === 'number' && !isNaN(upiBalance) ? upiBalance : 0;
  const totalBalance = safeCashBalance + safeUpiBalance;

  return (
    <GlobalLayout
      activeTab="wallet"
      navigation={navigation}
      title="Wallet"
    >
      <View className="flex-1 relative">
        {/* Decorative Glow Orbs */}
        <GlowOrb 
          size={350} 
          color="#3B82F6" 
          opacity={0.15} 
          style={{ position: 'absolute', top: -100, left: -100 }} 
          gradientId="wallet-glow-top"
        />
        <GlowOrb 
          size={400} 
          color="#adc6ff" 
          opacity={0.12} 
          style={{ position: 'absolute', bottom: 100, right: -150 }} 
          gradientId="wallet-glow-bottom"
        />

        <ScrollView 
          className="flex-1 px-6 pt-6" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 }}
        >
          <Text 
            allowFontScaling={false}
            style={{ fontSize: 24, lineHeight: 32, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white', marginBottom: 24 }}
          >
            Accounts Overview
          </Text>

          <View className="gap-5">
            {/* Total Balance Card */}
            <GlassCard 
              active={true}
              className="w-full p-6 border border-white/10"
              contentClassName="items-start"
            >
              <View className="flex-row items-center gap-3 mb-2">
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center border border-primary/30">
                  <TotalBalanceIcon size={22} />
                </View>
                <Text 
                  allowFontScaling={false}
                  style={{ fontSize: 14, fontFamily: 'Montserrat-Bold', color: '#adc6ff', fontWeight: 'bold' }}
                  className="uppercase tracking-wider"
                >
                  Total Combined Balance
                </Text>
              </View>
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 42, lineHeight: 50, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white', letterSpacing: -1 }}
              >
                ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </GlassCard>

            {/* Cash Wallet Card */}
            <GlassCard 
              className="w-full p-6 border border-white/5"
              contentClassName="items-start"
            >
              <View className="flex-row items-center gap-3 mb-2">
                <View className="w-10 h-10 rounded-full bg-emerald-500/10 items-center justify-center border border-emerald-500/20">
                  <CashIcon size={20} color="#34d399" />
                </View>
                <Text 
                  allowFontScaling={false}
                  style={{ fontSize: 14, fontFamily: 'Montserrat-Bold', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}
                  className="uppercase tracking-wider"
                >
                  Cash Wallet
                </Text>
              </View>
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 36, lineHeight: 44, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: '#34d399', letterSpacing: -1 }}
              >
                ₹{safeCashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </GlassCard>

            {/* UPI Wallet Card */}
            <GlassCard 
              className="w-full p-6 border border-white/5"
              contentClassName="items-start"
            >
              <View className="flex-row items-center gap-3 mb-2">
                <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center border border-blue-500/20">
                  <MaterialIcon name="credit_card" color="#60a5fa" size={20} />
                </View>
                <Text 
                  allowFontScaling={false}
                  style={{ fontSize: 14, fontFamily: 'Montserrat-Bold', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}
                  className="uppercase tracking-wider"
                >
                  UPI Account
                </Text>
              </View>
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 36, lineHeight: 44, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: '#60a5fa', letterSpacing: -1 }}
              >
                ₹{safeUpiBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </GlassCard>
          </View>
        </ScrollView>
      </View>
    </GlobalLayout>
  );
};

export default WalletScreen;
