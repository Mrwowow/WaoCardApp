// src/components/auth/FormInputWithCustomIcon.js
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/theme';

const FormInputWithCustomIcon = ({ 
  icon, 
  customIcon,
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry,
  toggleSecureEntry,
  keyboardType,
  autoCapitalize = "none",
  ...props 
}) => {
  const renderIcon = () => {
    if (customIcon) {
      return customIcon;
    }
    if (icon) {
      return <Ionicons name={icon} size={22} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />;
    }
    return null;
  };

  return (
    <View style={styles.inputContainer}>
      {renderIcon()}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        {...props}
      />
      {toggleSecureEntry && (
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={toggleSecureEntry}
        >
          <Ionicons 
            name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
            size={22} 
            color="rgba(255,255,255,0.6)" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 60,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 10,
  },
});

export default FormInputWithCustomIcon;