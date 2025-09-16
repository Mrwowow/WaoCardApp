// src/components/bills/BillCategorySelector.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../../styles/theme';

const BillCategorySelector = ({ categories, selectedCategory, onSelectCategory }) => {
  // Default categories if API fails
  const defaultCategories = [
    { id: '1', name: 'TV Subscription', icon: 'tv', color: '#FF9500' },
    { id: '2', name: 'Electricity', icon: 'flash', color: '#FF2D55' },
    { id: '3', name: 'Internet', icon: 'wifi', color: '#5AC8FA' },
    { id: '4', name: 'Water', icon: 'water', color: '#007AFF' },
    { id: '5', name: 'Education', icon: 'school', color: '#4CD964' },
  ];
  
  // If no categories are passed, use default ones
  const categoriesToRender = categories?.length > 0 ? categories : defaultCategories;
  
  if (categoriesToRender.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {categoriesToRender.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            selectedCategory?.id === category.id && styles.selectedCategoryItem
          ]}
          onPress={() => onSelectCategory(category)}
        >
          <View style={[styles.iconContainer, { backgroundColor: category.color ? `${category.color}33` : 'rgba(255, 149, 0, 0.2)' }]}>
            <Ionicons 
              name={category.icon || 'receipt'} 
              size={24} 
              color={category.color || colors.primary} 
            />
          </View>
          <Text style={styles.categoryName}>{category.name}</Text>
          
          {selectedCategory?.id === category.id && (
            <View style={styles.selectedIndicator} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: spacing.m,
  },
  categoryItem: {
    width: 110,
    height: 110,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.medium,
    marginRight: spacing.m,
    padding: spacing.m,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectedCategoryItem: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  categoryName: {
    color: colors.white,
    fontSize: fonts.sizes.small,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '40%',
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  loadingContainer: {
    padding: spacing.m,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.small,
    marginTop: spacing.s,
  },
});

export default BillCategorySelector;