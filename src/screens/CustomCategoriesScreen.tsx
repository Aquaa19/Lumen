import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useMockStore } from '../store/mockStore';
import BackgroundLayout from '../components/BackgroundLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';
import { GlassCard } from '../components/GlassCard';
import { DEFAULT_CATEGORIES } from '../utils/constants';

export const CustomCategoriesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { categoryLimits, pinnedCategories, updateCategoryLimit, togglePinCategory } = useMockStore();

  const handleLimitChange = (catName: string, text: string) => {
    const numericValue = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
    updateCategoryLimit(catName, numericValue);
  };

  return (
    <BackgroundLayout>
      <GlowOrb size={300} color="#3B82F6" opacity={0.15} style={{ top: '10%', left: '-10%' }} gradientId="cat-glow-top" />
      <GlowOrb size={320} color="#df7412" opacity={0.08} style={{ bottom: '10%', right: '-10%' }} gradientId="cat-glow-bottom" />

      <View className="flex-1 py-12 z-10 w-full">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10"
          >
            <MaterialIcon name="arrow_back" color="#ffffff" size={20} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat-Bold', color: '#FFFFFF' }} className="text-white text-title-md font-bold flex-1 text-center pr-10">
            Categories & Limits
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-on-surface-variant text-sm mb-6 leading-5">
            Configure custom monthly spending limits for each category and toggle the pin icon to show them on your dashboard.
          </Text>

          <View className="gap-4">
            {DEFAULT_CATEGORIES.map(cat => {
              const currentLimit = categoryLimits[cat.name] ?? 0;
              const isPinned = pinnedCategories.includes(cat.name);

              return (
                <GlassCard key={cat.name} contentClassName="flex-row items-center justify-between p-4 gap-3">
                  {/* Left block: Icon and Name */}
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      style={{ backgroundColor: cat.bgColor, borderColor: 'rgba(255, 255, 255, 0.08)' }}
                      className="w-11 h-11 rounded-2xl border items-center justify-center"
                    >
                      <MaterialIcon name={cat.icon} color={cat.color} size={20} />
                    </View>
                    <Text
                      style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' }}
                    >
                      {cat.name}
                    </Text>
                  </View>

                  {/* Right block: Limit Input and Pin Toggle */}
                  <View className="flex-row items-center gap-3">
                    {/* Limit Input */}
                    <View className="flex-row items-center bg-white/[0.04] border border-white/10 rounded-xl px-3 h-11 w-28">
                      <Text style={{ fontFamily: 'Montserrat-Bold', color: 'rgba(255, 255, 255, 0.4)' }} className="text-sm mr-1">₹</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={currentLimit === 0 ? '' : currentLimit.toString()}
                        onChangeText={(t) => handleLimitChange(cat.name, t)}
                        placeholder="0"
                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        className="text-white font-bold p-0 flex-1 text-right text-sm"
                        style={{ fontFamily: 'Montserrat-Bold' }}
                      />
                    </View>

                    {/* Pin button */}
                    <TouchableOpacity
                      onPress={() => togglePinCategory(cat.name)}
                      activeOpacity={0.7}
                      style={{ backgroundColor: isPinned ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)', borderColor: isPinned ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.08)' }}
                      className="w-11 h-11 rounded-xl border items-center justify-center"
                    >
                      <MaterialIcon
                        name={isPinned ? 'push_pin' : 'push_pin'}
                        color={isPinned ? '#3B82F6' : 'rgba(255, 255, 255, 0.4)'}
                        size={18}
                      />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </BackgroundLayout>
  );
};

export default CustomCategoriesScreen;
