import React, { useRef, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, Animated, Text } from 'react-native';
import BackgroundLayout from './BackgroundLayout';
import GlowOrb from './GlowOrb';
import GlobalHeader from './GlobalHeader';
import GlobalBottomNavbar from './GlobalBottomNavbar';
import { useMockStore } from '../store/mockStore';
import MaterialIcon from './MaterialIcon';

interface GlobalLayoutProps {
  children: React.ReactNode;
  navigation: any;
  activeTab: 'dashboard' | 'statistics' | 'assistant' | 'settings' | 'none';
  title?: string;
  showBack?: boolean;
}

export const GlobalLayout: React.FC<GlobalLayoutProps> = ({
  children,
  navigation,
  activeTab,
  title,
  showBack = false,
}) => {
  const { toastMessage } = useMockStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    if (toastMessage) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 250,
          useNativeDriver: true,
          }),
      ]).start();
    }
  }, [toastMessage, fadeAnim, slideAnim]);

  return (
    <BackgroundLayout>
      {/* Ambient background glows */}
      <GlowOrb size={300} color="#3B82F6" opacity={0.15} style={{ top: '15%', left: '-10%' }} gradientId="layout-glow-top" />
      <GlowOrb size={280} color={activeTab === 'settings' ? '#df7412' : '#3B82F6'} opacity={0.08} style={{ bottom: '20%', right: '-10%' }} gradientId="layout-glow-bottom" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 z-10 w-full">
          {/* Global Header */}
          <GlobalHeader
            title={title}
            showBack={showBack}
            navigation={navigation}
            activeTab={activeTab}
          />

          {/* Toast Notification */}
          {toastMessage && (
            <Animated.View
              style={{
                position: 'absolute',
                top: 90,
                left: 24,
                right: 24,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                zIndex: 9999,
              }}
            >
              <View className="flex-row items-center gap-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl px-4 py-3.5 shadow-lg backdrop-blur-md">
                <MaterialIcon name="check_circle" size={20} color="#34d399" />
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-sm font-bold flex-1">
                  {toastMessage}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Screen Content */}
          <View className="flex-1 w-full">
            {children}
          </View>
          {activeTab !== 'none' && (
          <GlobalBottomNavbar navigation={navigation} activeTab={activeTab} />
        )}
        </View>
      </KeyboardAvoidingView>
    </BackgroundLayout>
  );
};

export default GlobalLayout;
