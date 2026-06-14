import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Vibration } from 'react-native';
import { useMockStore } from '../store/mockStore';
import BackgroundLayout from '../components/BackgroundLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';
import BiometricService from '../services/BiometricService';
import { GlassCard } from '../components/GlassCard';

export const SetupWizardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { completeSetup } = useMockStore();
  const [step, setStep] = useState(1);

  // Step 1: Security States
  const [pinLength, setPinLength] = useState<4 | 6>(4);
  const [pinCode, setPinCode] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [biometricLock, setBiometricLock] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Step 2: Wallet States
  const [cashBalanceStr, setCashBalanceStr] = useState('');
  const [upiBalanceStr, setUpiBalanceStr] = useState('');

  // Step 3: Budget States
  const [budgetStr, setBudgetStr] = useState('15,000');

  // Numpad Row configuration for custom PIN setup
  const numpadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  const handlePinKeyPress = (num: string) => {
    Vibration.vibrate(15);
    setPinError(null);
    if (!isConfirming) {
      if (pinCode.length < pinLength) {
        setPinCode(prev => prev + num);
      }
    } else {
      if (confirmPin.length < pinLength) {
        setConfirmPin(prev => prev + num);
      }
    }
  };

  const handlePinBackspace = () => {
    Vibration.vibrate(15);
    if (!isConfirming) {
      setPinCode(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const handlePinSubmit = () => {
    if (!isConfirming) {
      if (pinCode.length === pinLength) {
        setIsConfirming(true);
      } else {
        setPinError(`ENTER A ${pinLength}-DIGIT PIN`);
      }
    } else {
      if (confirmPin.length === pinLength) {
        if (pinCode === confirmPin) {
          // Trigger biometric sync setup
          handleRegisterBiometrics();
        } else {
          setPinError('PINS DO NOT MATCH');
          setConfirmPin('');
          Vibration.vibrate(100);
        }
      } else {
        setPinError(`CONFIRM YOUR ${pinLength}-DIGIT PIN`);
      }
    }
  };

  const handleRegisterBiometrics = async () => {
    const isAvail = await BiometricService.isAvailable();
    if (isAvail) {
      const success = await BiometricService.authenticate('Link biometric verification to Lumen');
      if (success) {
        setBiometricLock(true);
      }
    }
    // Proceed to balance setup step
    setStep(2);
  };

  const handleBack = () => {
    if (step > 1) {
      if (step === 2) {
        // Clear confirm PIN step
        setIsConfirming(false);
        setPinCode('');
        setConfirmPin('');
      }
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleNextStep2 = () => {
    setStep(3);
  };

  const handleFinish = () => {
    const cashValue = parseInt(cashBalanceStr.replace(/[^0-9]/g, ''), 10) || 0;
    const upiValue = parseInt(upiBalanceStr.replace(/[^0-9]/g, ''), 10) || 0;
    const budgetValue = parseInt(budgetStr.replace(/[^0-9]/g, ''), 10) || 15000;

    completeSetup(cashValue, upiValue, budgetValue, pinCode || null, biometricLock);
    navigation.replace('MainApp');
  };

  const formatCurrencyInput = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (!numeric) return '';
    return `₹${parseInt(numeric, 10).toLocaleString('en-IN')}`;
  };

  // Step 1: Security Setup Render
  const renderSecurityStep = () => {
    const currentEntered = isConfirming ? confirmPin : pinCode;
    return (
      <View className="flex-1 justify-between">
        <View className="items-center my-4">
          <Text style={{ fontFamily: 'Montserrat-Bold', color: '#FFFFFF' }} className="text-white text-2xl font-bold text-center">
            {isConfirming ? 'Confirm your Security PIN' : 'Create a Security PIN'}
          </Text>
          <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-center mt-2 px-6">
            Enter a secret passcode to secure your offline wallet Ledger.
          </Text>

          {/* Toggle PIN length */}
          {!isConfirming && (
            <View className="flex-row mt-4 bg-white/5 border border-white/10 rounded-full p-1 w-52 justify-between">
              <TouchableOpacity
                onPress={() => {
                  setPinLength(4);
                  setPinCode('');
                  setPinError(null);
                }}
                className={`flex-1 py-1.5 rounded-full items-center ${pinLength === 4 ? 'bg-primary' : ''}`}
              >
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xs font-bold">4 Digits</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setPinLength(6);
                  setPinCode('');
                  setPinError(null);
                }}
                className={`flex-1 py-1.5 rounded-full items-center ${pinLength === 6 ? 'bg-primary' : ''}`}
              >
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xs font-bold">6 Digits</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Dots display */}
        <View className="items-center justify-center my-4">
          <View className="flex-row justify-center mb-2">
            {Array.from({ length: pinLength }).map((_, i) => (
              <View
                key={i}
                className={`w-3.5 h-3.5 rounded-full mx-2 border ${
                  currentEntered.length > i 
                    ? 'bg-primary border-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                    : 'bg-white/5 border-white/20'
                }`}
              />
            ))}
          </View>
          {pinError && (
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-red-400 text-xs font-bold mt-1 uppercase">
              {pinError}
            </Text>
          )}
        </View>

        {/* PIN Numpad */}
        <View className="items-center mb-4">
          <View className="w-full max-w-[260px] gap-3">
            {numpadRows.map((row, rIdx) => (
              <View key={rIdx} className="flex-row justify-between">
                {row.map(num => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => handlePinKeyPress(num)}
                    activeOpacity={0.8}
                    className="w-[64px] h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
                  >
                    <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xl font-bold">
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            {/* Last Numpad Row */}
            <View className="flex-row justify-between">
              <View className="w-[64px] h-[64px]" />
              <TouchableOpacity
                onPress={() => handlePinKeyPress('0')}
                activeOpacity={0.8}
                className="w-[64px] h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xl font-bold">
                  0
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePinBackspace}
                activeOpacity={0.8}
                className="w-[64px] h-[64px] rounded-full items-center justify-center"
              >
                <MaterialIcon name="backspace" color="#ffffff" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PIN setup submit button */}
        <View className="w-full px-6">
          <TouchableOpacity
            onPress={handlePinSubmit}
            activeOpacity={0.85}
            className="w-full h-12 bg-primary rounded-xl items-center justify-center flex-row gap-2 shadow-lg"
          >
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-on-primary text-sm font-bold">
              {isConfirming ? 'Register PIN' : 'Confirm PIN'}
            </Text>
            <MaterialIcon name="arrow_forward" color="#ffffff" size={16} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Step 2: Wallet setup Render
  const renderWalletStep = () => {
    return (
      <View className="flex-1 justify-between">
        <View className="items-center my-6">
          <Text style={{ fontFamily: 'Montserrat-Bold', color: '#FFFFFF' }} className="text-white text-2xl font-bold text-center">
            Set Initial Balances
          </Text>
          <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-center mt-2 px-6">
            Enter your current cash on hand and available bank balances.
          </Text>
        </View>

        {/* Inputs */}
        <View className="flex-1 justify-start pt-8 gap-6 px-6">
          {/* Cash Input */}
          <GlassCard className="border border-white/5" contentClassName="p-5">
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">
              Available Cash Balance
            </Text>
            <TextInput
              keyboardType="numeric"
              value={cashBalanceStr}
              onChangeText={(t) => setCashBalanceStr(formatCurrencyInput(t))}
              placeholder="₹0"
              placeholderTextColor="rgba(225, 226, 236, 0.2)"
              className="text-white text-3xl font-bold p-0"
              style={{ fontFamily: 'Montserrat-Bold' }}
            />
          </GlassCard>

          {/* UPI/Bank Input */}
          <GlassCard className="border border-white/5" contentClassName="p-5">
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">
              Bank / UPI Balance
            </Text>
            <TextInput
              keyboardType="numeric"
              value={upiBalanceStr}
              onChangeText={(t) => setUpiBalanceStr(formatCurrencyInput(t))}
              placeholder="₹0"
              placeholderTextColor="rgba(225, 226, 236, 0.2)"
              className="text-white text-3xl font-bold p-0"
              style={{ fontFamily: 'Montserrat-Bold' }}
            />
          </GlassCard>
        </View>

        {/* Action Button */}
        <View className="w-full px-6">
          <TouchableOpacity
            onPress={handleNextStep2}
            activeOpacity={0.85}
            className="w-full h-14 bg-primary rounded-xl items-center justify-center flex-row gap-2 shadow-lg"
          >
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-on-primary text-title-md font-bold">Continue</Text>
            <MaterialIcon name="arrow_forward" color="#ffffff" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Step 3: Budget limit setup Render
  const renderBudgetStep = () => {
    return (
      <View className="flex-1 justify-between">
        <View className="items-center my-6">
          <Text style={{ fontFamily: 'Montserrat-Bold', color: '#FFFFFF' }} className="text-white text-2xl font-bold text-center">
            Set Monthly Budget
          </Text>
          <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-center mt-2 px-6">
            Establish your monthly spending threshold. We'll send insights relative to this threshold.
          </Text>
        </View>

        {/* Input */}
        <View className="flex-1 justify-center px-6">
          <GlassCard className="border border-white/5" contentClassName="p-5">
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">
              Monthly Limit Goal
            </Text>
            <TextInput
              keyboardType="numeric"
              value={budgetStr}
              onChangeText={(t) => setBudgetStr(formatCurrencyInput(t))}
              placeholder="₹15,000"
              placeholderTextColor="rgba(225, 226, 236, 0.2)"
              className="text-white text-4xl font-bold p-0"
              style={{ fontFamily: 'Montserrat-Bold' }}
            />
          </GlassCard>
        </View>

        {/* Action Button */}
        <View className="w-full px-6">
          <TouchableOpacity
            onPress={handleFinish}
            activeOpacity={0.85}
            className="w-full h-14 bg-primary rounded-xl items-center justify-center flex-row gap-2 shadow-lg"
          >
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-on-primary text-title-md font-bold">Finish Setup</Text>
            <MaterialIcon name="done" color="#ffffff" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <BackgroundLayout>
      <GlowOrb size={320} color="#3B82F6" opacity={0.15} style={{ top: '-10%', left: '-5%' }} gradientId="wizard-glow-top" />
      <GlowOrb size={320} color="#df7412" opacity={0.12} style={{ bottom: '-10%', right: '-5%' }} gradientId="wizard-glow-bottom" />

      <View className="flex-1 justify-between py-12 z-10 w-full">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6">
          <TouchableOpacity
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/5"
          >
            <MaterialIcon name="arrow_back" color="#ffffff" size={20} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat-Bold', color: '#FFFFFF' }} className="text-white text-title-md font-bold flex-1 text-center pr-10">
            Setup Wizard
          </Text>
        </View>

        {/* Progress Dots */}
        <View className="flex-row justify-center gap-3 my-4">
          <View className={`h-2 rounded-full ${step === 1 ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`} />
          <View className={`h-2 rounded-full ${step === 2 ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`} />
          <View className={`h-2 rounded-full ${step === 3 ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`} />
        </View>

        {/* Step Rendering */}
        <View className="flex-1 justify-between">
          {step === 1 && renderSecurityStep()}
          {step === 2 && renderWalletStep()}
          {step === 3 && renderBudgetStep()}
        </View>
      </View>
    </BackgroundLayout>
  );
};

export default SetupWizardScreen;
