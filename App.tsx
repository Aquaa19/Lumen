import './global.css';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MockStoreProvider } from './src/store/mockStore';
import AppNavigator from './src/navigation/AppNavigator';



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
