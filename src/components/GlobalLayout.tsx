import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import BackgroundLayout from './BackgroundLayout';
import GlowOrb from './GlowOrb';
import GlobalHeader from './GlobalHeader';
import GlobalBottomNavbar from './GlobalBottomNavbar';

interface GlobalLayoutProps {
  children: React.ReactNode;
  navigation: any;
  activeTab: 'dashboard' | 'statistics' | 'assistant' | 'settings' | 'none';
  title?: string;
  showBack?: boolean;
  rightAction?: 'biometric' | 'logout' | 'profile' | 'none';
}

export const GlobalLayout: React.FC<GlobalLayoutProps> = ({
  children,
  navigation,
  activeTab,
  title,
  showBack = false,
  rightAction = 'none',
}) => {
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
            rightAction={rightAction}
          />

          {/* Screen Content */}
          <View className="flex-1 w-full">
            {children}
          </View>

          {/* Global Bottom Navbar */}
          <GlobalBottomNavbar
            activeTab={activeTab}
            navigation={navigation}
          />
        </View>
      </KeyboardAvoidingView>
    </BackgroundLayout>
  );
};

export default GlobalLayout;
