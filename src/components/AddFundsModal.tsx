import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useMockStore } from '../store/mockStore';
import MaterialIcon from './MaterialIcon';

interface AddFundsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({ visible, onClose }) => {
  const { addFunds } = useMockStore();
  const [amount, setAmount] = useState('0');
  const [source, setSource] = useState<'cash' | 'upi'>('cash');
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
    if (amount.length <= 1) {
      setAmount('0');
    } else {
      setAmount(prev => prev.slice(0, -1));
    }
  };

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    addFunds(numericAmount, source);
    
    // Reset inputs
    setAmount('0');
    setSource('cash');
    onClose();
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
        <View className="w-full bg-surface-container/90 border-t border-white/10 rounded-t-[32px] p-6 pb-12 gap-6 relative z-10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
          {/* Drag Handle indicator */}
          <View className="w-12 h-1.5 bg-outline-variant/50 rounded-full mx-auto" />

          {/* Amount Display */}
          <View className="items-center justify-center pt-4">
            <Text 
              style={{ fontFamily: 'Montserrat-Bold' }}
              className="font-display-lg text-display-lg text-primary text-5xl font-bold tracking-tighter"
            >
              ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </Text>
            <Text 
              style={{ fontFamily: 'Montserrat-Regular' }}
              className="font-label-caps text-label-caps text-on-surface-variant mt-1"
            >
              ENTER AMOUNT TO ADD
            </Text>
          </View>

          {/* Source Toggle */}
          <View 
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            className="flex-row bg-white/5 rounded-full p-1 border border-white/5 relative"
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

          {/* Custom Numpad */}
          <View className="grid grid-cols-3 gap-y-2 gap-x-4">
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

          {/* Add Funds Button */}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            className="w-full py-4 rounded-xl bg-primary-container items-center justify-center shadow-[0_0_20px_rgba(77,142,255,0.4)]"
          >
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-on-primary-container font-title-md text-title-md font-bold">
              Add Funds
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddFundsModal;
