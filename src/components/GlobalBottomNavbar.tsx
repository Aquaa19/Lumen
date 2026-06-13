import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import MaterialIcon from './MaterialIcon';

interface GlobalBottomNavbarProps {
  activeTab: 'dashboard' | 'statistics' | 'assistant' | 'settings' | 'none';
  navigation: any;
}

export const GlobalBottomNavbar: React.FC<GlobalBottomNavbarProps> = ({
  activeTab,
  navigation,
}) => {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: 'home', route: 'Dashboard' },
    { key: 'statistics', label: 'Statistics', icon: 'bar_chart', route: 'Statistics' },
    { key: 'assistant', label: 'Assistant', icon: 'smart_toy', route: 'Assistant' },
    { key: 'settings', label: 'Settings', icon: 'settings', route: 'Settings' },
  ] as const;

  const handleTabPress = (route: string) => {
    navigation.navigate(route);
  };

  return (
    <View style={styles.navbarContainer}>
      {Platform.OS === 'android' ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurRadius={15}
          overlayColor="rgba(25, 27, 35, 0.45)"
        />
      ) : Platform.OS === 'ios' ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={15}
          reducedTransparencyFallbackColor="rgba(25, 27, 35, 0.9)"
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(25, 27, 35, 0.45)',
            }
          ]}
        />
      )}
      <View style={{ flex: 1, flexDirection: 'row', zIndex: 10 }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          const color = isActive ? '#3B82F6' : 'rgba(225, 226, 236, 0.4)';
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.8}
              className="flex-1 py-2 items-center justify-center"
            >
              <View 
                className={`items-center justify-center p-1.5 rounded-xl ${
                  isActive ? 'bg-primary/10' : ''
                }`}
              >
                <MaterialIcon name={tab.icon} size={20} color={color} />
              </View>
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  fontFamily: 'sans-serif',
                  color,
                  marginTop: 2,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent', // Make container transparent for blur transparency
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 70,
    paddingBottom: 8,
    paddingTop: 6,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden', // Contain the blur edges
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
});

export default GlobalBottomNavbar;
