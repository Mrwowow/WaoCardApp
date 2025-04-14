import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import WaoCardIcon from '../components/WaoCardIcon';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/homeScreenStyles';

// Get screen dimensions for dynamic components
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

const HomeScreen = ({ navigation }) => {
  // Get userData from authentication context
  const { userData, userToken, isLoading, fetchUserData } = useAuth();
  
  const [activeTab, setActiveTab] = useState('Home');
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Service categories remain unchanged
  const serviceCategories = [
    { id: 1, icon: 'receipt-outline', title: 'Airtime & Bills' },
    { id: 2, icon: 'people-outline', title: 'Membership' },
    { id: 3, icon: 'calendar-outline', title: 'Events' },
    { id: 4, icon: 'briefcase-outline', title: 'My Office' },
    { id: 5, icon: 'business-outline', title: 'My Estate' },
    { id: 6, icon: 'medkit-outline', title: 'Hospital' },
    { id: 7, icon: 'fitness-outline', title: 'Wellness & Fitness' },
  ];

  // Store cards data
  const storeCards = [
    { id: 1, name: 'Tripberry', cardNumber: 'N******', logo: require('../../assets/images/tripberry-logo.jpeg'), bgColor: '#0a4166' },
    { id: 2, name: 'ENYO', cardNumber: 'N******', logo: require('../../assets/images/enyo-logo.png'), bgColor: '#1e4a56' },
    { id: 3, name: 'Spar', cardNumber: 'N******', logo: require('../../assets/images/spar-logo.jpg'), bgColor: '#552233' },
    { id: 4, name: 'GB', cardNumber: 'N******', logo: require('../../assets/images/gb-logo.jpeg'), bgColor: '#225533' },
  ];

  // Merchant data
  const merchants = [
    { id: 1, name: 'GB', logo: require('../../assets/images/gb-logo.jpeg') },
    { id: 2, name: 'Tripberry', logo: require('../../assets/images/tripberry-logo.jpeg') },
    { id: 3, name: 'SPAR', logo: require('../../assets/images/spar-logo.jpg') },
    { id: 4, name: 'ENYO', logo: require('../../assets/images/enyo-logo.png') },
    { id: 5, name: 'Merchant 5', logo: require('../../assets/images/avatar.jpg') },
    { id: 6, name: 'Merchant 6', logo: require('../../assets/images/avatar.jpg') },
  ];

  // Merchant filter categories
  const merchantCategories = [
    { id: 'all', name: 'ALL' },
    { id: 'shopping', name: 'SHOPPING' },
    { id: 'transport', name: 'TRANSPORT' },
    { id: 'food', name: 'FOOD' },
  ];

  // Mock contacts data
  const contacts = [
    { id: 1, name: 'John', avatar: require('../../assets/images/avatar.jpg'), isOnline: true },
    { id: 2, name: 'Jane', avatar: require('../../assets/images/avatar.jpg'), isOnline: false },
    { id: 3, name: 'Peter', avatar: require('../../assets/images/avatar.jpg'), isOnline: true },
  ];

  const [activeMerchantCategory, setActiveMerchantCategory] = useState('all');

  // Refresh user data function for pull-to-refresh
  const onRefresh = async () => {
    if (!userToken || !userData?.username) return;
    
    setRefreshing(true);
    try {
      await fetchUserData(userToken, userData.username);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load user data on initial mount
  useEffect(() => {
    if (userToken && userData && userData.username) {
      // Initial data load if needed
      // No need to call fetchUserData here if it's already fetched during login
    }
  }, []);

  // Function to render service category items
  const renderServiceCategory = (item, index) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.serviceItemCarousel}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['rgba(255, 149, 0, 0.8)', 'rgba(255, 120, 0, 0.9)']}
          style={styles.serviceIconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={item.icon} size={24} color="#fff" />
        </LinearGradient>
        <Text style={styles.serviceText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  // Function to render store card
  const renderStoreCard = (card) => {
    return (
      <TouchableOpacity
        key={card.id}
        style={styles.storeCardCarousel}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[card.bgColor, '#000']}
          style={styles.storeCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.storeCardHeader}>
            <Text style={styles.storeCardName}>{card.name}</Text>
            <View style={styles.storeCardLogoContainer}>
              <Image source={card.logo} style={styles.storeCardLogo} resizeMode="contain" />
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <Text style={styles.storeCardNumberSmall}>{card.cardNumber}</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressBarFill} />
            </View>
          </View>
          <View style={styles.storeCardFooter}>
            <Ionicons name="gift-outline" size={20} color="#fff" />
            <Text style={styles.storeCardFooterText}>Top-up Card</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Function to render merchant category filter
  const renderMerchantCategoryFilter = (category) => {
    const isActive = activeMerchantCategory === category.id;
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.merchantCategoryButton, isActive && styles.activeMerchantCategoryButton]}
        onPress={() => setActiveMerchantCategory(category.id)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={
            category.id === 'all' ? 'grid-outline' :
            category.id === 'shopping' ? 'cart-outline' :
            category.id === 'transport' ? 'bus-outline' : 'fast-food-outline'
          }
          size={20}
          color={isActive ? '#000' : '#fff'}
        />
        <Text style={[styles.merchantCategoryText, isActive && styles.activeMerchantCategoryText]}>{category.name}</Text>
      </TouchableOpacity>
    );
  };

  // Function to render merchant item with navigation
  const renderMerchant = (merchant) => {
    const handleMerchantPress = () => {
      const enhancedMerchant = {
        ...merchant,
        coordinate: merchant.coordinate || { latitude: 9.0820, longitude: 8.6753 },
        category: merchant.category || 'retail',
        rating: merchant.rating || '4.5',
        address: merchant.address || 'Lagos, Nigeria',
        acceptsWaoCard: merchant.acceptsWaoCard || true,
        image: merchant.image || 'https://example.com/placeholder.jpg',
      };
      
      navigation.navigate('MapStack', {
        screen: 'MerchantDetail',
        params: { merchant: enhancedMerchant }
      });
    };
    
    return (
      <TouchableOpacity 
        key={merchant.id}
        style={styles.merchantItemCarousel}
        activeOpacity={0.7}
        onPress={handleMerchantPress}
      >
        <BlurView intensity={10} style={styles.merchantBlur} tint="dark">
          <Image source={merchant.logo} style={styles.merchantLogo} />
        </BlurView>
      </TouchableOpacity>
    );
  };

  // Function to render contact item
  const renderContact = (contact) => {
    return (
      <TouchableOpacity
        key={contact.id}
        style={styles.contactItem}
        activeOpacity={0.7}
      >
        <View style={styles.contactAvatarContainer}>
          <Image source={contact.avatar} style={styles.contactAvatar} />
          {contact.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <Text style={styles.contactNameText}>{contact.name}</Text>
      </TouchableOpacity>
    );
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  // Show loading indicator while initial data is being fetched
  if (isLoading && !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <ImageBackground
        source={require('../../assets/images/gradient-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Header with user info from context */}
        <View style={styles.header}>
          
          <View style={styles.avatarWrapper}>
            <TouchableOpacity 
              style={styles.avatarContainer} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ProfileScreen')}
            >
              {userData?.avatar ? (
                <Image 
                  source={{ uri: userData.avatar }} 
                  style={styles.avatar}
                  onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
                />
              ) : (
                <Image source={require('../../assets/images/avatar.jpg')} style={styles.avatar} />
              )}
            </TouchableOpacity>
            
            {userData?.is_verified === 1 && (
              <View style={styles.verificationBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#FF9500" />
              </View>
            )}
          </View>
          
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Hi, <Text style={styles.nameText}>{userData?.first_name || 'User'}</Text> 👋</Text>
          </View>
          <TouchableOpacity style={styles.notificationContainer} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color="#FF9500" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content Area with RefreshControl */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF9500"]}
              tintColor="#FF9500"
              title="Refreshing profile..."
              titleColor="#FFFFFF"
              progressBackgroundColor="#222222"
            />
          }
        >
          {/* --- Wallet Card Carousel --- */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.walletCarouselContainer}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 10}
            snapToAlignment="start"
          >
            {/* Main Wallet Card (WaoCard) */}
            <View style={[styles.walletCard, { width: CARD_WIDTH }]}>
              <BlurView intensity={20} tint="dark" style={styles.walletCardBlur}>
                {/* Header: Logo, Eye */}
                <View style={styles.walletCardHeader}>
                  <View style={styles.walletCardLogoContainer}>
                    <WaoCardIcon color="white" width={20} height={20} />
                    <Text style={styles.walletCardLogoText}>WaoCard</Text>
                  </View>
                  {/* Eye Button only */}
                  <TouchableOpacity style={styles.eyeButton} activeOpacity={0.7} onPress={toggleBalanceVisibility}>
                    <Ionicons name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Balance Display (Centered) - Using userData.wallet */}
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceText}>
                    {isBalanceVisible ? `₦ ${userData?.wallet || '0.00'}` : '₦ ******'}
                  </Text>
                </View>

                {/* Bottom: Wallet ID (Left) and Add Button (Right) */}
                <View style={styles.walletCardBottomContainer}>
                  <View style={styles.walletCardBottom}>
                    <Text style={styles.walletIdText}>{userData?.phone_number || ''}</Text>
                    <Text style={styles.walletLabel}>Wallet ID</Text>
                  </View>
                  {/* Add Button */}
                  <TouchableOpacity style={[styles.addButton, styles.walletCardBottomAction]} activeOpacity={0.7}>
                    <Ionicons name="add-circle" size={28} color="#FF9500" />
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
            {/* End Main Wallet Card */}

            {/* Balance Card */}
            <View style={[styles.balanceCard, { width: CARD_WIDTH }]}>
              <BlurView intensity={20} tint="dark" style={styles.walletCardBlur}>
                {/* Header: Title, Eye */}
                <View style={styles.balanceCardHeader}>
                  <View style={styles.walletCardLogoContainer}>
                    <Ionicons name="wallet-outline" size={18} color="#FF9500" />
                    <Text style={styles.balanceCardLogoText}>Balance</Text>
                  </View>
                  <TouchableOpacity style={styles.eyeButton} activeOpacity={0.7} onPress={toggleBalanceVisibility}>
                    <Ionicons name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Balance Display (Centered) */}
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceText}>
                    {isBalanceVisible ? `$ ${userData?.balance || '0.00'}` : '$ ******'}
                  </Text>
                </View>

                {/* Bottom: Add button */}
                <TouchableOpacity style={[styles.addButton, styles.walletCardBottomAction]} activeOpacity={0.7}>
                  <Ionicons name="add-circle" size={28} color="#FF9500" />
                </TouchableOpacity>
              </BlurView>
            </View>
            {/* End Balance Card */}

          </ScrollView>
          {/* --- End Wallet Card Carousel --- */}

          {/* Service Categories Carousel */}
          <View style={styles.servicesContainer}>
            <LinearGradient
              colors={['rgba(255, 149, 0, 0.7)', 'rgba(255, 120, 0, 0.8)']}
              style={styles.servicesGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.servicesScrollContentCarousel}
              >
                {serviceCategories.map(renderServiceCategory)}
              </ScrollView>
            </LinearGradient>
          </View>

          {/* Store Cards Section Carousel */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="card-outline" size={24} color="#FF9500" />
                <Text style={styles.sectionTitle}>Store Cards</Text>
              </View>
              <TouchableOpacity style={styles.addNewButton} activeOpacity={0.7}>
                <Text style={styles.addNewText}>Add New</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>Loyalty, Rewards & Gift Cards</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsCarouselContainer}
              decelerationRate="fast"
              snapToInterval={width * 0.5 + 10}
              snapToAlignment="start"
            >
              {storeCards.map(renderStoreCard)}
            </ScrollView>
          </View>

          {/* My Network Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="people-outline" size={24} color="#FF9500" />
                <Text style={styles.sectionTitle}>My Network</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.viewMoreText}>View More</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>Contacts Nearby</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contactsContainer}
            >
              {contacts.map(renderContact)}
              <TouchableOpacity style={styles.addContactItem} activeOpacity={0.7}>
                <Ionicons name="add" size={30} color="#FF9500" />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Merchants Section Carousel */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="business-outline" size={24} color="#FF9500" />
                <Text style={styles.sectionTitle}>Merchants</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.viewMoreText}>View More</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>Nearby</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.merchantCategoriesContainer}
            >
              {merchantCategories.map(renderMerchantCategoryFilter)}
            </ScrollView>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.merchantsCarouselContainer}
            >
              {merchants.map(renderMerchant)}
            </ScrollView>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default HomeScreen;