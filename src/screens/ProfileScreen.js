import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import useConfirmation from '../hooks/useConfirmation';
import styles from '../styles/profileScreenStyles';

const ProfileScreen = ({ navigation }) => {
  const { userData, signOut } = useAuth();
  const notification = useNotification();
  const { confirm, confirmDelete, ConfirmationComponent } = useConfirmation();

  // Format name with fallback
  const fullName = userData ? `${userData.first_name} ${userData.last_name}` : 'User';
  
  // Updated logout handler using confirmation modal
  const handleLogout = async () => {
    try {
      await confirm({
        title: 'Sign Out',
        message: 'Are you sure you want to sign out from your account?',
        confirmText: 'Sign Out',
        cancelText: 'Cancel',
        type: 'warning',
        icon: 'log-out-outline'
      });
      
      // User confirmed logout
      signOut();
      notification.info('You have been signed out successfully');
      
    } catch (error) {
      // User canceled logout
    }
  };
  
  // Handle account deletion with extra confirmation
  const handleDeleteAccount = async () => {
    try {
      // First confirmation
      await confirmDelete(
        'Are you sure you want to delete your account? This action cannot be undone.',
        { confirmText: 'Delete My Account' }
      );
      
      // Second confirmation for extra safety
      await confirm({
        title: 'Final Confirmation',
        message: 'All your data will be permanently deleted. This action CANNOT be undone.',
        confirmText: 'Permanently Delete',
        type: 'danger',
        icon: 'trash'
      });
      
      // Process account deletion
      notification.success('Your account has been scheduled for deletion');
      setTimeout(() => {
        signOut();
      }, 2000);
      
    } catch (error) {
      // User canceled account deletion
    }
  };
  
  // Handle edit profile
  const handleEditProfile = () => {
    notification.info('Profile edit feature coming soon!', {
      title: 'Coming Soon',
      actionLabel: 'Learn More',
      actionOnPress: () => {
        notification.success('Keep an eye out for updates!');
      },
      animPattern: 'BOUNCE'
    });
  };
  
  // Handle wallet actions
  const handleWalletAction = (action) => {
    const actions = {
      add: {
        message: 'Add Money feature coming soon!',
        title: 'Add Money'
      },
      send: {
        message: 'Send Money feature coming soon!',
        title: 'Send Money'
      },
      receive: {
        message: 'Receive Money feature coming soon!', 
        title: 'Receive Money'
      }
    };
    
    notification.warning(actions[action].message, {
      title: actions[action].title,
      animPattern: 'FADE_IN'
    });
  };
  
  // Handle settings navigation
  const handleSettingPress = (setting) => {
    notification.info(`${setting} settings will be available soon!`, {
      title: setting,
      actionLabel: 'Remind Me',
      actionOnPress: () => {
        notification.success('We\'ll let you know when this feature is ready', {
          title: 'Reminder Set'
        });
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <ImageBackground
        source={require('../../assets/images/gradient-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FF9500" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Header with Glow Effect */}
          <View style={styles.profileHeader}>
            <View style={styles.profileCardGlow} />
            
            <View style={styles.profileCard}>
              <View style={styles.userInfoRow}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarContainer}>
                    {userData?.avatar ? (
                      <Image 
                        source={{ uri: userData.avatar }} 
                        style={styles.avatar}
                        onError={(e) => {
                          notification.error('Failed to load avatar image');
                          console.log("Image load error:", e.nativeEvent.error);
                        }}
                      />
                    ) : (
                      <Image source={require('../../assets/images/avatar.jpg')} style={styles.avatar} />
                    )}
                  </View>
                  
                  {/* Verification badge as a separate element outside the avatar */}
                  {userData?.is_verified === 1 && (
                    <View style={styles.verificationBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#FF9500" />
                    </View>
                  )}
                </View>
                
                <View style={styles.userTextInfo}>
                  <Text style={styles.userName}>{fullName}</Text>
                  <Text style={styles.userUsername}>@{userData?.username}</Text>
                  
                  {/* Horizontal badge row */}
                  <View style={styles.badgeRow}>
                    {userData?.admin === "1" && (
                      <View style={[styles.badge, styles.adminBadge]}>
                        <Ionicons name="shield" size={12} color="#5856D6" />
                        <Text style={[styles.badgeText, styles.adminBadgeText]}>Admin</Text>
                      </View>
                    )}
                    
                    {userData?.is_verified === 1 && (
                      <View style={[styles.badge, styles.verifiedBadge]}>
                        <Ionicons name="checkmark-circle" size={12} color="#34C759" />
                        <Text style={[styles.badgeText, styles.verifiedBadgeText]}>Verified</Text>
                      </View>
                    )}
                    
                    {userData?.gender && (
                      <View style={[styles.badge, styles.genderBadge]}>
                        <Ionicons 
                          name={userData.gender === "male" ? "male" : "female"} 
                          size={12} 
                          color="#007AFF" 
                        />
                        <Text style={[styles.badgeText, styles.genderBadgeText]}>
                          {userData.gender === "male" ? "Male" : "Female"}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.editProfileButton}
                    onPress={handleEditProfile}
                  >
                    <Ionicons name="pencil" size={12} color="#FF9500" />
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Stats Row */}
              <View style={styles.statsRow}>
                <TouchableOpacity 
                  style={styles.statItem}
                  onPress={() => notification.info(`You are following ${userData?.details?.following_count || 0} accounts`)}
                >
                  <Text style={styles.statValue}>{userData?.details?.following_count || 0}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => notification.info(`You have ${userData?.details?.followers_count || 0} followers`)}
                >
                  <Text style={styles.statValue}>{userData?.details?.followers_count || 0}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => notification.info(`You have made ${userData?.details?.post_count || 0} posts`)}
                >
                  <Text style={styles.statValue}>{userData?.details?.post_count || 1}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Wallet Section */}
          <Text style={styles.sectionTitle}>Wallet</Text>
          <View style={styles.walletSection}>
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="wallet-outline" size={20} color="#FF9500" />
                  <Text style={styles.walletTitle}>  WaoCard Balance</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => notification.success('Balance visibility toggle coming soon!')}
                >
                  <Ionicons name="eye-outline" size={20} color="#FF9500" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.walletBalance}>₦ {userData?.wallet || '741'}</Text>
              
              <View style={styles.walletActions}>
                <TouchableOpacity 
                  style={styles.walletActionButton}
                  onPress={() => handleWalletAction('add')}
                >
                  <View style={styles.walletActionIconContainer}>
                    <Ionicons name="add" size={24} color="#FF9500" />
                  </View>
                  <Text style={styles.walletActionText}>Add Money</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.walletActionButton}
                  onPress={() => handleWalletAction('send')}
                >
                  <View style={styles.walletActionIconContainer}>
                    <Ionicons name="arrow-up" size={24} color="#FF9500" />
                  </View>
                  <Text style={styles.walletActionText}>Send</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.walletActionButton}
                  onPress={() => handleWalletAction('receive')}
                >
                  <View style={styles.walletActionIconContainer}>
                    <Ionicons name="arrow-down" size={24} color="#FF9500" />
                  </View>
                  <Text style={styles.walletActionText}>Receive</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Settings Section */}
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleSettingPress('Account')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="person-outline" size={20} color="#FF9500" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Account</Text>
                <Text style={styles.settingDescription}>Personal information, email, phone</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.settingArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleSettingPress('Privacy & Security')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#FF9500" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Privacy & Security</Text>
                <Text style={styles.settingDescription}>Two-factor, privacy settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.settingArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleSettingPress('Notifications')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#FF9500" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>Push, email notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.settingArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleSettingPress('Payment Methods')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="card-outline" size={20} color="#FF9500" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Payment Methods</Text>
                <Text style={styles.settingDescription}>Cards, bank accounts</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.settingArrow} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleSettingPress('Help & Support')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="help-circle-outline" size={20} color="#FF9500" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Help & Support</Text>
                <Text style={styles.settingDescription}>FAQs, contact support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.settingArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleSettingPress('Terms & Policies')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="document-text-outline" size={20} color="#FF9500" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Terms & Policies</Text>
                <Text style={styles.settingDescription}>Privacy policy, terms of service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.settingArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                // Show multiple notifications stacked
                notification.success('Thanks for using WaoCard!', {title: 'WaoCard v1.0.0'});
                
                // Add a small delay between notifications for better visual effect
                setTimeout(() => {
                  notification.info('Built with React Native', {animPattern: 'FADE_IN'});
                }, 300);
                
                setTimeout(() => {
                  notification.warning('More features coming soon!', {
                    actionLabel: 'View Roadmap',
                    actionOnPress: () => notification.success('Roadmap will be available in the next update!')
                  });
                }, 600);
              }}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="information-circle-outline" size={20} color="#FF9500" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>About WaoCard</Text>
                <Text style={styles.settingDescription}>Version 1.0.0</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.settingArrow} />
            </TouchableOpacity>
          </View>
          
          {/* Logout & Delete Account Buttons */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
      
      {/* Include the ConfirmationComponent */}
      <ConfirmationComponent />
    </SafeAreaView>
  );
};

export default ProfileScreen;