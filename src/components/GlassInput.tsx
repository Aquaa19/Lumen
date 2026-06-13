import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface GlassInputProps extends TextInputProps {
  label: string;
  className?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ label, className = '', ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`w-full flex flex-col gap-2 ${className}`}>
      <Text className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest opacity-75">
        {label}
      </Text>
      <View 
        className={`w-full h-14 rounded-2xl border bg-white/[0.03] overflow-hidden transition-all duration-300 ${
          isFocused 
            ? 'border-primary bg-white/[0.06] shadow-[0_0_20px_rgba(173,198,255,0.1)]' 
            : 'border-white/[0.08]'
        }`}
      >
        <TextInput
          className="w-full h-full px-4 text-white text-base font-body"
          placeholderTextColor="rgba(225, 226, 236, 0.3)"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
    </View>
  );
};
export default GlassInput;
