import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default {
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 15,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  
  // Profile Header Section
  profileHeader: {
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: 10,
  },
  profileCardGlow: {
    position: 'absolute',
    top: -30,
    right: 0,
    width: width * 0.8,
    height: 250,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    transform: [{ rotate: '-45deg' }],
    zIndex: -1,
  },
  
  // Profile Card
  profileCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    padding: 20,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // New wrapper to handle the avatar and verification badge positioning
  avatarWrapper: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFDFBA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 149, 0, 0.5)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  verificationBadge: {
    position: 'absolute',
    right: 0,
    top: 60,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    zIndex: 10,
  },
  userTextInfo: {
    marginLeft: 20,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
    textTransform: 'uppercase', // Make the name all caps as shown in screenshot
  },
  userUsername: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  editProfileButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8, // Add spacing above the button
  },
  editProfileText: {
    color: '#FF9500',
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  // Updated badge styles to be in a horizontal row
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  badgeText: {
    color: '#FF9500',
    fontSize: 12,
    marginLeft: 4,
  },
  adminBadge: {
    backgroundColor: 'rgba(88, 86, 214, 0.1)',
    borderColor: 'rgba(88, 86, 214, 0.3)',
  },
  adminBadgeText: {
    color: '#5856D6',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  verifiedBadgeText: {
    color: '#34C759',
  },
  genderBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  genderBadgeText: {
    color: '#007AFF',
  },
  
  // Notification Styles
  notification: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  notificationSuccess: {
    backgroundColor: 'rgba(52, 199, 89, 0.95)',
  },
  notificationError: {
    backgroundColor: 'rgba(255, 59, 48, 0.95)',
  },
  notificationInfo: {
    backgroundColor: 'rgba(0, 122, 255, 0.95)',
  },
  notificationText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  notificationClose: {
    padding: 5,
  },
  
  // Wallet Card in Profile
  walletSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  walletCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    padding: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  walletActionButton: {
    alignItems: 'center',
  },
  walletActionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  walletActionText: {
    fontSize: 12,
    color: '#FFF',
  },
  
  // Settings Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
    marginHorizontal: 20,
    marginTop: 20,
  },
  settingsCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  settingArrow: {
    marginLeft: 10,
  },
  
  // Logout Button
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  
  // Delete Account Button
  deleteAccountButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteAccountText: {
    color: '#FF3B30',
    fontSize: 14,
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
};