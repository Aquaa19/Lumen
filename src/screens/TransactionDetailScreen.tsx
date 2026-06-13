import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import MaterialIcon from '../components/MaterialIcon';

export const TransactionDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { transactionId } = route.params;
  const { transactions, refundTransaction } = useMockStore();

  const tx = transactions.find(t => t.id === transactionId);

  if (!tx) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-white text-base">Transaction not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-primary underline">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleRefund = () => {
    refundTransaction(tx.id);
    Alert.alert('Refund Processed', '₹' + tx.amount.toFixed(2) + ' has been credited back to your balance.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const getCategoryIcon = (category: string): 'restaurant' | 'directions_car' | 'menu_book' | 'local_mall' | 'movie' | 'category' => {
    switch (category) {
      case 'Food': return 'restaurant';
      case 'Travel': return 'directions_car';
      case 'Stationery': return 'menu_book';
      case 'Shopping': return 'local_mall';
      case 'Entertainment': return 'movie';
      default: return 'category';
    }
  };

  return (
    <GlobalLayout
      activeTab="none"
      navigation={navigation}
      title="Transaction Detail"
      showBack={true}
    >

      <View className="flex-1 px-6 pt-8 max-w-md mx-auto justify-between pb-12">
        <View>
          {/* Merchant card */}
          <GlassCard className="items-center py-6 relative overflow-hidden mb-6">
            <View className="w-20 h-20 rounded-full bg-surface-container-high border border-white/10 items-center justify-center mb-4 shadow-lg">
              <MaterialIcon name={getCategoryIcon(tx.category)} size={36} color="#3B82F6" />
            </View>
            <Text 
              allowFontScaling={false}
              style={{ fontSize: 28, lineHeight: 34, fontWeight: 'bold', fontFamily: 'sans-serif-medium', color: '#e1e2ec' }}
              className="mb-1"
            >
              {tx.title}
            </Text>
            <Text className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              {tx.timestamp}, {tx.date}
            </Text>
            <Text 
              allowFontScaling={false}
              style={{ fontSize: 48, lineHeight: 56, fontWeight: 'bold', fontFamily: 'sans-serif-medium', color: '#ffb4ab', letterSpacing: -1 }}
              className="mb-6"
            >
              -₹{tx.amount.toFixed(2)}
            </Text>

            {/* Badges */}
            <View className="flex-row gap-3">
              <View className="bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 flex-row items-center gap-1">
                <MaterialIcon name="credit_card" color="#3B82F6" size={12} />
                <Text className="font-label-caps text-label-caps text-primary uppercase">
                  {tx.source}
                </Text>
              </View>
              <View className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 flex-row items-center gap-1">
                <MaterialIcon name="local_offer" color="#8c909f" size={12} />
                <Text className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  {tx.category}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Details list */}
          <GlassCard className="p-4">
            <Text 
              allowFontScaling={false}
              style={{ fontSize: 20, lineHeight: 28, fontWeight: 'semibold', fontFamily: 'sans-serif-medium', color: 'white' }}
              className="mb-4"
            >
              Transaction Details
            </Text>
            <View className="gap-3">
              <View className="flex-row justify-between items-center py-2 border-b border-white/5">
                <Text className="font-body-sm text-body-sm text-on-surface-variant">Transaction ID</Text>
                <Text className="font-body-sm text-body-sm text-on-surface font-mono">
                  TXN-{tx.id.toUpperCase()}8472
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2 border-b border-white/5">
                <Text className="font-body-sm text-body-sm text-on-surface-variant">Status</Text>
                <Text className="font-body-sm text-body-sm text-emerald-400 font-semibold">
                  ✓ Completed
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="font-body-sm text-body-sm text-on-surface-variant">Note</Text>
                <Text className="font-body-sm text-body-sm text-on-surface italic">
                  {tx.note || 'None'}
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <TouchableOpacity
            onPress={handleRefund}
            activeOpacity={0.85}
            className="w-full py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-row items-center justify-center gap-2"
          >
            <MaterialIcon name="sync" color="#34d399" size={18} />
            <Text className="text-emerald-400 font-title-md text-title-md font-bold">
              Mark as Refunded
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              refundTransaction(tx.id);
              navigation.goBack();
            }}
            activeOpacity={0.85}
            className="w-full py-4 rounded-xl border border-error/30 items-center justify-center"
          >
            <Text className="text-error font-title-md text-title-md font-bold">
              Delete Record
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GlobalLayout>
  );
};
export default TransactionDetailScreen;
