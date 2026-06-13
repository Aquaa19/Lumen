import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface BackgroundLayoutProps {
  children: React.ReactNode;
  style?: any;
}

export const BackgroundLayout: React.FC<BackgroundLayoutProps> = ({ children, style }) => {
  return (
    <LinearGradient
      colors={['#10131a', '#0F172A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default BackgroundLayout;
