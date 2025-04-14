import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius } from '../styles/theme';

/**
 * Component to display offline status notification
 * @returns {JSX.Element}
 */
const OfflineNotice = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={20} color="#FFF" />
      <Text style={styles.text}>You are offline. Map data may be limited.</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('OfflineMap')}
      >
        <Text style={styles.buttonText}>View Offline Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: borderRadius.medium,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    zIndex: 10,
  },
  text: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  button: {
    backgroundColor: colors.primaryTransparent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  buttonText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
});

export default OfflineNotice;