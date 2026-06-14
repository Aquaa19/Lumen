import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMockStore } from '../store/mockStore';
import { BlurView } from '@react-native-community/blur';
import MaterialIcon from './MaterialIcon';
import AIIcon from '../public/assets/icons/AIIcon';

interface GlobalHeaderProps {
  title?: string;
  showBack?: boolean;
  navigation: any;
  activeTab?: 'dashboard' | 'statistics' | 'payments' | 'wallet' | 'settings' | 'none';
  hideAssistant?: boolean;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title,
  showBack = false,
  navigation,
  activeTab = 'none',
  hideAssistant = false,
}) => {
  const insets = useSafeAreaInsets();
  const { userProfile } = useMockStore();

  const headerTitle = React.useMemo(() => {
    if (activeTab === 'dashboard') {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      const name = (userProfile.name || 'Aqua').trim().split(/\s+/)[0];
      return `${greeting}, ${name}`;
    }
    return title || 'LUMEN';
  }, [activeTab, title, userProfile.name]);

  const showHeader = activeTab !== 'none';

  return (
    <View
      style={{
        paddingTop: insets.top,
        height: 64 + insets.top,
      }}
      className="border-b border-white/10 overflow-hidden relative bg-[#10131a]"
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={15}
          reducedTransparencyFallbackColor="rgba(16, 19, 26, 0.9)"
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(16, 19, 26, 0.85)',
            }
          ]}
        />
      )}

      <View className="flex-1 flex-row items-center justify-between px-6 z-10">
        <View className="flex-row items-center flex-1 pr-4">
          {showBack && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center shadow-lg mr-3"
            >
              <MaterialIcon name="arrow_back" size={22} color="#adc6ff" />
            </TouchableOpacity>
          )}
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'Montserrat-Bold',
              color: '#FFFFFF',
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {headerTitle}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Assistant icon */}
          {!hideAssistant && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Assistant')}
              activeOpacity={0.8}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center shadow-lg"
            >
              <AIIcon size={22} />
            </TouchableOpacity>
          )}

          {/* Biometric Shield icon */}
          <TouchableOpacity
            onPress={() => navigation.navigate('BiometricGate')}
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center shadow-lg"
          >
            <MaterialIcon name="shield" size={22} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default GlobalHeader;
