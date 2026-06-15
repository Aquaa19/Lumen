import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useMockStore } from '../store/mockStore';
import BackgroundLayout from '../components/BackgroundLayout';
import GlowOrb from '../components/GlowOrb';
import MaterialIcon from '../components/MaterialIcon';
import { GlassCard } from '../components/GlassCard';
import { Category } from '../types';

export const CustomCategoriesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { 
    categoryLimits, 
    pinnedCategories, 
    categories, 
    updateCategoryLimit, 
    togglePinCategory,
    addCustomCategory,
    editCategory,
    deleteCategory
  } = useMockStore();

  // Local limits state to decouple active typing from global Firestore sync
  const [localLimits, setLocalLimits] = useState(() => categoryLimits);

  useEffect(() => {
    setLocalLimits(categoryLimits);
  }, [categoryLimits]);

  // Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [oldCategoryName, setOldCategoryName] = useState('');
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('category');
  const [selectedColor, setSelectedColor] = useState('#94a3b8');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ICONS = ['restaurant', 'directions_car', 'menu_book', 'local_mall', 'movie', 'category', 'wallet', 'home'];
  const COLORS = [
    { value: '#ffb786', name: 'Peach' },
    { value: '#22d3ee', name: 'Cyan' },
    { value: '#fb1324', name: 'Red' },
    { value: '#adc6ff', name: 'Blue-grey' },
    { value: '#c084fc', name: 'Purple' },
    { value: '#3B82F6', name: 'Blue' },
    { value: '#4ade80', name: 'Green' },
    { value: '#94a3b8', name: 'Grey' }
  ];

  const handleLimitChange = (catName: string, text: string) => {
    const numericValue = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
    setLocalLimits(prev => ({
      ...prev,
      [catName]: numericValue
    }));
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCategoryNameInput('');
    setSelectedIcon('category');
    setSelectedColor('#94a3b8');
    setErrorMessage(null);
    setIsModalVisible(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setModalMode('edit');
    setOldCategoryName(cat.name);
    setCategoryNameInput(cat.name);
    setSelectedIcon(cat.icon);
    setSelectedColor(cat.color);
    setErrorMessage(null);
    setIsModalVisible(true);
  };

  const handleSaveCategory = () => {
    const trimmedName = categoryNameInput.trim();
    if (!trimmedName) {
      setErrorMessage('Name cannot be empty');
      return;
    }

    // Don't allow special character renames
    if (trimmedName.toLowerCase() === 'others' && oldCategoryName.toLowerCase() !== 'others') {
      setErrorMessage('Cannot rename to reserved name "Others"');
      return;
    }

    if (modalMode === 'create') {
      const exists = categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase());
      if (exists) {
        setErrorMessage('Category name already exists');
        return;
      }
      addCustomCategory(trimmedName, selectedIcon, selectedColor);
    } else {
      const exists = categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.name !== oldCategoryName);
      if (exists) {
        setErrorMessage('Category name already exists');
        return;
      }
      editCategory(oldCategoryName, trimmedName, selectedIcon, selectedColor);
    }
    setIsModalVisible(false);
  };

  const handleDeleteCategory = () => {
    deleteCategory(oldCategoryName);
    setIsModalVisible(false);
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
          {/* Increased Font Size from text-sm (14) to 16 with Montserrat font */}
          <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 16, lineHeight: 24 }} className="text-on-surface-variant mb-6">
            Configure custom monthly spending limits for each category and toggle the pin icon to show them on your dashboard.
          </Text>

          {/* Add Category Trigger Button */}
          <TouchableOpacity
            onPress={handleOpenCreateModal}
            activeOpacity={0.8}
            className="w-full h-12 bg-primary/10 border border-primary/20 rounded-xl items-center justify-center flex-row gap-2 mb-6"
          >
            <MaterialIcon name="add" color="#3B82F6" size={18} />
            <Text style={{ fontFamily: 'Montserrat-Bold', color: '#3B82F6' }} className="text-sm font-bold uppercase tracking-wider">
              Add Custom Category
            </Text>
          </TouchableOpacity>

          <View className="gap-4">
            {categories.map(cat => {
              const currentLimit = localLimits[cat.name] ?? 0;
              const isPinned = pinnedCategories.includes(cat.name);

              return (
                <GlassCard key={cat.name} contentClassName="flex-row items-center justify-between p-4 gap-3">
                  {/* Left block: Icon, Edit Button, and Name */}
                  <View className="flex-row items-center gap-2.5 flex-1">
                    <TouchableOpacity
                      onPress={() => handleOpenEditModal(cat)}
                      activeOpacity={0.8}
                      style={{ backgroundColor: cat.bgColor, borderColor: 'rgba(255, 255, 255, 0.08)' }}
                      className="w-11 h-11 rounded-2xl border items-center justify-center"
                    >
                      <MaterialIcon name={cat.icon as any} color={cat.color} size={20} />
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-1.5 flex-1">
                      <Text
                        numberOfLines={1}
                        style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#FFFFFF' }}
                        className="flex-shrink"
                      >
                        {cat.name}
                      </Text>
                      {/* Pencil Edit button next to name */}
                      <TouchableOpacity
                        onPress={() => handleOpenEditModal(cat)}
                        className="p-1 opacity-60 hover:opacity-100"
                      >
                        <MaterialIcon name="settings" color="#8c909f" size={14} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Right block: Limit Input and Pin Toggle */}
                  <View className="flex-row items-center gap-3">
                    {/* Limit Input */}
                    <View className="flex-row items-center bg-white/[0.04] border border-white/10 rounded-xl px-3 h-11 w-28">
                      <Text style={{ fontFamily: 'Montserrat-Bold', color: 'rgba(255, 255, 255, 0.4)', fontSize: 14 }} className="mr-1">₹</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={currentLimit === 0 ? '' : currentLimit.toString()}
                        onChangeText={(t) => handleLimitChange(cat.name, t)}
                        onBlur={() => updateCategoryLimit(cat.name, currentLimit)}
                        placeholder="0"
                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        style={{
                          fontFamily: 'Montserrat-Bold',
                          color: '#FFFFFF',
                          padding: 0,
                          flex: 1,
                          textAlign: 'right',
                          fontSize: 14,
                        }}
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
                        name="pin"
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

      {/* Create / Edit Category Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center px-6">
          {/* Modal Backdrop Blur */}
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={15}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.5)"
          />
          
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsModalVisible(false)} />

          <GlassCard className="w-full border border-white/10 relative z-10" contentClassName="p-6 gap-5">
            <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white text-xl text-center">
              {modalMode === 'create' ? 'Create Custom Category' : 'Edit Category'}
            </Text>

            {/* Name Input */}
            <View>
              <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">Category Name</Text>
              <TextInput
                placeholder="Category Name"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={categoryNameInput}
                onChangeText={setCategoryNameInput}
                style={{
                  fontFamily: 'Montserrat-Bold',
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: 'white',
                  fontSize: 14,
                }}
              />
              {errorMessage && (
                <Text style={{ fontFamily: 'Montserrat-Regular' }} className="text-red-400 text-xs mt-1.5 font-semibold uppercase">{errorMessage}</Text>
              )}
            </View>

            {/* Icon Picker */}
            <View>
              <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">Select Icon</Text>
              <View className="flex-row flex-wrap gap-2.5 justify-between">
                {ICONS.map(ico => (
                  <TouchableOpacity
                    key={ico}
                    onPress={() => setSelectedIcon(ico)}
                    style={{
                      backgroundColor: selectedIcon === ico ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      borderColor: selectedIcon === ico ? '#3B82F6' : 'rgba(255, 255, 255, 0.08)'
                    }}
                    className="w-10 h-10 border rounded-xl items-center justify-center"
                  >
                    <MaterialIcon name={ico as any} color={selectedIcon === ico ? '#3B82F6' : 'rgba(255, 255, 255, 0.5)'} size={20} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Picker */}
            <View>
              <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">Select Color</Text>
              <View className="flex-row flex-wrap gap-3 justify-between">
                {COLORS.map(col => (
                  <TouchableOpacity
                    key={col.value}
                    onPress={() => setSelectedColor(col.value)}
                    style={{
                      backgroundColor: col.value,
                      borderColor: selectedColor === col.value ? '#ffffff' : 'transparent',
                      borderWidth: selectedColor === col.value ? 2 : 0
                    }}
                    className="w-8 h-8 rounded-full shadow-md"
                  />
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl items-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-white font-bold text-sm uppercase">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSaveCategory}
                className="flex-1 py-3 bg-primary rounded-xl items-center"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-on-primary font-bold text-sm uppercase">Save</Text>
              </TouchableOpacity>
            </View>

            {/* Delete button (only for custom categories in edit mode) */}
            {modalMode === 'edit' && categories.find(c => c.name === oldCategoryName)?.isCustom && (
              <TouchableOpacity
                onPress={handleDeleteCategory}
                className="py-3 bg-error/10 border border-error/20 rounded-xl items-center mt-1"
              >
                <Text style={{ fontFamily: 'Montserrat-Bold' }} className="text-error font-bold text-sm uppercase">Delete Category</Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        </View>
      </Modal>
    </BackgroundLayout>
  );
};

export default CustomCategoriesScreen;
