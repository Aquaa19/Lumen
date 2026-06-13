import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useMockStore } from '../store/mockStore';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import MaterialIcon from './MaterialIcon';

interface LogPaymentModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LogPaymentModal: React.FC<LogPaymentModalProps> = ({ visible, onClose }) => {
  const { addTransaction } = useMockStore();
  const [amount, setAmount] = useState('0');
  const [source, setSource] = useState<'cash' | 'upi'>('cash');
  const [selectedCategory, setSelectedCategory] = useState('Others');

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

    // Use selected category as default title
    addTransaction(selectedCategory, numericAmount, source, selectedCategory);
    
    // Reset inputs
    setAmount('0');
    setSource('cash');
    setSelectedCategory('Others');
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
        {Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={25}
            reducedTransparencyFallbackColor="rgba(16, 19, 26, 0.8)"
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(10, 12, 16, 0.75)',
              }
            ]}
          />
        )}
        
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
            <Text className="font-display-lg text-display-lg text-primary text-5xl font-bold tracking-tighter">
              ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </Text>
            <Text className="font-label-caps text-label-caps text-on-surface-variant mt-1">
              ENTER AMOUNT
            </Text>
          </View>

          {/* Source Toggle */}
          <View className="flex-row bg-white/5 rounded-full p-1 border border-white/5">
            <TouchableOpacity
              onPress={() => setSource('cash')}
              className={`flex-1 py-2 rounded-full items-center ${
                source === 'cash' ? 'bg-primary/20 shadow-[0_0_10px_rgba(77,142,255,0.3)]' : ''
              }`}
            >
              <Text className={`font-label-caps text-label-caps uppercase ${
                source === 'cash' ? 'text-primary' : 'text-on-surface-variant/50'
              }`}>
                Cash
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSource('upi')}
              className={`flex-1 py-2 rounded-full items-center ${
                source === 'upi' ? 'bg-primary/20 shadow-[0_0_10px_rgba(77,142,255,0.3)]' : ''
              }`}
            >
              <Text className={`font-label-caps text-label-caps uppercase ${
                source === 'upi' ? 'text-primary' : 'text-on-surface-variant/50'
              }`}>
                UPI
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Grid */}
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {DEFAULT_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.name}
                onPress={() => setSelectedCategory(cat.name)}
                className="w-[30%] items-center gap-1"
              >
                <View 
                  style={{ backgroundColor: selectedCategory === cat.name ? 'rgba(77,142,255,0.2)' : 'rgba(255,255,255,0.03)' }}
                  className={`w-14 h-14 rounded-full border items-center justify-center ${
                    selectedCategory === cat.name ? 'border-primary' : 'border-white/10'
                  }`}
                >
                  <MaterialIcon 
                    name={
                      cat.name === 'Food' ? 'restaurant' :
                      cat.name === 'Travel' ? 'directions_car' :
                      cat.name === 'Stationery' ? 'menu_book' :
                      cat.name === 'Shopping' ? 'local_mall' :
                      cat.name === 'Entertainment' ? 'movie' :
                      'category'
                    }
                    size={24}
                    color={selectedCategory === cat.name ? '#3B82F6' : '#e1e2ec'}
                  />
                </View>
                <Text className={`font-label-caps text-[10px] ${
                  selectedCategory === cat.name ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
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
                  <Text className="text-white text-2xl font-semibold">{num}</Text>
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
                  <Text className="text-white text-2xl font-semibold">{num}</Text>
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
                  <Text className="text-white text-2xl font-semibold">{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row justify-between w-full">
              <TouchableOpacity
                onPress={() => handleNumPress('.')}
                className="flex-1 h-14 rounded-2xl items-center justify-center"
              >
                <Text className="text-white text-2xl font-semibold">.</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleNumPress('0')}
                className="flex-1 h-14 rounded-2xl items-center justify-center"
              >
                <Text className="text-white text-2xl font-semibold">0</Text>
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
            activeOpacity={0.85}
            className="w-full py-4 rounded-xl bg-primary-container items-center justify-center shadow-[0_0_20px_rgba(77,142,255,0.4)]"
          >
            <Text className="text-on-primary-container font-title-md text-title-md font-bold">
              Save Payment
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
export default LogPaymentModal;
