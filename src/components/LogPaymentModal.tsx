import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, TextInput, Alert, Vibration, ScrollView } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useMockStore } from '../store/mockStore';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import MaterialIcon from './MaterialIcon';

interface LogPaymentModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LogPaymentModal: React.FC<LogPaymentModalProps> = ({ visible, onClose }) => {
  const { addTransaction, cashBalance, upiBalance, showToast, categories, categoryLimits, transactions } = useMockStore();
  const [amount, setAmount] = useState('0');
  const [source, setSource] = useState<'cash' | 'upi'>('cash');
  const [selectedCategory, setSelectedCategory] = useState('Others');
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [containerWidth, setContainerWidth] = useState(0);

  const toggleAnim = useRef(new Animated.Value(source === 'cash' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: source === 'cash' ? 0 : 1,
      useNativeDriver: true,
      bounciness: 8,
      speed: 12,
    }).start();
  }, [source, toggleAnim]);

  const handleNumPress = (val: string) => {
    try {
      Vibration.vibrate(15);
    } catch (e) {}
    if (amount === '0') {
      if (val === '.') {
        setAmount('0.');
      } else {
        setAmount(val);
      }
    } else {
      if (val === '.' && amount.includes('.')) return;
      // Limit to 2 decimal places
      if (amount.includes('.')) {
        const parts = amount.split('.');
        if (parts[1].length >= 2) return;
      }
      setAmount(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    try {
      Vibration.vibrate(15);
    } catch (e) {}
    if (amount.length <= 1) {
      setAmount('0');
    } else {
      setAmount(prev => prev.slice(0, -1));
    }
  };

  const executeSave = (numericAmount: number) => {
    const finalTitle = title.trim() || selectedCategory;
    addTransaction(finalTitle, numericAmount, source, selectedCategory, note || undefined);
    showToast('Payment saved successfully!');
    
    // Reset inputs
    setAmount('0');
    setSource('cash');
    setSelectedCategory('Others');
    setNote('');
    setTitle('');
    onClose();
  };

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    const availableBalance = source === 'cash' ? cashBalance : upiBalance;
    const categoryLimit = categoryLimits[selectedCategory] || 0;

    // Calculate how much has already been spent in this category this month (based on dates containing 'Jun' or mock transaction mapping)
    // For simplicity, we sum all transactions matching this category
    const categorySpent = transactions
      .filter(t => t.category === selectedCategory && t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    const isOverCategoryBudget = categoryLimit > 0 && (categorySpent + numericAmount > categoryLimit);
    const isOverAvailableBalance = numericAmount > availableBalance;

    let titleText = 'Confirm Transaction';
    let warningMsg = '';

    if (isOverAvailableBalance && isOverCategoryBudget) {
      titleText = 'Budget & Balance Warning';
      warningMsg = `You are exceeding both:\n1. Your available ${source.toUpperCase()} balance.\n2. Your ₹${categoryLimit} budget limit for ${selectedCategory} (already spent: ₹${categorySpent.toFixed(2)}).`;
    } else if (isOverAvailableBalance) {
      titleText = 'Insufficient Balance';
      warningMsg = `The amount ₹${numericAmount.toFixed(2)} exceeds your available ${source.toUpperCase()} balance (₹${availableBalance.toFixed(2)}).`;
    } else if (isOverCategoryBudget) {
      titleText = 'Budget Limit Exceeded';
      warningMsg = `This expense of ₹${numericAmount.toFixed(2)} will exceed your ₹${categoryLimit} monthly budget limit for ${selectedCategory} (already spent: ₹${categorySpent.toFixed(2)}).`;
    }

    if (isOverAvailableBalance || isOverCategoryBudget) {
      Alert.alert(
        titleText,
        `${warningMsg}\n\nDo you want to proceed anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed',
            onPress: () => {
              executeSave(numericAmount);
            },
          },
        ]
      );
    } else {
      executeSave(numericAmount);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop Blur */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={25}
          reducedTransparencyFallbackColor="rgba(16, 19, 26, 0.8)"
        />
        
        {/* Dismiss Backdrop Tap area */}
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1} 
          onPress={onClose} 
        />

        {/* Modal Sheet Container */}
        <View 
          style={{
            width: '100%',
            backgroundColor: 'rgba(29, 32, 39, 0.9)', // bg-surface-container/90
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)', // border-white/10
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            paddingBottom: 48,
            gap: 24,
            position: 'relative',
            zIndex: 10,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.5,
            shadowRadius: 32,
            elevation: 10,
          }}
        >
          {/* Drag Handle indicator */}
          <View 
            style={{
              width: 48,
              height: 6,
              backgroundColor: 'rgba(66, 71, 84, 0.5)', // bg-outline-variant/50
              borderRadius: 999,
              alignSelf: 'center',
            }}
          />

          {/* Amount Display */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setAmount('0')}
            className="items-center justify-center pt-4 w-full"
          >
            <Text 
              style={{ 
                fontFamily: 'Montserrat-Bold',
                color: '#adc6ff', // text-primary
              }}
              className="text-5xl font-bold tracking-tighter"
            >
              ₹{formatIndianCurrency(amount)}
            </Text>
            <Text 
              style={{ 
                fontFamily: 'Montserrat-Regular',
                color: 'rgba(194, 198, 214, 0.6)', // text-on-surface-variant (opacity 60%)
                fontSize: 10,
                marginTop: 4,
                letterSpacing: 1,
              }}
            >
              TAP TO CLEAR • ENTER AMOUNT
            </Text>
          </TouchableOpacity>

          {/* Source Toggle */}
          <View 
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            style={{
              flexDirection: 'row',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 9999,
              padding: 4,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
              position: 'relative',
            }}
          >
            {containerWidth > 0 && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 4,
                  bottom: 4,
                  left: 4,
                  width: (containerWidth - 8) / 2,
                  backgroundColor: 'rgba(173, 198, 255, 0.2)',
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: 'rgba(173, 198, 255, 0.3)',
                  transform: [
                    {
                      translateX: toggleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, (containerWidth - 8) / 2],
                      }),
                    },
                    {
                      scaleX: toggleAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.15, 1],
                      }),
                    },
                  ],
                }}
              />
            )}
            <TouchableOpacity
              onPress={() => setSource('cash')}
              activeOpacity={0.8}
              className="flex-1 py-2.5 rounded-full items-center justify-center z-10"
            >
              <Text 
                style={{ fontFamily: 'Montserrat-Bold' }}
                className={`font-label-caps text-label-caps uppercase font-bold ${
                  source === 'cash' ? 'text-primary' : 'text-on-surface-variant/50'
                }`}
              >
                Cash
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSource('upi')}
              activeOpacity={0.8}
              className="flex-1 py-2.5 rounded-full items-center justify-center z-10"
            >
              <Text 
                style={{ fontFamily: 'Montserrat-Bold' }}
                className={`font-label-caps text-label-caps uppercase font-bold ${
                  source === 'upi' ? 'text-primary' : 'text-on-surface-variant/50'
                }`}
              >
                UPI
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Grid (Horizontal Scrollable Row) */}
          <View style={{ height: 85 }}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingHorizontal: 4 }}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => setSelectedCategory(cat.name)}
                  style={{ alignItems: 'center', gap: 6, width: 68 }}
                >
                  <View 
                    style={{ 
                      backgroundColor: selectedCategory === cat.name ? cat.bgColor : 'rgba(255,255,255,0.03)',
                      borderColor: selectedCategory === cat.name ? cat.color : 'rgba(255,255,255,0.1)',
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      borderWidth: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcon 
                      name={cat.icon as any}
                      size={24}
                      color={selectedCategory === cat.name ? cat.color : cat.color + '80'}
                    />
                  </View>
                  <Text 
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ 
                      fontFamily: 'Montserrat-Bold',
                      color: selectedCategory === cat.name ? cat.color : '#c2c6d6',
                      fontSize: 10,
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Inputs Section */}
          <View style={{ gap: 12, width: '100%' }}>
            {/* Title Input */}
            <TextInput
              placeholder="Payment Title (optional)"
              placeholderTextColor="#8c909f"
              placeholderClassName="opacity-80"
              style={{ 
                fontFamily: 'Montserrat-Regular',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: '#FFFFFF',
                fontSize: 14,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.05)',
              }}
              onChangeText={setTitle}
              value={title}
            />

            {/* Note Input */}
            <TextInput
              placeholder="Add a note (optional)..."
              placeholderTextColor="#8c909f"
              placeholderClassName="opacity-80"
              style={{ 
                fontFamily: 'Montserrat-Regular',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: '#FFFFFF',
                fontSize: 14,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.05)',
              }}
              onChangeText={setNote}
              value={note}
            />
          </View>

          {/* Custom Numpad */}
          <View style={{ gap: 8 }}>
            <View className="flex-row justify-between w-full">
              {['1', '2', '3'].map(num => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleNumPress(num)}
                  className="flex-1 h-14 rounded-2xl items-center justify-center"
                >
                  <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-2xl font-semibold">{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row justify-between w-full">
              {['4', '5', '6'].map(num => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleNumPress(num)}
                  className="flex-1 h-14 rounded-2xl items-center justify-center"
                >
                  <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-2xl font-semibold">{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row justify-between w-full">
              {['7', '8', '9'].map(num => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleNumPress(num)}
                  className="flex-1 h-14 rounded-2xl items-center justify-center"
                >
                  <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-2xl font-semibold">{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row justify-between w-full">
              <TouchableOpacity
                onPress={() => handleNumPress('.')}
                className="flex-1 h-14 rounded-2xl items-center justify-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-2xl font-semibold">.</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleNumPress('0')}
                className="flex-1 h-14 rounded-2xl items-center justify-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-2xl font-semibold">0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBackspace}
                className="flex-1 h-14 rounded-2xl items-center justify-center"
              >
                <MaterialIcon name="backspace" size={22} color="#8c909f" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={amount === '0'}
            activeOpacity={0.85}
            style={{
              width: '100%',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: amount === '0' ? '#272a31' : '#4d8eff',
              borderWidth: amount === '0' ? 1 : 0,
              borderColor: 'rgba(255, 255, 255, 0.05)',
              shadowColor: amount === '0' ? 'transparent' : '#4d8eff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: amount === '0' ? 0 : 0.4,
              shadowRadius: 20,
              elevation: amount === '0' ? 0 : 8,
            }}
          >
            <Text 
              style={{ fontFamily: 'Montserrat-Bold' }} 
              className={`${
                amount === '0' ? 'text-on-surface-variant/40' : 'text-white'
              } font-title-md text-title-md font-bold`}
            >
              Save Payment
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
export default LogPaymentModal;
