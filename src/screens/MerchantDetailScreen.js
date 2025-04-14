import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  Share,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

// Hooks and services
import { getMerchantDetails } from '../services/merchantService';

// Styles and utilities
import { futuristicMapStyle } from '../styles/mapStyles';
import { colors, fonts, borderRadius } from '../styles/theme';
import { getCategoryIcon, getCategoryName } from '../utils/categoryUtils';
import MerchantMarker from '../components/MerchantMarker';

const { width } = Dimensions.get('window');

/**
 * Detailed merchant information screen
 */
const MerchantDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { merchant } = route.params;
  
  const [detailedMerchant, setDetailedMerchant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Fetch detailed merchant data
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await getMerchantDetails(merchant.id);
        setDetailedMerchant(details);
      } catch (err) {
        setError(err.message);
        // Fallback to basic merchant data
        setDetailedMerchant(merchant);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [merchant]);

  // Functions to handle user actions
  const shareMerchant = async () => {
    try {
      await Share.share({
        message: `Check out ${merchant.name} on WaoCard! Located at: ${merchant.address}`,
        url: 'https://waocard.com/merchant/' + merchant.id,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openWebsite = () => {
    if (detailedMerchant?.website) {
      Linking.openURL(detailedMerchant.website);
    }
  };

  const makePhoneCall = () => {
    if (detailedMerchant?.phone) {
      Linking.openURL(`tel:${detailedMerchant.phone}`);
    }
  };

  const getDirections = () => {
    const { latitude, longitude } = merchant.coordinate;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: merchant.image }} 
          style={styles.heroImage} 
          defaultSource={require('../../assets/images/merchant-placeholder.png')}
        />
        
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={shareMerchant}>
          <Ionicons name="share-social-outline" size={22} color="#FFF" />
        </TouchableOpacity>
        
        {merchant.acceptsWaoCard && (
          <View style={styles.waoCardBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#FFF" />
            <Text style={styles.waoCardBadgeText}>Accepts WaoCard</Text>
          </View>
        )}
      </View>
      
      {/* Merchant Info */}
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.merchantName}>{merchant.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color={colors.primary} />
            <Text style={styles.rating}>{merchant.rating}</Text>
          </View>
        </View>
        
        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <Ionicons name={getCategoryIcon(merchant.category)} size={16} color={colors.primary} />
            <Text style={styles.categoryText}>{getCategoryName(merchant.category)}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.address}>{merchant.address}</Text>
          
          {/* Mini Map */}
          <View style={styles.miniMapContainer}>
            <MapView
              style={styles.miniMap}
              provider={PROVIDER_GOOGLE}
              customMapStyle={futuristicMapStyle}
              region={{
                latitude: merchant.coordinate.latitude,
                longitude: merchant.coordinate.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              <Marker
                coordinate={merchant.coordinate}
                title={merchant.name}
              >
                <MerchantMarker 
                  category={merchant.category}
                  acceptsWaoCard={merchant.acceptsWaoCard}
                />
              </Marker>
            </MapView>
            
            <TouchableOpacity style={styles.directionsButton} onPress={getDirections}>
              <Ionicons name="navigate-outline" size={18} color="#FFF" />
              <Text style={styles.directionsButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {detailedMerchant?.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <Text 
              style={styles.description} 
              numberOfLines={showFullDesc ? undefined : 3}
            >
              {detailedMerchant.description}
            </Text>
            {detailedMerchant.description.length > 120 && (
              <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
                <Text style={styles.readMoreText}>
                  {showFullDesc ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {detailedMerchant?.openingHours && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Opening Hours</Text>
            </View>
            <Text style={styles.hoursText}>{detailedMerchant.openingHours}</Text>
          </View>
        )}
        
        {detailedMerchant?.paymentOptions && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Payment Options</Text>
            </View>
            <View style={styles.paymentOptions}>
              {detailedMerchant.paymentOptions.map((option, index) => (
                <View key={index} style={styles.paymentOption}>
                  <Text style={styles.paymentOptionText}>{option}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {merchant.acceptsWaoCard && detailedMerchant?.waoCardDiscount && (
          <View style={styles.discountSection}>
            <View style={styles.discountHeader}>
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              <Text style={styles.discountTitle}>WaoCard Special Offer</Text>
            </View>
            <Text style={styles.discountText}>{detailedMerchant.waoCardDiscount}</Text>
          </View>
        )}
        
        <View style={styles.contactButtons}>
          {detailedMerchant?.phone && (
            <TouchableOpacity style={styles.contactButton} onPress={makePhoneCall}>
              <Ionicons name="call-outline" size={20} color="#FFF" />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
          )}
          
          {detailedMerchant?.website && (
            <TouchableOpacity style={styles.contactButton} onPress={openWebsite}>
              <Ionicons name="globe-outline" size={20} color="#FFF" />
              <Text style={styles.contactButtonText}>Website</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.contactButton} onPress={shareMerchant}>
            <Ionicons name="share-social-outline" size={20} color="#FFF" />
            <Text style={styles.contactButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  shareButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  waoCardBadge: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: 'rgba(255, 149, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waoCardBadgeText: {
    color: colors.light,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    marginLeft: 5,
  },
  contentContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  merchantName: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.light,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  rating: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.light,
    marginLeft: 5,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  categoryText: {
    color: colors.light,
    fontFamily: fonts.medium,
    fontSize: 14,
    marginLeft: 6,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.light,
    marginLeft: 8,
  },
  address: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 15,
    marginBottom: 15,
  },
  miniMapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  miniMap: {
    width: '100%',
    height: '100%',
  },
  directionsButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  directionsButtonText: {
    color: colors.light,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    marginLeft: 5,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  readMoreText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 14,
    marginTop: 5,
  },
  hoursText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  paymentOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  paymentOptionText: {
    color: colors.light,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  discountSection: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  discountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  discountTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.primary,
    marginLeft: 8,
  },
  discountText: {
    color: colors.light,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  contactButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  contactButtonText: {
    color: colors.light,
    fontFamily: fonts.medium,
    fontSize: 14,
    marginTop: 5,
  },
});

export default MerchantDetailScreen;