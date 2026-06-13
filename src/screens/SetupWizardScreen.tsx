import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useMockStore } from '../store/mockStore';
import BackgroundLayout from '../components/BackgroundLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';

export const SetupWizardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { completeSetup } = useMockStore();
  const [amountStr, setAmountStr] = useState('');

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (!numeric) {
      setAmountStr('');
    } else {
      setAmountStr(`₹${parseInt(numeric, 10).toLocaleString('en-IN')}`);
    }
  };

  const handleFinish = () => {
    // Parse value, fallback to 0 if empty
    const numericValue = parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;
    completeSetup(numericValue);
    // Navigate to MainApp tab group
    navigation.replace('MainApp');
  };

  return (
    <BackgroundLayout>
      {/* Background lights */}
      <GlowOrb size={320} color="#3B82F6" opacity={0.15} style={{ top: '-10%', left: '-5%' }} />
      <GlowOrb size={320} color="#df7412" opacity={0.12} style={{ bottom: '-10%', right: '-5%' }} />

      <View className="flex-1 justify-between py-12 px-6 z-10 w-full">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/5"
          >
            <MaterialIcon name="arrow_back" color="#ffffff" size={20} />
          </TouchableOpacity>
          <Text className="text-on-background text-title-md font-bold flex-1 text-center pr-10">
            First Launch Setup
          </Text>
        </View>

        {/* Progress Dots */}
        <View className="flex-row justify-center gap-3 my-4">
          <View className="h-2 w-8 rounded-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
          <View className="h-2 w-2 rounded-full bg-surface-container-highest" />
          <View className="h-2 w-2 rounded-full bg-surface-container-highest" />
        </View>

        {/* Title */}
        <View className="items-center my-6">
          <Text className="text-on-background text-headline-lg-mobile md:text-headline-lg font-bold text-center">
            Input your current{'\n'}Cash on hand
          </Text>
        </View>

        {/* Form Input Container */}
        <View className="flex-1 justify-center my-6">
          <View className="relative w-full h-32 justify-center bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.05)]">
            <Text className="text-center text-label-caps text-on-surface-variant mb-2 opacity-70">
              AVAILABLE CASH BALANCE
            </Text>
            <TextInput
              keyboardType="numeric"
              value={amountStr}
              onChangeText={handleAmountChange}
              placeholder="₹0"
              placeholderTextColor="rgba(225, 226, 236, 0.2)"
              className="w-full text-center text-5xl font-bold text-white"
            />
          </View>
          <Text className="text-center text-body-sm text-on-surface-variant mt-6 px-4">
            This helps establish your baseline for upcoming budget calculations.
          </Text>
        </View>

        {/* Action Button */}
        <View className="w-full">
          <TouchableOpacity
            onPress={handleFinish}
            activeOpacity={0.85}
            className="w-full h-14 bg-primary rounded-xl items-center justify-center flex-row gap-2 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          >
            <Text className="text-on-primary text-title-md font-bold">Finish Setup</Text>
            <MaterialIcon name="arrow_forward" color="#ffffff" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundLayout>
  );
};
export default SetupWizardScreen;
