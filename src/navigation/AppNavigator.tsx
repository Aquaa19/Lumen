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
import PaymentsScreen from '../screens/PaymentsScreen';
import WalletScreen from '../screens/WalletScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomCategoriesScreen from '../screens/CustomCategoriesScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import SelfTransferScreen from '../screens/SelfTransferScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PinFallbackScreen from '../screens/PinFallbackScreen';

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
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
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
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SetupWizard" component={SetupWizardScreen} />
        <Stack.Screen name="BiometricGate" component={BiometricGateScreen} />
        <Stack.Screen name="PinFallback" component={PinFallbackScreen} />
        
        {/* Main Tab stack */}
        <Stack.Screen name="MainApp" component={MainTabNavigator} />

        {/* Global Modal / Push screens */}
        <Stack.Screen name="Assistant" component={AssistantScreen} />
        <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
        <Stack.Screen name="SelfTransfer" component={SelfTransferScreen} />
        <Stack.Screen name="CustomCategories" component={CustomCategoriesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;
