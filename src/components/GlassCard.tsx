import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  contentClassName?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  active = false,
  contentClassName = 'p-4'
}) => {
  return (
    <View 
      className={`rounded-2xl overflow-hidden border border-white/10 ${
        active 
          ? 'bg-white/10' 
          : 'bg-white/5 shadow-lg'
      } ${className}`}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={active ? 30 : 15}
          reducedTransparencyFallbackColor="rgba(16, 19, 26, 0.8)"
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: active ? 'rgba(30, 41, 59, 0.55)' : 'rgba(20, 23, 30, 0.45)',
            }
          ]}
        />
      )}
      <View className={`${contentClassName} relative z-10`}>
        {children}
      </View>
    </View>
  );
};
export default GlassCard;
