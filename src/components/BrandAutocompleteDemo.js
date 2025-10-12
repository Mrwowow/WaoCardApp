import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BrandAutocomplete from './BrandAutocomplete';

/**
 * Demo component to test BrandAutocomplete functionality
 * This can be used for testing and development
 */
const BrandAutocompleteDemo = () => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brandData, setBrandData] = useState(null);

  const handleBrandSelected = (brand) => {
    console.log('Demo: Brand selected:', brand);
    setBrandData(brand);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Brand Autocomplete Demo</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Enter Brand Name:</Text>
        <BrandAutocomplete
          value={selectedBrand}
          onChangeText={setSelectedBrand}
          onBrandSelected={handleBrandSelected}
          placeholder="Type a brand name (e.g., Apple, Google, Nike)"
        />
      </View>

      {brandData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Selected Brand Data:</Text>
          <Text style={styles.resultText}>Name: {brandData.name}</Text>
          <Text style={styles.resultText}>Domain: {brandData.domain}</Text>
          {brandData.logo && (
            <Text style={styles.resultText}>Logo: {brandData.logo}</Text>
          )}
          {brandData.backgroundColor && (
            <Text style={styles.resultText}>Background: {brandData.backgroundColor}</Text>
          )}
          {brandData.textColor && (
            <Text style={styles.resultText}>Text Color: {brandData.textColor}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  resultContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
});

export default BrandAutocompleteDemo;