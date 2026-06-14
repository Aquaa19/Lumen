import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Switch, ScrollView, TextInput, Modal } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from '../components/MaterialIcon';
import FingerprintIcon from '../public/assets/icons/FingerprintIcon';
import TrashIcon from '../public/assets/icons/TrashIcon';
import BiometricService from '../services/BiometricService';

const numpadRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { 
    userProfile, logout, setBiometricLock, purgeData, setPinCode, setMonthlyBudget, 
    pinCode, monthlyBudget, syncFrequency, setSyncFrequency, lastSyncTimestamp, triggerManualSync 
  } = useMockStore();
  
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeText, setPurgeText] = useState('');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudget, setNewBudget] = useState('');

  const [verificationVisible, setVerificationVisible] = useState(false);
  const [verificationPin, setVerificationPin] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [pinLength, setPinLength] = useState<4 | 6>(4);
  const [setupPin, setSetupPin] = useState('');
  const [confirmSetupPin, setConfirmSetupPin] = useState('');
  const [isConfirmingSetup, setIsConfirmingSetup] = useState(false);
  const [setupPinError, setSetupPinError] = useState<string | null>(null);

  const [showSyncFreqModal, setShowSyncFreqModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const requireVerification = (action: () => void) => {
    setPendingAction(() => action);
    setVerificationPin('');
    setVerificationError(null);
    setVerificationVisible(true);
  };

  const handleExportCSV = () => {
    Alert.alert('Success', 'Transaction records exported as CSV successfully!');
  };

  const handleCustomCategories = () => {
    navigation.navigate('CustomCategories');
  };

  const handleFirebaseSync = async () => {
    setSyncing(true);
    const success = await triggerManualSync();
    setSyncing(false);
    if (success) {
      Alert.alert('Sync Status', 'Synchronization complete. All data has been saved to Firebase Firestore.');
    } else {
      Alert.alert('Sync Status', 'Failed to synchronize with Firebase. Please check your internet connection.');
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTimestamp) return 'Never synced';
    const seconds = Math.floor((Date.now() - lastSyncTimestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(lastSyncTimestamp).toLocaleDateString();
  };

  const handleSignOut = () => {
    logout();
    navigation.getParent()?.replace('Login');
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

  const actualPinLength = pinCode ? pinCode.length : 4;

  const handleVerificationKeyPress = (num: string) => {
    setVerificationError(null);
    if (verificationPin.length < actualPinLength) {
      const nextPin = verificationPin + num;
      setVerificationPin(nextPin);
      
      if (nextPin.length === actualPinLength) {
        if (nextPin === pinCode) {
          setVerificationVisible(false);
          setVerificationPin('');
          if (pendingAction) {
            const action = pendingAction;
            setPendingAction(null);
            setTimeout(() => action(), 300);
          }
        } else {
          setVerificationError('INCORRECT PIN');
          setVerificationPin('');
        }
      }
    }
  };

  const handleVerificationBackspace = () => {
    setVerificationError(null);
    setVerificationPin(prev => prev.slice(0, -1));
  };

  const handleVerificationBiometric = async () => {
    try {
      const success = await BiometricService.authenticate('Scan fingerprint to verify settings action');
      if (success) {
        setVerificationVisible(false);
        setVerificationPin('');
        if (pendingAction) {
          const action = pendingAction;
          setPendingAction(null);
          setTimeout(() => action(), 300);
        }
      } else {
        setVerificationError('BIOMETRIC VERIFICATION FAILED');
      }
    } catch (error) {
      setVerificationError('BIOMETRIC ERROR');
    }
  };

  const handleSetupPinKeyPress = (num: string) => {
    setSetupPinError(null);
    if (!isConfirmingSetup) {
      if (setupPin.length < pinLength) {
        setSetupPin(prev => prev + num);
      }
    } else {
      if (confirmSetupPin.length < pinLength) {
        setConfirmSetupPin(prev => prev + num);
      }
    }
  };

  const handleSetupPinBackspace = () => {
    setSetupPinError(null);
    if (!isConfirmingSetup) {
      setSetupPin(prev => prev.slice(0, -1));
    } else {
      setConfirmSetupPin(prev => prev.slice(0, -1));
    }
  };

  const handleSetupPinSubmit = () => {
    if (!isConfirmingSetup) {
      if (setupPin.length === pinLength) {
        setIsConfirmingSetup(true);
      } else {
        setSetupPinError(`ENTER A ${pinLength}-DIGIT PIN`);
      }
    } else {
      if (confirmSetupPin.length === pinLength) {
        if (setupPin === confirmSetupPin) {
          setPinCode(setupPin);
          setShowPinSetupModal(false);
          setSetupPin('');
          setConfirmSetupPin('');
          setIsConfirmingSetup(false);
          Alert.alert('Success', 'PIN code updated successfully!');
        } else {
          setSetupPinError('PINS DO NOT MATCH');
          setConfirmSetupPin('');
        }
      } else {
        setSetupPinError(`CONFIRM YOUR ${pinLength}-DIGIT PIN`);
      }
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
            <View className="absolute bottom-1 right-1 w-5 h-5 bg-tertiary rounded-full border-4 border-background" />
          </LinearGradient>
          <Text className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">
            {userProfile.name}
          </Text>
          <Text className="font-body-lg text-body-lg text-on-surface-variant mb-6">
            {userProfile.email}
          </Text>

          <TouchableOpacity
            onPress={() => requireVerification(handleSignOut)}
            activeOpacity={0.85}
            className="px-6 py-3 rounded-full bg-error/10 border border-error/20 flex-row items-center gap-2"
          >
            <MaterialIcon name="logout" color="#EF4444" size={16} />
            <Text className="text-error font-title-md text-title-md font-bold">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        <View className="gap-3 mt-6">
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
              onValueChange={(val) => requireVerification(() => setBiometricLock(val))}
              trackColor={{ false: '#272a31', true: '#3B82F6' }}
              thumbColor={userProfile.biometricLock ? '#3B82F6' : '#8c909f'}
            />
          </GlassCard>

          <TouchableOpacity onPress={() => requireVerification(handleExportCSV)} activeOpacity={0.9}>
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

          <TouchableOpacity onPress={() => requireVerification(handleCustomCategories)} activeOpacity={0.9}>
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

          <TouchableOpacity onPress={() => requireVerification(() => {
              setSetupPin('');
              setConfirmSetupPin('');
              setIsConfirmingSetup(false);
              setSetupPinError(null);
              setShowPinSetupModal(true);
            })} activeOpacity={0.9}>
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

          <TouchableOpacity onPress={() => requireVerification(() => {
              setNewBudget(monthlyBudget > 0 ? monthlyBudget.toString() : '');
              setShowBudgetModal(true);
            })} activeOpacity={0.9}>
            <GlassCard contentClassName="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-2xl bg-white/[0.06] items-center justify-center border border-white/5">
                  <MaterialIcon name="menu" color="white" size={30} />
                </View>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: 'white', fontWeight: 'bold' }}>
                  Change Monthly Budget
                </Text>
              </View>
              <MaterialIcon name="chevron_right" color="#8c909f" size={24} />
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => requireVerification(() => setShowSyncFreqModal(true))} activeOpacity={0.9}>
            <GlassCard contentClassName="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-2xl bg-white/[0.06] items-center justify-center border border-white/5">
                  <MaterialIcon name="sync" color="white" size={22} />
                </View>
                <View>
                  <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: 'white', fontWeight: 'bold' }}>
                    Firebase Synchronization
                  </Text>
                  <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#8c909f' }}>
                    Frequency: {syncFrequency === 'realtime' ? 'Real-time' : syncFrequency.charAt(0).toUpperCase() + syncFrequency.slice(1)} • {formatLastSync()}
                  </Text>
                </View>
              </View>
              <MaterialIcon name="chevron_right" color="#8c909f" size={24} />
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => requireVerification(handlePurgeDataPress)} activeOpacity={0.9}>
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
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']}
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

      <Modal
        visible={verificationVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVerificationVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <View className="bg-[#10131a] rounded-t-[32px] border-t border-white/10 p-6 pb-8">
            <View className="items-center mb-6">
              <View className="w-12 h-1.5 bg-white/10 rounded-full mb-4" />
              <Text style={{ fontFamily: 'Montserrat-Bold', color: '#FFFFFF' }} className="text-white text-2xl font-bold text-center">
                Security Verification
              </Text>
              <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-center mt-2 px-6">
                Verify PIN fallback or Biometrics to execute settings options.
              </Text>
            </View>

            <View className="items-center justify-center mb-6">
              <View className="flex-row justify-center mb-2">
                {Array.from({ length: actualPinLength }).map((_, i) => (
                  <View
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full mx-2 border ${
                      verificationPin.length > i 
                        ? 'bg-primary border-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                        : 'bg-white/5 border-white/20'
                    }`}
                  />
                ))}
              </View>
              {verificationError && (
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-red-400 text-xs font-bold mt-1 uppercase">
                  {verificationError}
                </Text>
              )}
            </View>

            <View className="items-center mb-4">
              <View className="w-full max-w-[260px] gap-3">
                {numpadRows.map((row, rIdx) => (
                  <View key={rIdx} className="flex-row justify-between">
                    {row.map(num => (
                      <TouchableOpacity
                        key={num}
                        onPress={() => handleVerificationKeyPress(num)}
                        activeOpacity={0.8}
                        className="w-[64px] h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
                      >
                        <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xl font-bold">
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                
                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={handleVerificationBiometric}
                    activeOpacity={0.8}
                    className="w-[64px] h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
                  >
                    <FingerprintIcon color="#3B82F6" size={24} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleVerificationKeyPress('0')}
                    activeOpacity={0.8}
                    className="w-[64px] h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
                  >
                    <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xl font-bold">
                      0
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleVerificationBackspace}
                    activeOpacity={0.8}
                    className="w-[64px] h-[64px] rounded-full items-center justify-center"
                  >
                    <MaterialIcon name="backspace" color="#ffffff" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setVerificationVisible(false)}
              className="mt-4 w-full h-12 rounded-xl bg-white/5 border border-white/10 items-center justify-center"
            >
              <Text style={{ fontFamily: 'Montserrat-Bold', color: '#c2c6d6', fontWeight: 'bold' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPinSetupModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPinSetupModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <View className="bg-[#10131a] rounded-t-[32px] border-t border-white/10 p-6 pb-8">
            <View className="items-center mb-6">
              <View className="w-12 h-1.5 bg-white/10 rounded-full mb-4" />
              <Text style={{ fontFamily: 'Montserrat-Bold', color: '#FFFFFF' }} className="text-white text-2xl font-bold text-center">
                {isConfirmingSetup ? 'Confirm your Security PIN' : 'Create a Security PIN'}
              </Text>
              <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-center mt-2 px-6">
                Enter your new security passcode to lock your Settings and Wallet.
              </Text>

              {!isConfirmingSetup && (
                <View className="flex-row mt-4 bg-white/5 border border-white/10 rounded-full p-1 w-52 justify-between">
                  <TouchableOpacity
                    onPress={() => {
                      setPinLength(4);
                      setSetupPin('');
                      setSetupPinError(null);
                    }}
                    className={`flex-1 py-1.5 rounded-full items-center ${pinLength === 4 ? 'bg-[#3B82F6]' : ''}`}
                  >
                    <Text style={{ fontFamily: 'Montserrat-Bold', color: 'white' }} className="text-xs font-bold">4 Digits</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setPinLength(6);
                      setSetupPin('');
                      setSetupPinError(null);
                    }}
                    className={`flex-1 py-1.5 rounded-full items-center ${pinLength === 6 ? 'bg-[#3B82F6]' : ''}`}
                  >
                    <Text style={{ fontFamily: 'Montserrat-Bold', color: 'white' }} className="text-xs font-bold">6 Digits</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="items-center justify-center mb-6">
              <View className="flex-row justify-center mb-2">
                {Array.from({ length: pinLength }).map((_, i) => (
                  <View
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full mx-2 border ${
                      (isConfirmingSetup ? confirmSetupPin.length : setupPin.length) > i 
                        ? 'bg-primary border-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                        : 'bg-white/5 border-white/20'
                    }`}
                  />
                ))}
              </View>
              {setupPinError && (
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-red-400 text-xs font-bold mt-1 uppercase">
                  {setupPinError}
                </Text>
              )}
            </View>

            <View className="items-center mb-4">
              <View className="w-full max-w-[260px] gap-3">
                {numpadRows.map((row, rIdx) => (
                  <View key={rIdx} className="flex-row justify-between">
                    {row.map(num => (
                      <TouchableOpacity
                        key={num}
                        onPress={() => handleSetupPinKeyPress(num)}
                        activeOpacity={0.8}
                        className="w-[64px] h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
                      >
                        <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xl font-bold">
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                
                <View className="flex-row justify-between">
                  <View className="w-[64px] h-[64px]" />
                  <TouchableOpacity
                    onPress={() => handleSetupPinKeyPress('0')}
                    activeOpacity={0.8}
                    className="w-[64px] h-[64px] rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center"
                  >
                    <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xl font-bold">
                      0
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSetupPinBackspace}
                    activeOpacity={0.8}
                    className="w-[64px] h-[64px] rounded-full items-center justify-center"
                  >
                    <MaterialIcon name="backspace" color="#ffffff" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="gap-2.5 mt-4">
              <TouchableOpacity
                onPress={handleSetupPinSubmit}
                activeOpacity={0.85}
                className="w-full h-12 bg-primary rounded-xl items-center justify-center flex-row gap-2 shadow-lg"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', color: 'white' }} className="text-sm font-bold">
                  {isConfirmingSetup ? 'Register PIN' : 'Confirm PIN'}
                </Text>
                <MaterialIcon name="arrow_forward" color="#ffffff" size={16} />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowPinSetupModal(false)}
                className="w-full h-12 rounded-xl bg-white/5 border border-white/10 items-center justify-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', color: '#c2c6d6', fontWeight: 'bold' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      {/* 5. UNIFIED FIREBASE SYNC MODAL */}
      <Modal
        visible={showSyncFreqModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSyncFreqModal(false)}
      >
        <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <GlassCard className="w-full max-w-sm p-6 border border-white/10">
            <Text 
              style={{ fontFamily: 'Montserrat-Bold', fontSize: 22, color: 'white', marginBottom: 12, textAlign: 'center', fontWeight: 'bold' }}
            >
              Firebase Sync settings
            </Text>
            <Text 
              style={{ fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#c2c6d6', marginBottom: 20, textAlign: 'center', lineHeight: 18 }}
            >
              Choose your sync frequency or trigger a manual data sync below.
            </Text>

            <View className="gap-2 mb-5">
              {(['realtime', 'daily', 'weekly', 'manual', 'never'] as const).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  onPress={() => {
                    setSyncFrequency(freq);
                  }}
                  className={`p-3.5 rounded-xl border flex-row justify-between items-center ${
                    syncFrequency === freq 
                      ? 'bg-primary/20 border-primary' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <Text style={{ fontFamily: 'Montserrat-Bold', color: 'white', fontWeight: 'bold', fontSize: 15 }}>
                    {freq === 'realtime' ? 'Real-time (Instant)' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                  {syncFrequency === freq && (
                    <MaterialIcon name="check" color="#3B82F6" size={20} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Manual Sync Trigger Section */}
            <View className="mb-5 p-4 rounded-xl bg-white/[0.03] border border-white/5 items-center">
              <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#8c909f', marginBottom: 10 }}>
                Last synced: {formatLastSync()}
              </Text>
              <TouchableOpacity
                onPress={handleFirebaseSync}
                disabled={syncing}
                style={{ backgroundColor: syncing ? 'rgba(59, 130, 246, 0.4)' : '#3B82F6' }}
                className="w-full py-3 rounded-xl flex-row justify-center items-center gap-2"
              >
                <MaterialIcon name="sync" color="white" size={18} />
                <Text style={{ fontFamily: 'Montserrat-Bold', color: 'white', fontWeight: 'bold' }}>
                  {syncing ? 'Syncing...' : 'Sync Data Now'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setShowSyncFreqModal(false)}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 items-center"
            >
              <Text style={{ fontFamily: 'Montserrat-Bold', color: '#c2c6d6', fontWeight: 'bold' }}>
                Done
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
    </GlobalLayout>
  );
};
export default SettingsScreen;
