import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Rect, Path, Defs, LinearGradient, Stop, Filter, FeGaussianBlur, FeMerge, FeMergeNode, G } from 'react-native-svg';
import { useMockStore } from '../store/mockStore';
import BackgroundLayout from '../components/BackgroundLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isLoggedIn } = useMockStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Parallel entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in text 400ms later
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 800,
      delay: 400,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        navigation.replace('Login');
      } else {
        navigation.replace('BiometricGate');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoggedIn, navigation, fadeAnim, scaleAnim, rotateAnim, textOpacity]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-30deg', '0deg'],
  });

  return (
    <BackgroundLayout>
      {/* Ambient background light */}
      <GlowOrb size={350} color="#3B82F6" opacity={0.15} style={{ top: '25%', alignSelf: 'center' }} gradientId="splash-glow" />

      <View className="flex-1 justify-between items-center py-12 px-6 z-10 w-full">
        {/* Center Logo Area */}
        <View className="items-center justify-center flex-1">
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: spin }
              ]
            }}
          >
            <View className="w-36 h-36 bg-white/[0.03] border border-white/10 rounded-[2rem] items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.25)]">
              <Svg width="120" height="120" viewBox="0 0 120 120">
                <Defs>
                  <Filter id="svg-glow" x="-50%" y="-50%" width="200%" height="200%">
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
                  <LinearGradient id="orangeCard" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#df7412" stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#df7412" stopOpacity="0.05" />
                  </LinearGradient>
                </Defs>
                
                {/* Left Card (Blue/UPI) */}
                <Rect 
                  x="20" 
                  y="30" 
                  width="65" 
                  height="42" 
                  rx="8" 
                  transform="rotate(-12 52.5 51)" 
                  fill="url(#blueCard)" 
                  stroke="rgba(59, 130, 246, 0.4)" 
                  strokeWidth="1.5" 
                  filter="url(#svg-glow)" 
                />
                
                {/* Right Card (Orange/Cash) */}
                <Rect 
                  x="40" 
                  y="52" 
                  width="65" 
                  height="42" 
                  rx="8" 
                  transform="rotate(10 72.5 73)" 
                  fill="url(#orangeCard)" 
                  stroke="rgba(223, 116, 18, 0.4)" 
                  strokeWidth="1.5" 
                  filter="url(#svg-glow)" 
                />

                {/* Overlapping Rupee Symbol (₹) in the center */}
                <G filter="url(#svg-glow)">
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
            </View>
          </Animated.View>
          
          <Animated.View style={{ opacity: textOpacity }}>
            <Text 
              style={{ fontFamily: 'Montserrat-Bold' }} 
              className="mt-8 font-display-lg text-display-lg text-primary tracking-tight text-center"
            >
              STUDENTSPEND
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
