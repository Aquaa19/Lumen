import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useMockStore } from '../store/mockStore';
import { GlassCard } from '../components/GlassCard';
import GlobalLayout from '../components/GlobalLayout';
import MaterialIcon from '../components/MaterialIcon';
import LinearGradient from 'react-native-linear-gradient';
import { DEFAULT_CATEGORIES } from '../utils/constants';

export const TransactionDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { transactionId } = route.params;
  const { transactions, refundTransaction, categories } = useMockStore();

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



  return (
    <GlobalLayout
      activeTab="none"
      navigation={navigation}
      title="Transaction Detail"
      showBack={true}
    >

      <View className="flex-1 px-6 pt-8">
        <View>
          {/* Merchant card */}
          <GlassCard className="mb-6 overflow-hidden" contentClassName="items-center py-6 px-4">
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            {/* Icon Container */}
            {(() => {
              const catConfig = categories.find(c => c.name === tx.category) || { color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.1)', icon: 'category' };
              return (
                <View 
                  style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: 40, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    alignSelf: 'center',
                    backgroundColor: catConfig.bgColor,
                    borderColor: catConfig.color + '33'
                  }}
                  className="border mb-4 shadow-lg"
                >
                  <MaterialIcon name={catConfig.icon as any} size={36} color={catConfig.color} />
                </View>
              );
            })()}
            
            <Text 
              allowFontScaling={false}
              style={{ fontSize: 28, lineHeight: 34, fontFamily: 'Montserrat-Bold', color: '#e1e2ec' }}
              className="mb-1 text-center"
            >
              {tx.title}
            </Text>
            <Text 
              style={{ fontFamily: 'Montserrat-Bold' }} 
              className="font-body-sm text-body-sm text-on-surface-variant mb-6 text-center"
            >
              {tx.timestamp}, {tx.date}
            </Text>
            <Text 
              allowFontScaling={false}
              style={{ fontSize: 48, lineHeight: 56, fontFamily: 'Montserrat-Bold', color: '#ffb4ab', letterSpacing: -1 }}
              className="mb-6 text-center"
            >
              -₹{tx.amount.toFixed(2)}
            </Text>

            {/* Badges Container */}
            <View className="flex-row gap-3">
              <View className="bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 flex-row items-center gap-1">
                <MaterialIcon name="credit_card" color="#3B82F6" size={12} />
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="font-label-caps text-label-caps text-primary uppercase">
                  {tx.source}
                </Text>
              </View>
              <View className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 flex-row items-center gap-1">
                <MaterialIcon name="local_offer" color="#8c909f" size={12} />
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  {tx.category}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Details list */}
          <GlassCard className="mb-6 overflow-hidden" contentClassName="p-4">
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <Text 
              allowFontScaling={false}
              style={{ fontSize: 20, lineHeight: 28, fontFamily: 'Montserrat-Bold', color: 'white' }}
              className="mb-4"
            >
              Transaction Details
            </Text>
            <View className="gap-3">
              <View className="flex-row justify-between items-center py-2 border-b border-white/5">
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="font-body-sm text-body-sm text-on-surface-variant font-bold">Status</Text>
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="font-body-sm text-body-sm text-emerald-400 font-semibold">
                  ✓ Completed
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="font-body-sm text-body-sm text-on-surface-variant font-bold">Note</Text>
                <Text style={{ fontFamily: 'Montserrat-Regular' }} className="font-body-sm text-body-sm text-on-surface italic">
                  {tx.note || 'None'}
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-4">
          <TouchableOpacity
            onPress={handleRefund}
            activeOpacity={0.85}
            className="w-full py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-row items-center justify-center gap-2"
          >
            <MaterialIcon name="undo" color="#34d399" size={18} />
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-emerald-400 font-title-md text-title-md font-bold">
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
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-error font-title-md text-title-md font-bold">
              Delete Record
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GlobalLayout>
  );
};
export default TransactionDetailScreen;
