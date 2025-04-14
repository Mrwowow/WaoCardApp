import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  ActivityIndicator
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Components
import MerchantCard from '../components/MerchantCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import OfflineNotice from '../components/OfflineNotice';
import MerchantMarker from '../components/MerchantMarker';

// Hooks and services
import useNetworkStatus from '../hooks/useNetworkStatus';
import useLocation from '../hooks/useLocation';
import useCachedData from '../hooks/useCachedData';
import { fetchMerchants } from '../services/merchantService';

// Styles and utilities
import { futuristicMapStyle } from '../styles/mapStyles';
import { colors, borderRadius } from '../styles/theme';
import { STORAGE_KEYS } from '../utils/storageUtils';

const { height } = Dimensions.get('window');

/**
 * Main map screen showing merchants
 */
const MapScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);
  
  // Get initial location from route params or use default
  const initialRegion = route.params?.initialLocation || {
    latitude: 9.0820,  // Default to Nigeria (center of target markets)
    longitude: 8.6753,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  
  // State management
  const [region, setRegion] = useState(initialRegion);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mapReady, setMapReady] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  // Custom hooks
  const { isConnected } = useNetworkStatus();
  const { location, refreshLocation } = useLocation();
  const { 
    data: merchants,
    isLoading,
    error,
    isFromCache,
    refreshData
  } = useCachedData(
    STORAGE_KEYS.MERCHANTS,
    () => fetchMerchants(region),
    { refreshInterval: 300000 } // 5 minutes
  );

  // Filter merchants based on search and category
  const filteredMerchants = merchants
    ? merchants.filter(merchant => {
        const matchesSearch = merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              merchant.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || merchant.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  // Update map when location changes
  useEffect(() => {
    if (location && !selectedMerchant && mapRef.current) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [location, selectedMerchant]);

  // Handle merchant selection
  const handleSelectMerchant = (merchant) => {
    setSelectedMerchant(merchant);
    
    // Animate card slide up
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Center the map on the selected merchant
    mapRef.current.animateToRegion({
      latitude: merchant.coordinate.latitude,
      longitude: merchant.coordinate.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  };

  // Handle closing merchant detail
  const handleCloseMerchantDetail = () => {
    // Animate card slide down
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedMerchant(null);
    });
  };

  // Navigate to merchant detail screen
  const navigateToMerchantDetail = () => {
    if (selectedMerchant) {
      navigation.navigate('MerchantDetail', { merchant: selectedMerchant });
    }
  };

  // Navigate to settings screen
  const navigateToSettings = () => {
    navigation.navigate('MapSettings');
  };

  // Go to current location
  const goToCurrentLocation = async () => {
    const result = await refreshLocation();
    if (result.location && mapRef.current) {
      mapRef.current.animateToRegion({
        ...result.location,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        customMapStyle={futuristicMapStyle}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={false}
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={setRegion}
      >
        {/* Merchant Markers */}
        {!isLoading && filteredMerchants.map((merchant) => (
          <Marker
            key={merchant.id}
            coordinate={merchant.coordinate}
            title={merchant.name}
            description={merchant.address}
            onPress={() => handleSelectMerchant(merchant)}
          >
            <MerchantMarker 
              category={merchant.category}
              acceptsWaoCard={merchant.acceptsWaoCard}
              isSelected={selectedMerchant?.id === merchant.id}
            />
          </Marker>
        ))}
      </MapView>

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          placeholder="Search for merchants..." 
        />
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={navigateToSettings}
        >
          <Ionicons name="settings-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
      </View>

      {/* Current Location Button */}
      <TouchableOpacity 
        style={styles.locationButton}
        onPress={goToCurrentLocation}
      >
        <Ionicons name="locate" size={24} color={colors.primary} />
      </TouchableOpacity>

      {/* Refresh Button */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={() => refreshData()}
        disabled={isLoading || !isConnected}
      >
        <Ionicons 
          name="refresh" 
          size={24} 
          color={(!isConnected || isLoading) ? colors.textTertiary : colors.primary} 
        />
      </TouchableOpacity>

      {/* Offline Notice */}
      {!isConnected && <OfflineNotice />}

      {/* Merchant Detail Card */}
      {selectedMerchant && (
        <Animated.View 
          style={[
            styles.merchantDetailContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.pullBar} />
          <MerchantCard 
            merchant={selectedMerchant} 
            onClose={handleCloseMerchantDetail}
            onViewDetails={navigateToMerchantDetail}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  settingsButton: {
    marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  categoryContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  locationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  merchantDetailContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderBottomWidth: 0,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  pullBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default MapScreen;