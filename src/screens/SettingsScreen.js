import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CustomAlert from '../components/CustomAlert';
import { colors, fonts, spacing, borderRadius } from '../styles/theme';

const API_BASE = 'https://www.waobiz.app/api';

const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userToken, userData, updateUserData, signOut } = useAuth();
  const notification = useNotification();
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: 'info', title: '', message: '', buttons: [] });

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const editingRef = useRef(false);
  const [pickerYear, setPickerYear] = useState(2000);
  const [pickerMonth, setPickerMonth] = useState(1);
  const [pickerDay, setPickerDay] = useState(1);

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');

  const fetchProfile = useCallback(async (force = false) => {
    if (!userToken) return;
    if (!force && editingRef.current) return;
    try {
      const response = await fetch(`${API_BASE}/waocard/profile`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${userToken}`,
        },
      });
      const result = await response.json();
      if (result.data) {
        const data = result.data;
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || '');
        setMobile(data.mobile || '');
        setDob(data.dob || '');
        setAddressLine1(data.address_line_1 || '');
        setCity(data.city || '');
        setState(data.state || '');
        setCountry(data.country || '');

        // Sync to auth context
        await updateUserData({
          first_name: data.first_name,
          last_name: data.last_name,
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          balance: data.balance,
          contact_status: data.contact_status,
          business_name: data.business_name,
          address_line_1: data.address_line_1,
          city: data.city,
          state: data.state,
          country: data.country,
        });
      }
    } catch (error) {
      console.error('SettingsScreen: Error fetching profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userToken, updateUserData]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    editingRef.current = editing;
  }, [editing]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/waocard/profile`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email || undefined,
          mobile: mobile,
          dob: dob || undefined,
          address_line_1: addressLine1 || undefined,
          city: city || undefined,
          state: state || undefined,
          country: country || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update local state
        const updatedData = result.data || {
          ...profile,
          first_name: firstName,
          last_name: lastName,
          name: `${firstName} ${lastName}`,
          email,
          mobile,
          dob,
          address_line_1: addressLine1,
          city,
          state,
          country,
        };
        setProfile(updatedData);

        // Sync to auth context
        await updateUserData({
          first_name: updatedData.first_name,
          last_name: updatedData.last_name,
          name: updatedData.name || `${firstName} ${lastName}`,
          email: updatedData.email,
          mobile: updatedData.mobile,
          address_line_1: updatedData.address_line_1,
          city: updatedData.city,
          state: updatedData.state,
          country: updatedData.country,
        });

        setEditing(false);
        notification.success('Profile updated successfully.');
      } else {
        notification.error(result.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('SettingsScreen: Error saving profile:', error);
      notification.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setAlertConfig({
      visible: true,
      type: 'warning',
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ],
    });
  };

  const cancelEdit = () => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setMobile(profile.mobile || '');
      setDob(profile.dob || '');
      setAddressLine1(profile.address_line_1 || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setCountry(profile.country || '');
    }
    setEditing(false);
  };

  const pickImage = async (source) => {
    let result;

    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        notification.warning('Camera permission is needed to take a photo.', { title: 'Permission Required' });
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        notification.warning('Photo library permission is needed to select a photo.', { title: 'Permission Required' });
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
    }

    if (!result.canceled && result.assets?.[0]) {
      await uploadProfileImage(result.assets[0]);
    }
  };

  const showImagePickerOptions = () => {
    const buttons = [
      { text: 'Take Photo', onPress: () => pickImage('camera') },
      { text: 'Choose from Library', onPress: () => pickImage('gallery') },
    ];
    if (profile?.profile_image) {
      buttons.push({
        text: 'Remove Photo',
        onPress: handleRemovePhoto,
        style: 'destructive',
      });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });

    setAlertConfig({
      visible: true,
      type: 'info',
      title: 'Profile Photo',
      message: 'Choose an option',
      buttons,
    });
  };

  const uploadProfileImage = async (imageAsset) => {
    setUploadingPhoto(true);
    try {
      const uri = Platform.OS === 'android' && !imageAsset.uri.startsWith('file://')
        ? `file://${imageAsset.uri}`
        : imageAsset.uri;
      const filename = imageAsset.fileName || uri.split('/').pop() || 'profile.jpg';
      const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      // Step 1: Upload file to Cloudinary via POST /api/upload
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: filename,
        type: mimeType,
      });
      formData.append('folder', 'contact_photos');

      console.log('SettingsScreen: Uploading to /api/upload with folder: contact_photos');

      const uploadResponse = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
        body: formData,
      });

      const uploadText = await uploadResponse.text();
      console.log('SettingsScreen: Upload response status:', uploadResponse.status);
      console.log('SettingsScreen: Upload response:', uploadText.substring(0, 500));

      let uploadResult;
      try {
        uploadResult = JSON.parse(uploadText);
      } catch (e) {
        console.error('SettingsScreen: Failed to parse upload response');
        notification.error('Unexpected response from server.');
        return;
      }

      if (!uploadResponse.ok || !uploadResult.success) {
        console.error('SettingsScreen: Upload failed:', uploadResult);
        notification.error(uploadResult.message || uploadResult.error || `Upload failed (${uploadResponse.status}).`);
        return;
      }

      // Response: { success: true, path: "https://res.cloudinary.com/...", filename: "..." }
      const imageUrl = uploadResult.path;

      if (!imageUrl) {
        console.error('SettingsScreen: No path in upload response:', uploadResult);
        notification.error('Upload succeeded but no image URL was returned.');
        return;
      }

      console.log('SettingsScreen: Upload path:', imageUrl);

      // Step 2: Save the Cloudinary URL to the profile via PUT /api/waocard/profile
      const profileResponse = await fetch(`${API_BASE}/waocard/profile`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          profile_image: imageUrl,
        }),
      });

      const profileText = await profileResponse.text();
      console.log('SettingsScreen: Profile update status:', profileResponse.status);
      console.log('SettingsScreen: Profile update response:', profileText.substring(0, 500));

      if (profileResponse.ok) {
        setProfile((prev) => ({ ...prev, profile_image: imageUrl }));
        await updateUserData({ avatar: imageUrl, profile_image: imageUrl });
        notification.success('Profile photo updated.');
      } else {
        // Image uploaded but profile update failed — still show the image locally
        setProfile((prev) => ({ ...prev, profile_image: imageUrl }));
        await updateUserData({ avatar: imageUrl, profile_image: imageUrl });
        console.error('SettingsScreen: Profile update failed, but image uploaded to:', imageUrl);
        notification.warning('Photo uploaded but profile update failed. The photo may appear on next login.', { title: 'Partial Success' });
      }
    } catch (error) {
      console.error('SettingsScreen: Error uploading photo:', error);
      notification.error(`Upload failed: ${error.message}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    try {
      const response = await fetch(`${API_BASE}/waocard/profile`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ profile_image: null }),
      });

      if (response.ok) {
        setProfile((prev) => ({ ...prev, profile_image: null }));
        await updateUserData({ avatar: null, profile_image: null });
        notification.success('Profile photo removed.');
      } else {
        const result = await response.json();
        notification.error(result.message || 'Failed to remove photo.');
      }
    } catch (error) {
      console.error('SettingsScreen: Error removing photo:', error);
      notification.error('Network error. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];
  const daysInMonth = new Date(pickerYear, pickerMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const openDatePicker = () => {
    if (dob) {
      const parts = dob.split('-');
      if (parts.length === 3) {
        setPickerYear(parseInt(parts[0], 10));
        setPickerMonth(parseInt(parts[1], 10));
        setPickerDay(parseInt(parts[2], 10));
      }
    }
    setShowDatePicker(true);
  };

  const confirmDatePicker = () => {
    const clampedDay = Math.min(pickerDay, daysInMonth);
    const formatted = `${pickerYear}-${String(pickerMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
    setDob(formatted);
    setShowDatePicker(false);
  };

  const renderField = (label, value, setter, options = {}) => {
    const { keyboardType, placeholder, editable = true, onPress } = options;
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {editing && editable ? (
          onPress ? (
            <TouchableOpacity style={styles.fieldInput} onPress={onPress}>
              <Text style={[{ fontSize: 16, color: '#1a1a1a' }, !value && { color: 'rgba(0,0,0,0.3)' }]}>
                {value || placeholder || label}
              </Text>
            </TouchableOpacity>
          ) : (
            <TextInput
              style={styles.fieldInput}
              value={value}
              onChangeText={setter}
              placeholder={placeholder || label}
              placeholderTextColor="rgba(0,0,0,0.3)"
              keyboardType={keyboardType || 'default'}
              autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
            />
          )
        ) : (
          <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="rgb(255, 248, 240)" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="rgb(255, 248, 240)" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Settings</Text>
        {!editing ? (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Summary Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={showImagePickerOptions}
            activeOpacity={0.7}
            disabled={uploadingPhoto}
          >
            {profile?.profile_image ? (
              <Image
                source={{ uri: profile.profile_image }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {(firstName?.[0] || '') + (lastName?.[0] || '')}
                </Text>
              </View>
            )}
            {uploadingPhoto ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="#FFF" />
              </View>
            ) : (
              <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            )}
            {profile?.contact_status === 'active' && (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#30D158" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.profileName}>{profile?.name || `${firstName} ${lastName}`}</Text>
          <Text style={styles.profileMobile}>{profile?.mobile || mobile}</Text>
          {profile?.business_name && (
            <View style={styles.businessBadge}>
              <Ionicons name="business-outline" size={14} color={colors.primary} />
              <Text style={styles.businessBadgeText}>{profile.business_name}</Text>
            </View>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.card}>
            {renderField('First Name', firstName, setFirstName)}
            {renderField('Last Name', lastName, setLastName)}
            {renderField('Date of Birth', dob, setDob, { placeholder: 'YYYY-MM-DD', onPress: openDatePicker })}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          <View style={styles.card}>
            {renderField('Mobile', mobile, setMobile, { keyboardType: 'phone-pad' })}
            {renderField('Email', email, setEmail, { keyboardType: 'email-address' })}
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Address</Text>
          </View>
          <View style={styles.card}>
            {renderField('Address', addressLine1, setAddressLine1)}
            {renderField('City', city, setCity)}
            {renderField('State', state, setState)}
            {renderField('Country', country, setCountry)}
          </View>
        </View>

        {/* Account Info (read-only) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
          <View style={styles.card}>
            {renderField('Account Status', profile?.contact_status || 'N/A', null, { editable: false })}
            {renderField('Account Type', profile?.type || 'N/A', null, { editable: false })}
            {renderField('Balance', `₦ ${profile?.balance || '0'}`, null, { editable: false })}
            {renderField('Reward Points', `${profile?.total_rp || 0}`, null, { editable: false })}
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>WaoCard v1.0.0</Text>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />

      {/* Custom Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          style={styles.datePickerOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerContainer} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.datePickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>Date of Birth</Text>
              <TouchableOpacity onPress={confirmDatePicker}>
                <Text style={styles.datePickerDone}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Selected preview */}
            <Text style={styles.datePickerPreview}>
              {`${months.find(m => m.value === pickerMonth)?.label} ${pickerDay}, ${pickerYear}`}
            </Text>

            {/* Column pickers */}
            <View style={styles.datePickerColumns}>
              {/* Month */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerColumnLabel}>Month</Text>
                <FlatList
                  data={months}
                  keyExtractor={(item) => `m-${item.value}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.datePickerList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.datePickerItem,
                        pickerMonth === item.value && styles.datePickerItemActive,
                      ]}
                      onPress={() => setPickerMonth(item.value)}
                    >
                      <Text style={[
                        styles.datePickerItemText,
                        pickerMonth === item.value && styles.datePickerItemTextActive,
                      ]}>
                        {item.label.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* Day */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerColumnLabel}>Day</Text>
                <FlatList
                  data={days}
                  keyExtractor={(item) => `d-${item}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.datePickerList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.datePickerItem,
                        pickerDay === item && styles.datePickerItemActive,
                      ]}
                      onPress={() => setPickerDay(item)}
                    >
                      <Text style={[
                        styles.datePickerItemText,
                        pickerDay === item && styles.datePickerItemTextActive,
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* Year */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerColumnLabel}>Year</Text>
                <FlatList
                  data={years}
                  keyExtractor={(item) => `y-${item}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.datePickerList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.datePickerItem,
                        pickerYear === item && styles.datePickerItemActive,
                      ]}
                      onPress={() => setPickerYear(item)}
                    >
                      <Text style={[
                        styles.datePickerItemText,
                        pickerYear === item && styles.datePickerItemTextActive,
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(255, 248, 240)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 248, 240)',
  },
  loadingText: {
    color: '#555',
    marginTop: 15,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.primary,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Profile Card
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    backgroundColor: 'rgb(255, 248, 240)',
    borderRadius: 10,
    padding: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileMobile: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 8,
  },
  businessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  businessBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },

  // Fields
  fieldContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  fieldLabel: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.4)',
    marginBottom: 4,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  fieldInput: {
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.15)',
  },
  logoutText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.3)',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 10,
  },

  // Custom Date Picker
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  datePickerCancel: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  datePickerDone: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  datePickerPreview: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    paddingVertical: 14,
  },
  datePickerColumns: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    height: 220,
  },
  datePickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  datePickerColumnLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.4)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  datePickerList: {
    flex: 1,
  },
  datePickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 2,
  },
  datePickerItemActive: {
    backgroundColor: colors.primary,
  },
  datePickerItemText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  datePickerItemTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
});

export default SettingsScreen;
