import React, { useRef, useEffect, useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Animated, Text, Keyboard, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      () => setIsKeyboardVisible(true)
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

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
              <View 
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: '#1d2027', // solid surface-container
                  borderColor: '#059669', // solid emerald border
                  borderWidth: 1.5,
                  borderRadius: 12, // rounded rectangle
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 5,
                }}
              >
                <MaterialIcon name="check_circle" size={20} color="#34d399" />
                <Text style={{ fontFamily: 'Montserrat-Bold', color: '#FFFFFF', fontSize: 14, flex: 1 }}>
                  {toastMessage}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Screen Content */}
          <View className="flex-1 w-full">
            {children}
          </View>
          {activeTab !== 'none' && !isKeyboardVisible && (
          <GlobalBottomNavbar navigation={navigation} activeTab={activeTab} />
        )}
        </View>
      </KeyboardAvoidingView>
    </BackgroundLayout>
  );
};

export default GlobalLayout;
