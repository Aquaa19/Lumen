import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import Svg, { Defs, Filter, FeGaussianBlur, FeMerge, FeMergeNode, Rect, G, Path, Circle } from 'react-native-svg';
import BackgroundLayout from '../components/BackgroundLayout';
import GlowOrb from '../components/GlowOrb';
import BiometricService from '../services/BiometricService';
import MaterialIcon from '../components/MaterialIcon';
import { useMockStore } from '../store/mockStore';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const BiometricGateScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { pinCode, userProfile } = useMockStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const drawAnim = useRef(new Animated.Value(200)).current;

  // Trigger real fingerprint scan
  const triggerBiometricScan = async () => {
    try {
      const isAvailable = await BiometricService.isAvailable();
      if (isAvailable) {
        const success = await BiometricService.authenticate('Scan fingerprint to access Lumen');
        if (success) {
          navigation.replace('MainApp');
        } else {
          // If user cancels or fails, go to PIN fallback
          navigation.navigate('PinFallback');
        }
      } else {
        // If biometrics not available on device, go to PIN fallback directly
        navigation.replace('PinFallback');
      }
    } catch {
      navigation.navigate('PinFallback');
    }
  };

  useEffect(() => {
    // Pulse animation (1 to 1.05 and back, looping)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Draw outline fingerprint path animation
    Animated.timing(drawAnim, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Automatically trigger biometrics prompt on mount
    const timer = setTimeout(() => {
      if (!pinCode) {
        navigation.replace('MainApp');
      } else if (!userProfile.biometricLock) {
        navigation.replace('PinFallback');
      } else {
        triggerBiometricScan();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pinCode, userProfile]);

  return (
    <BackgroundLayout>
      {/* Ambient backgrounds */}
      <GlowOrb size={300} color="#3B82F6" opacity={0.15} style={{ top: '10%', left: '-10%' }} gradientId="gate-glow-top" />
      <GlowOrb size={350} color="#3B82F6" opacity={0.1} style={{ bottom: '-10%', right: '-15%' }} gradientId="gate-glow-bottom" />

      <View className="flex-1 justify-between items-center py-12 px-6 z-10 w-full">
        {/* Sensor Area */}
        <View className="items-center justify-center flex-1 w-full gap-8">
          <Text 
            allowFontScaling={false}
            style={{ fontSize: 32, fontFamily: 'Montserrat-Bold', color: '#FFFFFF', letterSpacing: 2 }}
            className="mb-2"
          >
            LUMEN
          </Text>
          <TouchableOpacity
            onPress={triggerBiometricScan}
            activeOpacity={0.8}
            className="w-44 h-44 items-center justify-center rounded-[2.5rem] bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.2)]"
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Svg height="120" width="120" viewBox="0 0 120 120">
                <Defs>
                  <Filter id="glass-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <FeGaussianBlur stdDeviation="3" result="blur" />
                    <FeMerge>
                      <FeMergeNode in="blur" />
                      <FeMergeNode in="SourceGraphic" />
                    </FeMerge>
                  </Filter>
                </Defs>
                <Rect 
                  fill="rgba(255, 255, 255, 0.05)" 
                  height="100" 
                  rx="24" 
                  stroke="rgba(255, 255, 255, 0.15)" 
                  strokeWidth="1.5" 
                  width="100" 
                  x="10" 
                  y="10" 
                />
                <G>
                  <AnimatedPath 
                    d="M45 40 C45 35 55 30 60 30 C65 30 75 35 75 40 M35 50 C35 40 50 35 60 35 C70 35 85 40 85 50 M30 65 C30 50 50 45 60 45 C70 45 90 50 90 65 M35 80 C35 70 50 65 60 65 C70 65 85 70 85 80 M45 90 C45 85 55 80 60 80 C65 80 75 85 75 90" 
                    fill="none" 
                    filter="url(#glass-glow)" 
                    stroke="#3B82F6" 
                    strokeLinecap="round" 
                    strokeWidth="3"
                    strokeDasharray="200"
                    strokeDashoffset={drawAnim}
                  />
                  <Circle 
                    cx="60" 
                    cy="60" 
                    fill="#3B82F6" 
                    filter="url(#glass-glow)" 
                    opacity="0.3" 
                    r="10" 
                  />
                </G>
              </Svg>
            </Animated.View>
          </TouchableOpacity>
          <View className="items-center">
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xl font-semibold mb-2">
              Biometric Gate
            </Text>
            <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-center px-8">
              Scan fingerprint to access your financial dashboard securely
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="w-full gap-4">
          <TouchableOpacity
            onPress={triggerBiometricScan}
            activeOpacity={0.85}
            className="w-full h-14 bg-primary rounded-xl items-center justify-center shadow-lg"
          >
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-on-primary text-title-md font-bold">Scan Fingerprint</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('PinFallback')}
            activeOpacity={0.85}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl items-center justify-center"
          >
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-title-md font-bold">Use PIN Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundLayout>
  );
};
export default BiometricGateScreen;
