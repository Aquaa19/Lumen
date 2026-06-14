import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Vibration, StyleSheet, Animated } from 'react-native';
import { useMockStore } from '../store/mockStore';
import BackgroundLayout from '../components/BackgroundLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';

export const PinFallbackScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { pinCode } = useMockStore();
  const pinLength = pinCode ? pinCode.length : 4; // Auto-detect chosen length
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    try {
      Vibration.vibrate(100);
    } catch (e) {}
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = (num: string) => {
    try {
      Vibration.vibrate(15);
    } catch (e) {}
    setErrorMsg(null);
    if (enteredPin.length < pinLength) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
    }
  };

  const handleBackspace = () => {
    try {
      Vibration.vibrate(15);
    } catch (e) {}
    setEnteredPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (enteredPin.length === pinLength) {
      if (enteredPin === pinCode) {
        navigation.replace('MainApp');
      } else {
        triggerShake();
        setErrorMsg('INCORRECT PIN');
        setEnteredPin('');
      }
    }
  }, [enteredPin, pinCode, pinLength]);

  const renderDot = (index: number) => {
    const isActive = enteredPin.length > index;
    return (
      <View
        key={index}
        className={`w-4 h-4 rounded-full mx-3 border ${
          isActive 
            ? 'bg-primary border-primary shadow-[0_0_12px_rgba(59,130,246,0.8)]' 
            : 'bg-white/5 border-white/20'
        }`}
      />
    );
  };

  const numpadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <BackgroundLayout>
      <GlowOrb size={300} color="#3B82F6" opacity={0.15} style={{ top: '15%', left: '-10%' }} gradientId="pin-glow-top" />
      <GlowOrb size={300} color="#df7412" opacity={0.08} style={{ bottom: '15%', right: '-10%' }} gradientId="pin-glow-bottom" />

      <View className="flex-1 justify-between py-12 px-6 z-10 w-full">
        {/* Header */}
        <View className="items-center mt-6">
          <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-on-surface-variant text-[11px] font-label-caps uppercase tracking-widest opacity-80">
            SECURITY GATE
          </Text>
          <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-[24px] font-bold text-center mt-2">
            Enter PIN to Unlock
          </Text>
        </View>

        {/* PIN dots area */}
        <Animated.View 
          style={{ transform: [{ translateX: shakeAnim }] }}
          className="items-center justify-center my-6"
        >
          <View className="flex-row justify-center mb-4">
            {Array.from({ length: pinLength }).map((_, i) => renderDot(i))}
          </View>
          {errorMsg && (
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-red-400 text-sm font-bold mt-2">
              {errorMsg}
            </Text>
          )}
        </Animated.View>

        {/* Numpad */}
        <View className="items-center mb-6">
          <View className="w-full max-w-[280px] gap-4">
            {numpadRows.map((row, rIdx) => (
              <View key={rIdx} className="flex-row justify-between">
                {row.map(num => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => handleKeyPress(num)}
                    activeOpacity={0.8}
                    className="w-[72px] h-[72px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
                  >
                    <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-2xl font-bold">
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            {/* Last Row */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => navigation.replace('BiometricGate')}
                activeOpacity={0.8}
                className="w-[72px] h-[72px] rounded-full items-center justify-center"
              >
                <MaterialIcon name="fingerprint" color="#3B82F6" size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleKeyPress('0')}
                activeOpacity={0.8}
                className="w-[72px] h-[72px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-2xl font-bold">
                  0
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBackspace}
                activeOpacity={0.8}
                className="w-[72px] h-[72px] rounded-full items-center justify-center"
              >
                <MaterialIcon name="backspace" color="#ffffff" size={22} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </BackgroundLayout>
  );
};

export default PinFallbackScreen;
