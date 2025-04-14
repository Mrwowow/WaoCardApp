import { Dimensions } from 'react-native';
import { colors, fonts, borderRadius } from './theme';

// Get screen dimensions
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const SMALL_CARD_WIDTH = width * 0.25;

export default {
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 5,
    justifyContent: 'space-between',
  },
  cardIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  nameText: {
    fontWeight: 'bold',
    color: '#FF9500',
  },
  
  // Wrapper to properly position avatar and verification badge
  avatarWrapper: {
    width: 45,
    height: 45,
    position: 'relative',
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFDFBA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  verificationBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    zIndex: 10,
  },
  notificationContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#000',
  },
  // --- Wallet Carousel Styles ---
  walletCarouselContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  walletCard: {
    height: 170,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    marginRight: 10,
  },
  walletCardBlur: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  walletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  walletCardBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  walletCardBottom: {
    alignSelf: 'flex-start',
  },
  walletCardBottomAction: {
    alignSelf: 'flex-end',
  },
  balanceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  balanceText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  eyeButton: {
     padding: 5,
  },
  addButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  walletIdText: {
    color: '#fff',
    fontSize: 16,
  },
  walletLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  balanceCard: {
    height: 170,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    marginRight: 10,
  },
  balanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceCardLogoText: {
    color: '#FF9500',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  walletCardLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletCardIcon: {
    transform: [{ rotate: '45deg' }],
    marginRight: 5,
  },
  walletCardLogoText: {
    color: '#FF9500',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // --- Service Categories Styles ---
  servicesContainer: {
    marginTop: 20,
    borderRadius: 20,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  servicesGradient: {
    paddingVertical: 15,
    borderRadius: 20,
  },
  servicesScrollContentCarousel: {
    paddingHorizontal: 15,
  },
  serviceItemCarousel: {
    width: width / 4.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 11,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },

  // --- Section Styles (Headers, Titles etc) ---
  sectionContainer: {
    marginTop: 25,
    paddingHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 20,
  },
  addNewButton: {
    padding: 5,
  },
  addNewText: {
    color: '#FF9500',
    fontWeight: 'bold',
  },
  viewMoreText: {
    color: '#FF9500',
    fontWeight: 'bold',
  },

  // --- Store Cards Carousel Styles ---
  cardsCarouselContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  storeCardCarousel: {
    width: width * 0.5,
    height: 160,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    marginRight: 10,
  },
  storeCardGradient: {
    width: '100%',
    height: '100%',
    padding: 15,
    justifyContent: 'space-between',
  },
  storeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeCardName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 5,
  },
  storeCardNumberSmall: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 3,
  },
  storeCardLogoContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  storeCardLogo: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  progressBarContainer: {
    marginVertical: 10,
    alignItems: 'flex-start',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 3,
  },
  storeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeCardFooterText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 12,
  },
  
  // --- Contacts Styles ---
  contactsContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  contactItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  contactAvatarContainer: {
    position: 'relative',
    marginBottom: 5,
  },
  contactAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFDFBA',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 149, 0, 0.5)',
  },
  onlineIndicator: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00C853',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#000',
  },
  contactNameText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  addContactItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 149, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    marginRight: 15,
  },
  
  // --- Merchants Styles ---
  merchantCategoriesContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  merchantCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  activeMerchantCategoryButton: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  merchantCategoryText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  activeMerchantCategoryText: {
    color: '#000',
  },
  merchantsCarouselContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  merchantItemCarousel: {
    width: SMALL_CARD_WIDTH,
    height: SMALL_CARD_WIDTH, // Square shape
    borderRadius: 15,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    backgroundColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  merchantBlur: {
    width: '100%',
    height: '100%', // Take full height
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    overflow: 'hidden',
  },
  merchantLogo: {
    width: '90%',
    height: '90%',
    borderRadius: 15,
    resizeMode: 'contain',
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 15,
    fontSize: 16,
  },
};