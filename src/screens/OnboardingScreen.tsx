import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import BackgroundLayout from '../components/BackgroundLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';
import { GlassCard } from '../components/GlassCard';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'wallet',
    iconColor: '#3B82F6',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconBorder: 'rgba(59, 130, 246, 0.3)',
    title: 'Track Balances Natively',
    description: 'Keep your Cash and UPI wallets synchronized in real time with an ultra-fast logging flow.'
  },
  {
    icon: 'smart_toy',
    iconColor: '#a855f7',
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconBorder: 'rgba(168, 85, 247, 0.3)',
    title: 'AI Finance Intelligence',
    description: 'Get automated under-budget insights and query your ledger instantly using the built-in assistant.'
  },
  {
    icon: 'fingerprint',
    iconColor: '#34d399',
    iconBg: 'rgba(52, 211, 153, 0.15)',
    iconBorder: 'rgba(52, 211, 153, 0.3)',
    title: 'Secure Access Control',
    description: 'Secure your ledger with hardware biometrics or a custom PIN code fallback.'
  }
];

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(slideIndex);
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <BackgroundLayout>
      <GlowOrb size={300} color="#3B82F6" opacity={0.15} style={{ top: '10%', left: '-5%' }} gradientId="onboard-glow-top" />
      <GlowOrb size={300} color="#df7412" opacity={0.1} style={{ bottom: '-10%', right: '-5%' }} gradientId="onboard-glow-bottom" />

      <View className="flex-1 justify-between py-12 z-10 w-full">
        {/* Skip button */}
        <View className="flex-row justify-end px-6">
          <TouchableOpacity 
            onPress={() => navigation.replace('Login')}
            activeOpacity={0.7}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/5"
          >
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xs font-bold uppercase tracking-wider">
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Scroll Slides */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-1 my-6"
        >
          {SLIDES.map((slide, idx) => (
            <View key={idx} style={{ width }} className="px-6 justify-center items-center">
              <GlassCard 
                className="w-full max-w-sm border border-white/10"
                contentClassName="items-center p-8 gap-6"
              >
                <View 
                  style={{ backgroundColor: slide.iconBg, borderColor: slide.iconBorder }}
                  className="w-20 h-20 rounded-3xl border items-center justify-center shadow-lg"
                >
                  <MaterialIcon name={slide.icon} color={slide.iconColor} size={36} />
                </View>
                <View className="gap-2.5">
                  <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-[24px] font-bold text-center">
                    {slide.title}
                  </Text>
                  <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-center leading-5 text-sm">
                    {slide.description}
                  </Text>
                </View>
              </GlassCard>
            </View>
          ))}
        </ScrollView>

        {/* Footer controls */}
        <View className="px-6 gap-6">
          {/* Dot Indicators */}
          <View className="flex-row justify-center gap-2">
            {SLIDES.map((_, idx) => (
              <View
                key={idx}
                className={`h-2 rounded-full ${
                  idx === activeIndex 
                    ? 'w-6 bg-primary shadow-[0_0_12px_rgba(59,130,246,0.6)]' 
                    : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </View>

          {/* Action button */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            className="w-full h-14 bg-primary rounded-xl items-center justify-center flex-row gap-2 shadow-lg"
          >
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-on-primary text-title-md font-bold">
              {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <MaterialIcon name="arrow_forward" color="#ffffff" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundLayout>
  );
};

export default OnboardingScreen;
