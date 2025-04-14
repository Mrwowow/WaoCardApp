import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, borderRadius } from '../styles/theme';
import { getCategories } from '../utils/categoryUtils';

/**
 * Horizontal category selector component
 * @param {Object} props - Component props
 * @param {string} props.selectedCategory - Currently selected category
 * @param {Function} props.onSelectCategory - Category selection handler
 * @returns {JSX.Element}
 */
const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  // Get categories from utility function
  const categories = getCategories();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.selectedCategoryButton
          ]}
          onPress={() => onSelectCategory(category.id)}
        >
          <Ionicons 
            name={category.icon} 
            size={18} 
            color={selectedCategory === category.id ? '#FFF' : colors.primary} 
          />
          <Text 
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginLeft: 5,
  },
  selectedCategoryText: {
    color: colors.light,
  },
});

export default CategoryFilter;