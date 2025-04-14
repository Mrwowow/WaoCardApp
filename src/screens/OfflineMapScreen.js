import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  FlatList,
  Image,
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Hooks and services
import { fetchCachedMerchants } from '../services/merchantService';

// Styles and utilities
import { colors, fonts, borderRadius } from '../styles/theme';
import { getCategoryIcon, getCategoryName, getCategories } from '../utils/categoryUtils';

/**
 * Offline map screen showing cached merchant data as a list
 */
const OfflineMapScreen = () => {
  const navigation = useNavigation();
  const [cachedMerchants, setCachedMerchants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Load cached merchant data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  // Function to load cached merchant data
  const loadCachedData = async () => {
    setIsLoading(true);
    try {
      const merchants = await fetchCachedMerchants();
      setCachedMerchants(merchants);
    } catch (error) {
      console.error('Error loading cached data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter merchants based on selected category
  const filteredMerchants = filter === 'all' 
    ? cachedMerchants 
    : cachedMerchants.filter(merchant => merchant.category === filter);

  // Navigate to merchant detail screen
  const navigateToMerchantDetail = (merchant) => {
    navigation.navigate('MerchantDetail', { merchant });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Offline Map</Text>
        <Text style={styles.subtitle}>Viewing cached merchant data</Text>
      </View>
      
      {/* Category filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {getCategories().map(category => (
          <TouchableOpacity 
            key={category.id} 
            style={[
              styles.filterButton,
              filter === category.id && styles.activeFilterButton
            ]}
            onPress={() => setFilter(category.id)}
          >
            <Ionicons 
              name={category.icon} 
              size={16} 
              color={filter === category.id ? '#FFF' : colors.primary} 
            />
            <Text 
              style={[
                styles.filterText,
                filter === category.id && styles.activeFilterText
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading cached data...</Text>
        </View>
      ) : cachedMerchants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-offline-outline" size={50} color="rgba(255, 255, 255, 0.5)" />
          <Text style={styles.emptyText}>No cached merchants available</Text>
          <Text style={styles.emptySubtext}>Connect to internet to download merchant data</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMerchants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.merchantCard}
              onPress={() => navigateToMerchantDetail(item)}
            >
              <Image 
                source={{ uri: item.image }} 
                style={styles.merchantImage} 
                defaultSource={require('../../assets/images/merchant-placeholder.png')}
              />
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName}>{item.name}</Text>
                <View style={styles.merchantMeta}>
                  <View style={styles.categoryBadge}>
                    <Ionicons name={getCategoryIcon(item.category)} size={12} color={colors.primary} />
                    <Text style={styles.categoryText}>{getCategoryName(item.category)}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color={colors.primary} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={styles.address} numberOfLines={2}>
                  <Ionicons name="location-outline" size={12} color={colors.primary} /> {item.address}
                </Text>
                {item.acceptsWaoCard && (
                  <View style={styles.waoCardBadge}>
                    <Ionicons name="checkmark-circle" size={10} color={colors.primary} />
                    <Text style={styles.waoCardText}>Accepts WaoCard</Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.merchantList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.light,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  filtersContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginLeft: 5,
  },
  activeFilterText: {
    color: colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 10,
    textAlign: 'center',
  },
  merchantList: {
    padding: 15,
  },
  merchantCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  merchantImage: {
    width: 100,
    height: 100,
  },
  merchantInfo: {
    flex: 1,
    padding: 12,
  },
  merchantName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.light,
    marginBottom: 6,
  },
  merchantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.primary,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  address: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 16,
  },
  waoCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waoCardText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.primary,
    marginLeft: 4,
  },
});

export default OfflineMapScreen;