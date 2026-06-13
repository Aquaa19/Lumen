import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface PrimaryButtonProps {
  onPress: () => void;
  title: string;
  className?: string;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ onPress, title, className = '', disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      className={`w-full h-14 rounded-2xl bg-primary-container items-center justify-center shadow-[0_0_20px_rgba(77,142,255,0.4)] ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
    >
      <Text className="font-title-md text-title-md text-on-primary-container font-bold">
        {title}
      </Text>
    </TouchableOpacity>
  );
};
export default PrimaryButton;
