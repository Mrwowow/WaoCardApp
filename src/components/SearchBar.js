import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, borderRadius } from '../styles/theme';

/**
 * Search input component
 * @param {Object} props - Component props
 * @param {string} props.value - Input value
 * @param {Function} props.onChangeText - Text change handler
 * @param {string} props.placeholder - Input placeholder
 * @returns {JSX.Element}
 */
const SearchBar = ({ value, onChangeText, placeholder }) => {
  return (
    <View style={styles.container}>
      <Ionicons 
        name="search" 
        size={18} 
        color="rgba(255, 255, 255, 0.5)" 
        style={styles.icon} 
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={value}
        onChangeText={onChangeText}
      />
      {value ? (
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={() => onChangeText('')}
        >
          <Ionicons 
            name="close-circle" 
            size={18} 
            color="rgba(255, 255, 255, 0.5)" 
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.round,
    paddingHorizontal: 15,
    height: 44,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  clearButton: {
    marginLeft: 10,
  },
});

export default SearchBar;