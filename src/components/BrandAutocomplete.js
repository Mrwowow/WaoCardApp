import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchBrands, fetchBrandData, getBrandColors } from '../services/brandFetchService';

const { width } = Dimensions.get('window');

const BrandAutocomplete = ({ 
  value, 
  onChangeText, 
  onBrandSelected, 
  placeholder = 'Enter brand name',
  style,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState(value || '');
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const handleTextChange = (text) => {
    setQuery(text);
    onChangeText(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If text is too short, hide suggestions
    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      await searchForBrands(text);
    }, 300);
  };

  const searchForBrands = async (searchText) => {
    if (searchText.length < 2) return;

    setIsLoading(true);
    try {
      const results = await searchBrands(searchText);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error searching brands:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandSelect = async (brand) => {
    setQuery(brand.name);
    onChangeText(brand.name);
    setShowSuggestions(false);

    // Fetch detailed brand data
    try {
      const brandData = await fetchBrandData(brand.domain);
      if (brandData && onBrandSelected) {
        const colors = getBrandColors(brandData);
        onBrandSelected({
          ...brand,
          ...brandData,
          ...colors,
        });
      } else {
        // Still call onBrandSelected with basic brand info if detailed fetch fails
        if (onBrandSelected) {
          onBrandSelected({
            ...brand,
            backgroundColor: '#1e3c72', // default background
            textColor: '#ffffff', // default text color
          });
        }
      }
    } catch (error) {
      console.error('Error fetching brand data:', error);
      // Still call onBrandSelected with basic brand info
      if (onBrandSelected) {
        onBrandSelected({
          ...brand,
          backgroundColor: '#1e3c72', // default background
          textColor: '#ffffff', // default text color
        });
      }
    }
  };

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleBrandSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionContent}>
        <View style={styles.logoContainer}>
          {item.icon ? (
            <Image
              source={{ uri: item.icon }}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderLogo}>
              <Ionicons name="business-outline" size={20} color="#666" />
            </View>
          )}
        </View>
        <View style={styles.brandInfo}>
          <Text style={styles.brandName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.domain && (
            <Text style={styles.brandDomain} numberOfLines={1}>
              {item.domain}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.5)"
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FF9500" />
          </View>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item, index) => item.id || item.name || `brand-${index}`}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            maxHeight={200}
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFF',
  },
  loadingContainer: {
    paddingHorizontal: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1001,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 32,
    height: 32,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  placeholderLogo: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  brandDomain: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default BrandAutocomplete;