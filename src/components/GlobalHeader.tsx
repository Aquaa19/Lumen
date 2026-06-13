import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMockStore } from '../store/mockStore';
import { BlurView } from '@react-native-community/blur';
import MaterialIcon from './MaterialIcon';

interface GlobalHeaderProps {
  title?: string;
  showBack?: boolean;
  navigation: any;
  rightAction?: 'biometric' | 'logout' | 'profile' | 'none';
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title,
  showBack = false,
  navigation,
  rightAction = 'none',
}) => {
  const insets = useSafeAreaInsets();
  const { userProfile, logout } = useMockStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          // Reset stack to Login
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const renderLeft = () => {
    if (showBack) {
      return (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/5 border border-white/5"
        >
          <MaterialIcon name="arrow_back" color="#8c909f" size={24} />
        </TouchableOpacity>
      );
    }

    // Default left items based on layout
    if (rightAction === 'biometric') {
      // Greeting style for Dashboard
      return (
        <View className="flex-row items-center gap-2">
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 28,
              lineHeight: 34,
              fontWeight: 'bold',
              fontFamily: 'sans-serif-medium',
              color: 'white',
              letterSpacing: -0.5,
            }}
          >
            Hi, <Text style={{ color: '#adc6ff' }}>{userProfile.name || 'Aqua'}</Text>
          </Text>
          <View className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse mt-2" />
        </View>
      );
    }

    if (rightAction === 'logout') {
      // Profile on the left for Settings Screen
      return (
        <View className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant flex-row justify-center items-center">
          <MaterialIcon name="person" color="#3B82F6" size={20} />
        </View>
      );
    }

    // Default fallback menu button
    return (
      <TouchableOpacity className="w-10 h-10 items-center justify-center">
        <MaterialIcon name="menu" color="#3B82F6" size={24} />
      </TouchableOpacity>
    );
  };

  const renderCenter = () => {
    if (showBack) {
      return (
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 20,
            lineHeight: 28,
            fontWeight: 'bold',
            fontFamily: 'sans-serif-medium',
            color: 'white',
          }}
        >
          {title}
        </Text>
      );
    }

    if (rightAction === 'biometric') {
      return null; // Dashboard uses greeting on the left, center is empty
    }

    // Default screen titles
    return (
      <Text
        allowFontScaling={false}
        style={{
          fontSize: 20,
          lineHeight: 28,
          fontWeight: 'bold',
          fontFamily: 'sans-serif-medium',
          color: rightAction === 'logout' ? 'white' : '#adc6ff',
          letterSpacing: rightAction === 'logout' ? -0.5 : 0.5,
        }}
        className={rightAction === 'logout' ? '' : 'font-label-caps text-label-caps tracking-widest'}
      >
        {title || 'Lumen'}
      </Text>
    );
  };

  const renderRight = () => {
    switch (rightAction) {
      case 'biometric':
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('BiometricGate')}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center shadow-lg"
          >
            <MaterialIcon name="fingerprint" size={22} color="#a5c3ff" />
          </TouchableOpacity>
        );
      case 'logout':
        return (
          <TouchableOpacity
            onPress={handleSignOut}
            className="w-10 h-10 items-center justify-center rounded-full bg-white/5 border border-white/5"
          >
            <MaterialIcon name="logout" color="#ffb4ab" size={22} />
          </TouchableOpacity>
        );
      case 'profile':
        return (
          <View className="w-10 h-10 rounded-full bg-surface-variant justify-center items-center">
            <MaterialIcon name="person" color="#3B82F6" size={20} />
          </View>
        );
      default:
        return <View className="w-10" />; // Spacer matching left button width
    }
  };

  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 16),
      }}
      className="flex-row items-center justify-between px-6 pb-4 border-b border-white/10 overflow-hidden relative"
    >
      {Platform.OS === 'android' ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurRadius={15}
          overlayColor="rgba(16, 19, 26, 0.45)"
        />
      ) : Platform.OS === 'ios' ? (
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
              backgroundColor: 'rgba(16, 19, 26, 0.45)',
            }
          ]}
        />
      )}
      <View className="w-1/3 items-start z-10">{renderLeft()}</View>
      <View className="w-1/3 items-center z-10">{renderCenter()}</View>
      <View className="w-1/3 items-end z-10">{renderRight()}</View>
    </View>
  );
};

export default GlobalHeader;
