import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Switch, ScrollView, TextInput, Modal } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from '../components/MaterialIcon';
import FingerprintIcon from '../public/assets/icons/FingerprintIcon';
import TrashIcon from '../public/assets/icons/TrashIcon';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile, logout, setBiometricLock, purgeData, setPinCode, setMonthlyBudget, pinCode, monthlyBudget } = useMockStore();
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeText, setPurgeText] = useState('');

  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudget, setNewBudget] = useState('');

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

  const handleSavePin = () => {
    if (newPin.length !== 4 || isNaN(parseInt(newPin, 10))) {
      Alert.alert('Error', 'PIN must be exactly 4 digits.');
      return;
    }
    setPinCode(newPin);
    setShowPinModal(false);
    Alert.alert('Success', 'PIN code updated successfully!');
  };

  const handleSaveBudget = () => {
    const budgetVal = parseFloat(newBudget);
    if (isNaN(budgetVal) || budgetVal < 0) {
      Alert.alert('Error', 'Please enter a valid budget amount.');
      return;
    }
    setMonthlyBudget(budgetVal);
    setShowBudgetModal(false);
    Alert.alert('Success', 'Monthly budget updated successfully!');
  };

  const handlePurgeDataPress = () => {
    Alert.alert(
      'Purge Data',
      'Are you sure you want to purge all data from local and firebase?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => {
            setPurgeText('');
            setShowPurgeModal(true);
          } 
        }
      ]
    );
  };

  const handleConfirmPurge = async () => {
    if (purgeText === 'PURGE') {
      setShowPurgeModal(false);
      await purgeData();
      navigation.getParent()?.replace('Login');
    }
  };

  return (
    <GlobalLayout
      activeTab="settings"
      navigation={navigation}
      title="Lumen"
    >
      <View className="flex-1 relative">
        <ScrollView 
          className="flex-1 mt-6 px-6" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 }}
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

          {/* Change PIN Code */}
          <TouchableOpacity onPress={() => { setNewPin(''); setShowPinModal(true); }} activeOpacity={0.9}>
            <GlassCard contentClassName="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-2xl bg-white/[0.06] items-center justify-center border border-white/5">
                  <MaterialIcon name="lock" color="white" size={22} />
                </View>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: 'white', fontWeight: 'bold' }}>
                  Change PIN Code
                </Text>
              </View>
              <MaterialIcon name="chevron_right" color="#8c909f" size={24} />
            </GlassCard>
          </TouchableOpacity>

          {/* Change Monthly Budget */}
          <TouchableOpacity onPress={() => { setNewBudget(monthlyBudget > 0 ? monthlyBudget.toString() : ''); setShowBudgetModal(true); }} activeOpacity={0.9}>
            <GlassCard contentClassName="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-2xl bg-white/[0.06] items-center justify-center border border-white/5">
                  <MaterialIcon name="payments" color="white" size={22} />
                </View>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: 'white', fontWeight: 'bold' }}>
                  Change Monthly Budget
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

          {/* Purge Data */}
          <TouchableOpacity onPress={handlePurgeDataPress} activeOpacity={0.9}>
            <GlassCard contentClassName="flex-row items-center justify-between p-4 border border-error/20 bg-error/5">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-2xl bg-error/10 items-center justify-center border border-error/20">
                  <TrashIcon size={22} color="#EF4444" />
                </View>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#EF4444', fontWeight: 'bold' }}>
                  Purge Data
                </Text>
              </View>
              <MaterialIcon name="chevron_right" color="#EF4444" size={24} />
            </GlassCard>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']} // True Pitch Black
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 140,
        }}
        pointerEvents="none"
      />
      </View>

      {/* Verification Modal for Purge Confirmation */}
      <Modal
        visible={showPurgeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPurgeModal(false)}
      >
        <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
          <GlassCard className="w-full max-w-sm p-6 border border-error/20">
            <Text 
              style={{ fontFamily: 'Montserrat-Bold', fontSize: 22, color: '#EF4444', marginBottom: 12, textAlign: 'center', fontWeight: 'bold' }}
            >
              Verify Purge
            </Text>
            <Text 
              style={{ fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#c2c6d6', marginBottom: 20, textAlign: 'center', lineHeight: 20 }}
            >
              Please type the word <Text className="font-bold text-white">PURGE</Text> in all caps below to permanently delete your data.
            </Text>
            
            <TextInput
              value={purgeText}
              onChangeText={setPurgeText}
              placeholder="Type PURGE here"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              autoCapitalize="characters"
              autoCorrect={false}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                borderColor: purgeText === 'PURGE' ? '#4ade80' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                color: 'white',
                fontFamily: 'Montserrat-Bold',
                fontSize: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                textAlign: 'center',
                marginBottom: 20,
              }}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowPurgeModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 items-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', color: '#c2c6d6', fontWeight: 'bold' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                disabled={purgeText !== 'PURGE'}
                onPress={handleConfirmPurge}
                style={{ opacity: purgeText === 'PURGE' ? 1 : 0.5 }}
                className="flex-1 py-3 rounded-xl bg-error items-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', color: 'white', fontWeight: 'bold' }}>
                  Purge
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Change PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
          <GlassCard className="w-full max-w-sm p-6 border border-white/10">
            <Text 
              style={{ fontFamily: 'Montserrat-Bold', fontSize: 22, color: 'white', marginBottom: 12, textAlign: 'center', fontWeight: 'bold' }}
            >
              Change PIN Code
            </Text>
            <Text 
              style={{ fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#c2c6d6', marginBottom: 20, textAlign: 'center', lineHeight: 20 }}
            >
              Enter a new 4-digit security PIN fallback code.
            </Text>
            
            <TextInput
              value={newPin}
              onChangeText={setNewPin}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry={true}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                color: 'white',
                fontFamily: 'Montserrat-Bold',
                fontSize: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                textAlign: 'center',
                marginBottom: 20,
              }}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowPinModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 items-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', color: '#c2c6d6', fontWeight: 'bold' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                disabled={newPin.length !== 4}
                onPress={handleSavePin}
                style={{ opacity: newPin.length === 4 ? 1 : 0.5 }}
                className="flex-1 py-3 rounded-xl bg-primary items-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', color: 'white', fontWeight: 'bold' }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Change Monthly Budget Modal */}
      <Modal
        visible={showBudgetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
          <GlassCard className="w-full max-w-sm p-6 border border-white/10">
            <Text 
              style={{ fontFamily: 'Montserrat-Bold', fontSize: 22, color: 'white', marginBottom: 12, textAlign: 'center', fontWeight: 'bold' }}
            >
              Change Monthly Budget
            </Text>
            <Text 
              style={{ fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#c2c6d6', marginBottom: 20, textAlign: 'center', lineHeight: 20 }}
            >
              Enter your new total monthly spending budget limit.
            </Text>
            
            <TextInput
              value={newBudget}
              onChangeText={setNewBudget}
              placeholder="Enter budget (e.g. 15000)"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              keyboardType="numeric"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                color: 'white',
                fontFamily: 'Montserrat-Bold',
                fontSize: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                textAlign: 'center',
                marginBottom: 20,
              }}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowBudgetModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 items-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', color: '#c2c6d6', fontWeight: 'bold' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                disabled={newBudget.trim() === ''}
                onPress={handleSaveBudget}
                style={{ opacity: newBudget.trim() !== '' ? 1 : 0.5 }}
                className="flex-1 py-3 rounded-xl bg-primary items-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', color: 'white', fontWeight: 'bold' }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </GlobalLayout>
  );
};
export default SettingsScreen;

