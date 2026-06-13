import React from 'react';
import { Text, View } from 'react-native';
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
import MaterialIcon from '../components/MaterialIcon';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigation group
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#191b23', // surface-container-low
          borderTopWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: '#3B82F6', // primary
        tabBarInactiveTintColor: 'rgba(225, 226, 236, 0.4)', // on-surface-variant/40
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: 'home' | 'bar_chart' | 'smart_toy' | 'settings' = 'home';
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Statistics') iconName = 'bar_chart';
          else if (route.name === 'Assistant') iconName = 'smart_toy';
          else if (route.name === 'Settings') iconName = 'settings';

          return (
            <View className={`items-center justify-center p-1.5 rounded-xl ${focused ? 'bg-primary/10' : ''}`}>
              <MaterialIcon name={iconName} size={20} color={color} />
            </View>
          );
        }
      })}
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
