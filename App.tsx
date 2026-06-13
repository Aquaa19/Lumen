import './global.css';
import React from 'react';
import { StatusBar, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MockStoreProvider } from './src/store/mockStore';
import AppNavigator from './src/navigation/AppNavigator';

// Override default font family globally to force standard system sans-serif
const defaultStyle = { fontFamily: 'Montserrat-Regular' };

try {
  if ((Text as any).defaultProps == null) {
    (Text as any).defaultProps = {};
  }
  (Text as any).defaultProps.style = {
    ...defaultStyle,
    ...(Text as any).defaultProps.style,
  };
} catch (e) {
  console.warn('Failed to set global Text defaultProps style override:', e);
}

try {
  if ((TextInput as any).defaultProps == null) {
    (TextInput as any).defaultProps = {};
  }
  (TextInput as any).defaultProps.style = {
    ...defaultStyle,
    ...(TextInput as any).defaultProps.style,
  };
} catch (e) {
  console.warn('Failed to set global TextInput defaultProps style override:', e);
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <MockStoreProvider>
        <StatusBar barStyle="light-content" backgroundColor="#10131a" />
        <AppNavigator />
      </MockStoreProvider>
    </SafeAreaProvider>
  );
}

export default App;
