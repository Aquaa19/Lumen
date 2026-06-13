import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Circle, RadialGradient, Defs, Stop } from 'react-native-svg';

interface GlowOrbProps {
  style?: ViewStyle;
  color?: string;
  opacity?: number;
  size?: number;
  gradientId: string;
}

export const GlowOrb: React.FC<GlowOrbProps> = ({ 
  style, 
  color = '#3B82F6', 
  opacity = 0.15, 
  size = 300,
  gradientId
}) => {
  return (
    <View style={[{ width: size, height: size, position: 'absolute' }, style]} pointerEvents="none">
      <Svg height="100%" width="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="60%" stopColor={color} stopOpacity={opacity * 0.35} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50%" cy="50%" r="50%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
};
export default GlowOrb;
