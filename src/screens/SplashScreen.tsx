import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import Svg, { Rect, Path, Defs, LinearGradient, Stop, Filter, FeGaussianBlur, FeMerge, FeMergeNode, G } from 'react-native-svg';
import { useMockStore } from '../store/mockStore';
import BackgroundLayout from '../components/BackgroundLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isLoggedIn, hasCompletedSetup } = useMockStore();

  const leftCardOpacity = useRef(new Animated.Value(0)).current;
  const leftCardTranslateY = useRef(new Animated.Value(50)).current;
  const leftCardRotate = useRef(new Animated.Value(0)).current;

  const rightCardOpacity = useRef(new Animated.Value(0)).current;
  const rightCardTranslateY = useRef(new Animated.Value(50)).current;
  const rightCardRotate = useRef(new Animated.Value(0)).current;

  const rupeeOpacity = useRef(new Animated.Value(0)).current;
  const rupeeBounce = useRef(new Animated.Value(30)).current;

  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered premium entrance animations
    Animated.stagger(150, [
      // 1. Left Card (Blue/UPI) spins upwards in an anticlockwise direction
      Animated.parallel([
        Animated.timing(leftCardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(leftCardTranslateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(leftCardRotate, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
      // 2. Right Card (Orange/Cash) spins upwards in a clockwise direction
      Animated.parallel([
        Animated.timing(rightCardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(rightCardTranslateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(rightCardRotate, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
      // 3. Rupee symbol bounces into position with spring physics
      Animated.parallel([
        Animated.timing(rupeeOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(rupeeBounce, {
          toValue: 0,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Fade in text and secure lock sub-caption
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 700,
      delay: 900,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      const storage = createMMKV();
      const hasLaunched = storage.getBoolean('hasLaunchedBefore') || false;
      if (!hasLaunched) {
        storage.set('hasLaunchedBefore', true);
        navigation.replace('Onboarding');
      } else if (!isLoggedIn) {
        navigation.replace('Login');
      } else if (!hasCompletedSetup) {
        navigation.replace('SetupWizard');
      } else {
        navigation.replace('BiometricGate');
      }
    }, 2800); // Slightly adjusted for animation completion buffer

    return () => clearTimeout(timer);
  }, [isLoggedIn, hasCompletedSetup, navigation]);

  const leftSpin = leftCardRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-75deg', '-12deg'], // Anticlockwise spin into position
  });

  const rightSpin = rightCardRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['75deg', '10deg'], // Clockwise spin into position
  });

  return (
    <BackgroundLayout>
      {/* Ambient background light */}
      <GlowOrb size={350} color="#3B82F6" opacity={0.15} style={{ top: '25%', alignSelf: 'center' }} gradientId="splash-glow" />

      <View className="flex-1 justify-between items-center py-12 px-6 z-10 w-full">
        {/* Center Logo Area */}
        <View className="items-center justify-center flex-1">
          <View className="w-36 h-36 bg-white/[0.03] border border-white/10 rounded-[2rem] items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.25)] relative overflow-visible">
            
            {/* Absolute Left Card (Blue/UPI) Layer */}
            <Animated.View 
              style={{
                ...StyleSheet.absoluteFill,
                opacity: leftCardOpacity,
                transform: [
                  { translateY: leftCardTranslateY },
                  { rotate: leftSpin }
                ]
              }}
            >
              <Svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', top: 12, left: 12 }}>
                <Defs>
                  <Filter id="blue-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <FeGaussianBlur stdDeviation="3" result="blur" />
                    <FeMerge>
                      <FeMergeNode in="blur" />
                      <FeMergeNode in="SourceGraphic" />
                    </FeMerge>
                  </Filter>
                  <LinearGradient id="blueCard" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                  </LinearGradient>
                </Defs>
                <Rect 
                  x="20" 
                  y="30" 
                  width="65" 
                  height="42" 
                  rx="8" 
                  fill="url(#blueCard)" 
                  stroke="rgba(59, 130, 246, 0.4)" 
                  strokeWidth="1.5" 
                  filter="url(#blue-glow)" 
                />
              </Svg>
            </Animated.View>

            {/* Absolute Right Card (Orange/Cash) Layer */}
            <Animated.View 
              style={{
                ...StyleSheet.absoluteFill,
                opacity: rightCardOpacity,
                transform: [
                  { translateY: rightCardTranslateY },
                  { rotate: rightSpin }
                ]
              }}
            >
              <Svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', top: 12, left: 12 }}>
                <Defs>
                  <Filter id="orange-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <FeGaussianBlur stdDeviation="3" result="blur" />
                    <FeMerge>
                      <FeMergeNode in="blur" />
                      <FeMergeNode in="SourceGraphic" />
                    </FeMerge>
                  </Filter>
                  <LinearGradient id="orangeCard" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#df7412" stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#df7412" stopOpacity="0.05" />
                  </LinearGradient>
                </Defs>
                <Rect 
                  x="40" 
                  y="52" 
                  width="65" 
                  height="42" 
                  rx="8" 
                  fill="url(#orangeCard)" 
                  stroke="rgba(223, 116, 18, 0.4)" 
                  strokeWidth="1.5" 
                  filter="url(#orange-glow)" 
                />
              </Svg>
            </Animated.View>

            {/* Absolute Rupee Symbol Layer */}
            <Animated.View 
              style={{
                ...StyleSheet.absoluteFill,
                opacity: rupeeOpacity,
                transform: [
                  { translateY: rupeeBounce }
                ]
              }}
            >
              <Svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', top: 12, left: 12 }}>
                <Defs>
                  <Filter id="rupee-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <FeGaussianBlur stdDeviation="3" result="blur" />
                    <FeMerge>
                      <FeMergeNode in="blur" />
                      <FeMergeNode in="SourceGraphic" />
                    </FeMerge>
                  </Filter>
                </Defs>
                <G filter="url(#rupee-glow)">
                  <Path 
                    d="M50 48 H70 M50 56 H70 M50 48 C62 48 68 52 68 60 C68 68 60 72 50 72 L66 90" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </G>
              </Svg>
            </Animated.View>

          </View>
          
          <Animated.View style={{ opacity: textOpacity }}>
            <Text 
              style={{ fontFamily: 'Montserrat-Bold' , fontSize: 28, fontWeight: 'bold', letterSpacing: 1 }} 
              className="mt-8 text-primary text-center"
            >
              Lumen
            </Text>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View style={{ opacity: textOpacity }} className="items-center flex-row gap-2 opacity-60">
          <MaterialIcon name="lock" color="#3B82F6" size={14} />
          <Text 
            style={{ fontFamily: 'Montserrat-Regular' }} 
            className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase"
          >
            securely encrypted
          </Text>
        </Animated.View>
      </View>
    </BackgroundLayout>
  );
};

export default SplashScreen;
