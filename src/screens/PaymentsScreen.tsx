import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';
import LinearGradient from 'react-native-linear-gradient';

export const PaymentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { transactions, categories } = useMockStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 5, 14)); // June 2026

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const filterMonthStr = months[selectedDate.getMonth()]; // e.g. "JUN"
  const displayMonthYear = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  // Filter: Matches month AND matches search text
  const filteredTxs = transactions.filter(t => {
    if (!t) return false;
    
    // Match month
    const parts = t.date.split(' ');
    const txMonth = parts[1]; // e.g. "JUN"
    if (txMonth !== filterMonthStr) return false;

    // Match search query (title, note, category)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesTitle = t.title.toLowerCase().includes(query);
      const matchesCategory = t.category.toLowerCase().includes(query);
      const matchesNote = t.note ? t.note.toLowerCase().includes(query) : false;
      if (!matchesTitle && !matchesCategory && !matchesNote) {
        return false;
      }
    }

    return true;
  });

  return (
    <GlobalLayout
      activeTab="payments"
      navigation={navigation}
      title="Payments"
    >
      <View className="flex-1 relative">
        <GlowOrb 
          size={350} 
          color="#3B82F6" 
          opacity={0.15} 
          style={{ position: 'absolute', top: -100, left: -100 }} 
          gradientId="payments-glow-top"
        />

        <View className="flex-1 px-6 pt-6">
          {/* Month Selector */}
          <View className="items-center mb-4">
            <View className="glass-panel rounded-full px-5 py-2.5 flex-row items-center gap-5 border border-white/10">
              <TouchableOpacity onPress={handlePrevMonth}>
                <MaterialIcon name="chevron_left" color="#c2c6d6" size={26} />
              </TouchableOpacity>
              
              <Text 
                allowFontScaling={false}
                style={{ 
                  fontFamily: 'Montserrat-Bold', 
                  fontWeight: '900',
                  fontSize: 16,
                  letterSpacing: 0.5 
                }} 
                className="text-white"
              >
                {displayMonthYear}
              </Text>
              
              <TouchableOpacity onPress={handleNextMonth}>
                <MaterialIcon name="chevron_right" color="#c2c6d6" size={26} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View className="mb-6">
            <View 
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }} 
              className="flex-row items-center px-4 py-2 border rounded-full"
            >
              <MaterialIcon name="search" color="rgba(255, 255, 255, 0.4)" size={20} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search payments, categories, notes..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                style={{
                  flex: 1,
                  color: 'white',
                  fontFamily: 'Montserrat-Regular',
                  fontSize: 14,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcon name="close" color="rgba(255, 255, 255, 0.6)" size={18} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Payments List */}
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 130 }}
          >
            {filteredTxs.length === 0 ? (
              <GlassCard className="p-8 items-center justify-center">
                <MaterialIcon name="payments" color="rgba(255, 255, 255, 0.2)" size={48} />
                <Text style={{ fontFamily: 'Montserrat-Bold', color: '#c2c6d6', marginTop: 12 }} className="font-bold text-center">
                  No transactions found
                </Text>
              </GlassCard>
            ) : (
              <GlassCard className="p-0">
                {filteredTxs.map((tx, idx) => (
                  <TouchableOpacity
                    key={tx.id}
                    onPress={() => navigation.navigate('TransactionDetail', { transactionId: tx.id })}
                    className={`flex-row items-center justify-between p-4 ${
                      idx !== filteredTxs.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <View className="flex-row items-center gap-3.5">
                      {(() => {
                        const catConfig = categories.find(c => c.name === tx.category) || { color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)', icon: 'category' };
                        return (
                          <View 
                            style={{ backgroundColor: catConfig.bgColor, borderColor: catConfig.color + '33' }}
                            className="w-11 h-11 rounded-full border items-center justify-center shadow-md"
                          >
                            <MaterialIcon name={catConfig.icon as any} size={20} color={catConfig.color} />
                          </View>
                        );
                      })()}
                      <View>
                        <Text className="text-[15px] text-white font-semibold">{tx.title}</Text>
                        <Text className="text-xs text-white font-bold mt-0.5">
                          {tx.date} • {tx.timestamp}
                        </Text>
                      </View>
                    </View>
                    <Text 
                      style={{ fontFamily: 'Montserrat-Bold' }} 
                      className={`text-base font-bold ${
                        tx.type === 'income' ? 'text-green-400' : tx.type === 'transfer' ? 'text-primary' : 'text-error'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '-'}₹{tx.amount.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </GlassCard>
            )}
          </ScrollView>
        </View>
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
    </GlobalLayout>
  );
};

export default PaymentsScreen;
