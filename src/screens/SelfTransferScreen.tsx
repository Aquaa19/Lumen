import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import MaterialIcon from '../components/MaterialIcon';

export const SelfTransferScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { cashBalance, upiBalance, selfTransfer } = useMockStore();
  const [amount, setAmount] = useState('');
  const [fromSource, setFromSource] = useState<'cash' | 'upi'>('cash');

  const toSource = fromSource === 'cash' ? 'upi' : 'cash';
  const fromBalance = fromSource === 'cash' ? cashBalance : upiBalance;
  const toBalance = fromSource === 'cash' ? upiBalance : cashBalance;

  const handleTransfer = () => {
    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    if (numericAmount > fromBalance) {
      Alert.alert('Insufficient Funds', `You only have ₹${fromBalance.toFixed(2)} in your ${fromSource.toUpperCase()} wallet.`);
      return;
    }

    selfTransfer(numericAmount, fromSource, toSource);
    Alert.alert('Transfer Complete', `Successfully transferred ₹${numericAmount.toFixed(2)} from ${fromSource.toUpperCase()} to ${toSource.toUpperCase()}.`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleAmountChange = (text: string) => {
    // Keep only numbers and decimal
    const filtered = text.replace(/[^0-9.]/g, '');
    setAmount(filtered);
  };

  return (
    <GlobalLayout
      activeTab="none"
      navigation={navigation}
      title="Self Transfer"
      showBack={true}
    >

      <View className="flex-1 w-full px-6 pt-6 justify-between pb-12 max-w-md mx-auto self-center">
        <View className="gap-6">
          {/* Toggle From/To Source */}
          <GlassCard className="p-4 gap-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text 
                  allowFontScaling={false}
                  style={{ fontSize: 12, lineHeight: 16, fontFamily: 'Montserrat-Regular', color: '#c2c6d6' }}
                  className="uppercase tracking-wider mb-1"
                >
                  FROM
                </Text>
                <Text 
                  allowFontScaling={false}
                  style={{ fontSize: 20, lineHeight: 28, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white' }}
                >
                  {fromSource === 'cash' ? 'Cash Wallet' : 'UPI Account'}
                </Text>
                <Text className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                  Balance: ₹{fromBalance.toFixed(2)}
                </Text>
              </View>
              
              <TouchableOpacity 
                onPress={() => setFromSource(prev => prev === 'cash' ? 'upi' : 'cash')}
                className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center border border-primary/30"
              >
                <MaterialIcon name="swap_horiz" color="#3B82F6" size={22} />
              </TouchableOpacity>

              <View className="items-end">
                <Text 
                  allowFontScaling={false}
                  style={{ fontSize: 12, lineHeight: 16, fontFamily: 'Montserrat-Regular', color: '#c2c6d6' }}
                  className="uppercase tracking-wider mb-1"
                >
                  TO
                </Text>
                <Text 
                  allowFontScaling={false}
                  style={{ fontSize: 20, lineHeight: 28, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white' }}
                >
                  {toSource === 'cash' ? 'Cash Wallet' : 'UPI Account'}
                </Text>
                <Text className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                  Balance: ₹{toBalance.toFixed(2)}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Amount input */}
          <GlassCard className="p-6">
            <Text 
              allowFontScaling={false}
              style={{ fontSize: 12, lineHeight: 16, fontFamily: 'Montserrat-Regular', color: '#c2c6d6' }}
              className="text-center uppercase tracking-wider mb-3"
            >
              TRANSFER AMOUNT
            </Text>
            <View className="flex-row justify-center items-center h-20 border border-white/10 rounded-2xl bg-white/[0.03] px-4">
              <Text 
                allowFontScaling={false}
                style={{ fontSize: 48, lineHeight: 56, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white' }}
                className="mr-1"
              >
                ₹
              </Text>
              <TextInput
                allowFontScaling={false}
                keyboardType="numeric"
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor="rgba(225, 226, 236, 0.2)"
                style={{ fontSize: 48, lineHeight: 56, fontWeight: 'bold', fontFamily: 'Montserrat-Bold', color: 'white', padding: 0 }}
                className="flex-1 h-full"
              />
            </View>
          </GlassCard>
        </View>

        {/* Transfer Action Button */}
        <TouchableOpacity
          onPress={handleTransfer}
          activeOpacity={0.85}
          style={{ height: 56 }}
          className="w-full self-stretch rounded-2xl bg-primary-container items-center justify-center shadow-[0_0_25px_rgba(77,142,255,0.4)]"
        >
          <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#00285d', fontWeight: 'bold' }}>
            Confirm Transfer
          </Text>
        </TouchableOpacity>
      </View>
    </GlobalLayout>
  );
};
export default SelfTransferScreen;
