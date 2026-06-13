import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcon from './MaterialIcon';

interface GlobalBottomNavbarProps {
  activeTab: 'dashboard' | 'statistics' | 'assistant' | 'settings' | 'none';
  navigation: any;
}

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home', route: 'Dashboard' },
  { key: 'statistics', label: 'Statistics', icon: 'bar_chart', route: 'Statistics' },
  { key: 'assistant', label: 'Assistant', icon: 'smart_toy', route: 'Assistant' },
  { key: 'settings', label: 'Settings', icon: 'settings', route: 'Settings' },
] as const;

// 1. THIS IS THE MAGIC TRICK: 
// A variable outside the component lifecycle that remembers the last tab you were on.
let previousTabIndex = 0;

export const GlobalBottomNavbar: React.FC<GlobalBottomNavbarProps> = ({
  activeTab,
  navigation,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 12);

  const activeIndex = TABS.findIndex(t => t.key === activeTab);
  const targetIndex = activeIndex >= 0 ? activeIndex : 0;

  // 2. Initialize the animation at the PREVIOUS position, not the target position.
  const tabIndexAnim = useRef(new Animated.Value(previousTabIndex)).current;

  useEffect(() => {
    // 3. Update the memory immediately so the next screen knows where to start
    previousTabIndex = targetIndex;

    // 4. Spring from the previous location to the new target location
    Animated.spring(tabIndexAnim, {
      toValue: targetIndex,
      useNativeDriver: true,
      bounciness: 12,
      speed: 12,
    }).start();
  }, [targetIndex, tabIndexAnim]);

  const handleTabPress = (route: string) => {
    navigation.navigate(route);
  };

  const tabWidth = containerWidth / TABS.length;

  return (
    <View style={[styles.navbarContainer, { bottom: bottomMargin }]}>
      <View 
        style={{ flex: 1, flexDirection: 'row', zIndex: 10, position: 'relative' }}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        
        {/* The Sliding Squishy Circle Background */}
        {containerWidth > 0 && activeTab !== 'none' && (() => {
          const S = 40; // Circle size
          const getC = (i: number) => tabWidth * i + (tabWidth - S) / 2;
          return (
            <Animated.View
              style={{
                position: 'absolute',
                top: 8,
                left: 0,
                width: S,
                height: S,
                backgroundColor: 'rgba(173, 198, 255, 0.16)',
                borderRadius: S / 2,
                transform: [
                  {
                    translateX: tabIndexAnim.interpolate({
                      inputRange: [0, 0.5, 1, 1.5, 2, 2.5, 3],
                      outputRange: [
                        getC(0),
                        getC(0) + tabWidth / 2,
                        getC(1),
                        getC(1) + tabWidth / 2,
                        getC(2),
                        getC(2) + tabWidth / 2,
                        getC(3),
                      ],
                    }),
                  },
                  {
                    scaleX: tabIndexAnim.interpolate({
                      inputRange: [0, 0.5, 1, 1.5, 2, 2.5, 3],
                      outputRange: [
                        1,
                        1 + tabWidth / S,
                        1,
                        1 + tabWidth / S,
                        1,
                        1 + tabWidth / S,
                        1,
                      ],
                    }),
                  },
                ],
              }}
            />
          );
        })()}

        {/* Navigation Items */}
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const color = isActive ? '#adc6ff' : 'rgba(225, 226, 236, 0.4)';

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.8}
              className="flex-1 items-center justify-start pt-2 z-10"
            >
              <View className="h-10 w-10 items-center justify-center">
                <MaterialIcon name={tab.icon} size={22} color={color} />
              </View>
              
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 'bold' : '600',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  fontFamily: isActive ? 'Montserrat-Bold' : 'Montserrat-Regular',
                  color,
                  marginTop: 4,
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
    backgroundColor: '#191b23',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    height: 70,
    paddingBottom: 0,
    paddingTop: 6,
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
});

export default GlobalBottomNavbar;