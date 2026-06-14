import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Switch, ScrollView } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from '../components/MaterialIcon';
import FingerprintIcon from '../public/assets/icons/FingerprintIcon';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile, logout, setBiometricLock } = useMockStore();

  const handleExportCSV = () => {
    Alert.alert('Success', 'Transaction records exported as CSV successfully!');
  };

  const handleCustomCategories = () => {
    navigation.navigate('CustomCategories');
  };

  const handleFirebaseSync = () => {
    Alert.alert('Sync Status', 'Sync complete. All mock data synced successfully.');
  };

  const handleSignOut = () => {
    logout();
    navigation.getParent()?.replace('Login');
  };

  return (
    <GlobalLayout
      activeTab="settings"
      navigation={navigation}
      title="Lumen"
    >

      <ScrollView 
        className="flex-1 mt-6 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* Profile Header */}
        <View className="items-center py-6">
          <LinearGradient
            colors={['#3B82F6', 'rgba(59, 130, 246, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 128,
              height: 128,
              borderRadius: 64,
              padding: 4,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Image 
              source={{ uri: userProfile.avatar }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 60,
                borderWidth: 4,
                borderColor: '#10131a',
              }}
            />
            {/* Status dot */}
            <View className="absolute bottom-1 right-1 w-5 h-5 bg-tertiary rounded-full border-4 border-background" />
          </LinearGradient>
          <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">
            {userProfile.name}
          </Text>
          <Text className="font-body-lg text-body-lg text-on-surface-variant mb-6">
            {userProfile.email}
          </Text>

          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.85}
            className="px-6 py-3 rounded-full bg-error/10 border border-error/20 flex-row items-center gap-2"
          >
            <MaterialIcon name="logout" color="#EF4444" size={16} />
            <Text className="text-error font-title-md text-title-md font-bold">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings Rows */}
        <View className="gap-3 mt-6">
          {/* Biometric Toggle */}
          <GlassCard contentClassName="flex-row items-center justify-between p-4">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-2xl bg-white/[0.06] items-center justify-center border border-white/5">
                <FingerprintIcon color="white" size={22} />
              </View>
              <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: 'white', fontWeight: 'bold' }}>
                Biometric Lock
              </Text>
            </View>
            <Switch
              value={userProfile.biometricLock}
              onValueChange={setBiometricLock}
              trackColor={{ false: '#272a31', true: '#3B82F6' }}
              thumbColor={userProfile.biometricLock ? '#3B82F6' : '#8c909f'}
            />
          </GlassCard>

          {/* Export to CSV */}
          <TouchableOpacity onPress={handleExportCSV} activeOpacity={0.9}>
            <GlassCard contentClassName="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-2xl bg-white/[0.06] items-center justify-center border border-white/5">
                  <MaterialIcon name="file_download" color="white" size={22} />
                </View>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: 'white', fontWeight: 'bold' }}>
                  Export Data to CSV
                </Text>
              </View>
              <MaterialIcon name="chevron_right" color="#8c909f" size={24} />
            </GlassCard>
          </TouchableOpacity>

          {/* Custom Categories */}
          <TouchableOpacity onPress={handleCustomCategories} activeOpacity={0.9}>
            <GlassCard contentClassName="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-2xl bg-white/[0.06] items-center justify-center border border-white/5">
                  <MaterialIcon name="folder" color="white" size={22} />
                </View>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: 'white', fontWeight: 'bold' }}>
                  Custom Categories
                </Text>
              </View>
              <MaterialIcon name="chevron_right" color="#8c909f" size={24} />
            </GlassCard>
          </TouchableOpacity>

          {/* Sync with Firebase */}
          <TouchableOpacity onPress={handleFirebaseSync} activeOpacity={0.9}>
            <GlassCard contentClassName="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-2xl bg-white/[0.06] items-center justify-center border border-white/5">
                  <MaterialIcon name="sync" color="white" size={22} />
                </View>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: 'white', fontWeight: 'bold' }}>
                  Sync with Firebase
                </Text>
              </View>
              <Text style={{ fontFamily: 'Montserrat-Regular' }} className="font-body-sm text-body-sm text-on-surface-variant">Just now</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </GlobalLayout>
  );
};
export default SettingsScreen;

