import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SetupWizardScreen from '../screens/SetupWizardScreen';
import BiometricGateScreen from '../screens/BiometricGateScreen';
import DashboardScreen from '../screens/DashboardScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import AssistantScreen from '../screens/AssistantScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import SelfTransferScreen from '../screens/SelfTransferScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigation group
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Assistant" component={AssistantScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#10131a' } // base dark background
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SetupWizard" component={SetupWizardScreen} />
        <Stack.Screen name="BiometricGate" component={BiometricGateScreen} />
        
        {/* Main Tab stack */}
        <Stack.Screen name="MainApp" component={MainTabNavigator} />

        {/* Global Modal / Push screens */}
        <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
        <Stack.Screen name="SelfTransfer" component={SelfTransferScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;
