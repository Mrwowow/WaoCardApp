// src/screens/MyEstateScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Platform,
  Share,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, spacing, borderRadius, commonStyles } from '../styles/theme';
import { useNotification } from '../context/NotificationContext';
import useConfirmation from '../hooks/useConfirmation';

// Import optional dependencies with error handling
let Print;
let Sharing;
let ViewShot;

try {
  Print = require('expo-print');
  Sharing = require('expo-sharing');
  ViewShot = require('react-native-view-shot').default;
} catch (err) {
  console.warn('Receipt printing/sharing dependencies not available:', err.message);
}

const MyEstateScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [estateData, setEstateData] = useState(null);
  const [estateNotice, setEstateNotice] = useState(null);
  const [estateBills, setEstateBills] = useState(null);
  const [blockBills, setBlockBills] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  
  // API Endpoints
  const BASE_URL = 'https://estate.waocard.co/api';
  const APP_URL = 'https://www.waobiz.app/api';
  const ESTATE_INFO_ENDPOINT = `${BASE_URL}/fetch_estate_info.php`;
  
  // Initialize notification and confirmation hooks
  const { success, error: showError, info, warning } = useNotification();
  const { confirm, confirmDelete, confirmWarning, ConfirmationComponent } = useConfirmation();
  
  // Modal states
  const [estateSetupModal, setEstateSetupModal] = useState(false);
  const [addGuestModal, setAddGuestModal] = useState(false);
  const [addComplainModal, setAddComplainModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  
  // References for ViewShot
  const receiptViewRef = useRef();
  
  // Form states for estate setup
  const [estates, setEstates] = useState([]);
  const [estateBlocks, setEstateBlocks] = useState([]);
  const [estateBlockUnits, setEstateBlockUnits] = useState([]);
  const [selectedEstate, setSelectedEstate] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [estateEmail, setEstateEmail] = useState('');
  const [estatePassword, setEstatePassword] = useState('');
  
  // Guest invitation states
  const [guestName, setGuestName] = useState('');
  const [guestNumber, setGuestNumber] = useState('');
  const [visitDate, setVisitDate] = useState(new Date());
  const [guestType, setGuestType] = useState('Relation');
  const [totalGuests, setTotalGuests] = useState('1');
  
  // Complaint states
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintType, setComplaintType] = useState('urgent');
  const [complaintDescription, setComplaintDescription] = useState('');

  // Initial mock data (will be replaced by API data)
  const notices = [
    { id: 1, title: 'Estate Notice', description: 'Important information from the estate management.', color: '#ffcccc' },
    { id: 2, title: 'Bill Payment', description: 'Estate Bills are now automated to prevent defaults.', color: '#e6e6fa' },
    { id: 3, title: 'Visitor Management', description: 'Invite guests to your estate with verification.', color: '#ffe4b5' },
  ];

  const bills = [
    { id: 1, type: 'Electric', amount: '15,000.00', status: '0', month: 'April' },
    { id: 2, type: 'Water', amount: '5,000.00', status: '0', month: 'April' },
    { id: 3, type: 'Security', amount: '8,000.00', status: '1', month: 'March' },
  ];

  const renderNoticeCard = (notice) => (
    <View key={notice.id} style={[styles.noticeCard, { backgroundColor: notice.color }]}>
      <View style={styles.noticeContent}>
        <View style={{ width: '80%' }}>
          <Text style={styles.noticeTitle}>{notice.title}</Text>
          <Text style={styles.noticeDescription}>{notice.description}</Text>
          <Text style={styles.noticeDate}>{new Date().toLocaleDateString()}</Text>
        </View>
        <Image 
          source={require('../../assets/images/waocard-icon.png')} 
          style={styles.noticeImage}
        />
      </View>
    </View>
  );

  const renderBillItem = (bill) => {
    const getBillIcon = () => {
      const type = bill.bill_type_name || bill.type;
      if (type === 'Electric') {
        return <Ionicons name="flash" size={20} color="#fff" />;
      } else if (type === 'Water') {
        return <Ionicons name="water" size={20} color="#fff" />;
      } else if (type === 'Security' || type === 'Maintenance') {
        return <Ionicons name="shield" size={20} color="#fff" />;
      } else if (type === 'Cable TV') {
        return <Ionicons name="tv" size={20} color="#fff" />;
      } else if (type === 'Internet') {
        return <Ionicons name="wifi" size={20} color="#fff" />;
      } else {
        return <Ionicons name="home" size={20} color="#fff" />;
      }
    };

    return (
      <View key={bill.id} style={styles.billCard}>
        <View style={styles.billRow}>
          <View style={styles.billIconContainer}>
            <View style={styles.billIcon}>
              {getBillIcon()}
            </View>
          </View>
          <View style={styles.billDetails}>
            <View style={styles.billHeader}>
              <Text style={styles.billTitle}>
                {bill.bill_type_name || bill.type} Bill
              </Text>
              <View style={[
                styles.statusChip,
                { backgroundColor: (bill.bill_status || bill.status) === '0' ? '#ff3b30' : '#4cd964' }
              ]}>
                <Text style={styles.statusText}>
                  {(bill.bill_status || bill.status) === '0' ? 'Due' : 'Paid'}
                </Text>
              </View>
            </View>
            <Text style={styles.billAmount}>₦{formatNumber(bill.total_amount || bill.amount)}</Text>
            <Text style={styles.billPeriod}>{bill.month_name || bill.month}</Text>
            {(bill.bill_status || bill.status) === '0' && bill.issue_date && bill.paid_date && (
              <Text style={styles.billDueDate}>
                {calculateRemainingDays(bill.issue_date, bill.paid_date)}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.billActionButton}
            onPress={() => handleViewInvoice(bill)}
          >
            <Ionicons 
              name={(bill.bill_status || bill.status) === '0' ? 'cash-outline' : 'receipt-outline'} 
              size={20} 
              color="#000" 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // API integration methods
  useEffect(() => {
    loadUserData();
  }, []);
  
  useEffect(() => {
    if (userData) {
      // Always attempt to fetch estate info when user data is available
      fetchEstateInfoFromAPI();
    } else {
      // If no user data, we can't fetch estate info
      setLoading(false);
      fetchEstates(); // Still fetch estates for the setup modal
    }
  }, [userData]);
  
  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('waocard_userData');
      if (userDataString) {
        const parsedUserData = JSON.parse(userDataString);
        setUserData(parsedUserData);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  // Fetch estate info from API using user credentials
  const fetchEstateInfoFromAPI = async () => {
    if (!userData) {
      setLoading(false);
      return;
    }
    
    try {
      // Show loading state
      setLoading(true);
      
      // Get the user's login password - in a real app this might be securely stored
      const userPassword = await AsyncStorage.getItem('waocard_password');
      
      // Use the user's email and password for the estate API
      const formData = new FormData();
      formData.append("r_email", userData.email || "");
      formData.append("r_password", userPassword || "");
      
      // Call the API endpoint
      info('Checking estate information...', { duration: 2000 });
      
      const response = await fetch(ESTATE_INFO_ENDPOINT, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // We have estate data - populate the screen
        const estateInfo = result.data;
        
        // Set estate data with the response
        // Map branch_name as the estate name
        setEstateData({
          branch_id: estateInfo.branch_id || "",
          branch_name: estateInfo.branch_name || "", // This is the estate name
          estate_name: estateInfo.branch_name || "", // Redundant mapping for clarity
          unit_no: estateInfo.r_unit_no || "",
          r_floor_no: estateInfo.r_floor_no || "",
          rid: estateInfo.rid || userData.user_id,
          // Include any other fields from the response
          resident_name: estateInfo.r_name,
          resident_contact: estateInfo.r_contact,
          branch_address: estateInfo.b_address || estateInfo.b_address,
          security_contact: estateInfo.security_guard_mobile,
          secretary_contact: estateInfo.secrataty_mobile,
          moderator_contact: estateInfo.moderator_mobile,
        });
        
        // Fetch related data
        fetchEstateNotice(estateInfo.branch_id);
        fetchEstateBills(estateInfo.branch_id);
        fetchBlockBills(estateInfo.branch_id, estateInfo.rid);
        
        success('Estate information loaded', { 
          title: 'Welcome to ' + (estateInfo.branch_name || 'Your Estate'),
          duration: 3000 
        });
      } else {
        // No estate data or API error - show setup button
        console.log("No estate association found, showing setup option", result);
        setEstateData(null);
        
        // Fetch estates for the setup modal
        fetchEstates();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching estate info:', error);
      
      // API error - show setup button
      setEstateData(null);
      setLoading(false);
      
      // Don't show error, just fetch estates for setup
      fetchEstates();
    }
  };
  
  // Legacy method - kept for compatibility with other code
  const fetchEstateInfo = async () => {
    if (!userData) {
      setLoading(false);
      return;
    }
    
    try {
      const token = await AsyncStorage.getItem('waocard_token');
      
      // Call the modern method instead
      await fetchEstateInfoFromAPI();
    } catch (error) {
      console.error('Error in legacy fetchEstateInfo:', error);
      setLoading(false);
    }
  };

  const fetchEstateNotice = async (branchId) => {
    try {
      // Mock data - would be API call in production
      setEstateNotice({
        notice_title: 'Important Announcement',
        notice_description: 'The estate management will be conducting maintenance on the water supply system on Saturday.',
        created_date: new Date().toLocaleDateString()
      });
    } catch (error) {
      console.error('Error fetching estate notice:', error);
      showError('Failed to load estate notices', {
        title: 'Data Error',
        actionLabel: 'Retry',
        actionOnPress: () => fetchEstateNotice(branchId)
      });
    }
  };

  const fetchEstateBills = async (branchId) => {
    try {
      // Mock data - would be API call in production
      setEstateBills([
        { 
          id: '1', 
          bill_type_name: 'Electric', 
          total_amount: '15000.00', 
          bill_status: "0",
          month_name: 'April',
          issue_date: '2023-04-01',
          paid_date: '2023-04-25'
        },
        { 
          id: '2', 
          bill_type_name: 'Water', 
          total_amount: '5000.00', 
          bill_status: "0",
          month_name: 'April',
          issue_date: '2023-04-01',
          paid_date: '2023-04-25'
        },
        { 
          id: '3', 
          bill_type_name: 'Cable TV', 
          total_amount: '8500.00', 
          bill_status: "0",
          month_name: 'April',
          issue_date: '2023-04-01',
          paid_date: '2023-04-25',
          provider: 'DSTV',
          package: 'Premium'
        },
        { 
          id: '4', 
          bill_type_name: 'Internet', 
          total_amount: '12000.00', 
          bill_status: "0",
          month_name: 'April',
          issue_date: '2023-04-01',
          paid_date: '2023-04-25',
          provider: 'Swift Networks',
          plan: '50Mbps Unlimited'
        },
      ]);
    } catch (error) {
      console.error('Error fetching estate bills:', error);
      setEstateBills('error');
      showError('Failed to load estate bills', {
        title: 'Data Error',
        actionLabel: 'Retry',
        actionOnPress: () => fetchEstateBills(branchId)
      });
    }
  };

  const fetchBlockBills = async (branchId, userId) => {
    try {
      // Mock data - would be API call in production
      setBlockBills([
        { 
          id: '5', 
          bill_type_name: 'Maintenance', 
          total_amount: '12000.00', 
          bill_status: "1",
          month_name: 'March',
          issue_date: '2023-03-01',
          paid_date: '2023-03-25',
          r_name: userData?.first_name + ' ' + userData?.last_name || 'Resident',
          fl_floor: 'Block A',
          u_unit: 'A-101'
        },
        { 
          id: '6', 
          bill_type_name: 'Cable TV', 
          total_amount: '8500.00', 
          bill_status: "1",
          month_name: 'March',
          issue_date: '2023-03-01',
          paid_date: '2023-03-15',
          provider: 'DSTV',
          package: 'Premium',
          r_name: userData?.first_name + ' ' + userData?.last_name || 'Resident',
          fl_floor: 'Block A',
          u_unit: 'A-101'
        },
        { 
          id: '7', 
          bill_type_name: 'Internet', 
          total_amount: '12000.00', 
          bill_status: "1",
          month_name: 'March',
          issue_date: '2023-03-01',
          paid_date: '2023-03-18',
          provider: 'Swift Networks',
          plan: '50Mbps Unlimited',
          r_name: userData?.first_name + ' ' + userData?.last_name || 'Resident',
          fl_floor: 'Block A',
          u_unit: 'A-101'
        },
      ]);
    } catch (error) {
      console.error('Error fetching block bills:', error);
      setBlockBills('error');
      showError('Failed to load block bills', {
        title: 'Data Error',
        actionLabel: 'Retry',
        actionOnPress: () => fetchBlockBills(branchId, userId)
      });
    }
  };

  const fetchEstates = async () => {
    try {
      // Mock data - would be API call in production
      setEstates([
        { branch_id: '001', branch_name: 'WaoCard Estate' },
        { branch_id: '002', branch_name: 'Sunrise Gardens' },
        { branch_id: '003', branch_name: 'Palm Heights' },
      ]);
    } catch (error) {
      console.error('Error fetching estates:', error);
      showError('Failed to load estates list', {
        title: 'Data Error',
        actionLabel: 'Retry',
        actionOnPress: fetchEstates
      });
    }
  };

  const fetchEstateBlocks = async (estateId) => {
    try {
      // Mock data - would be API call in production
      setEstateBlocks([
        { fid: 'A', floor_no: 'Block A' },
        { fid: 'B', floor_no: 'Block B' },
        { fid: 'C', floor_no: 'Block C' },
      ]);
    } catch (error) {
      console.error('Error fetching estate blocks:', error);
      showError('Failed to load blocks', {
        title: 'Data Error',
        actionLabel: 'Retry',
        actionOnPress: () => fetchEstateBlocks(estateId)
      });
    }
  };

  const fetchEstateBlockUnits = async (floorId) => {
    try {
      // Mock data - would be API call in production
      setEstateBlockUnits([
        { uid: 'A101', unit_no: 'A-101' },
        { uid: 'A102', unit_no: 'A-102' },
        { uid: 'A103', unit_no: 'A-103' },
      ]);
    } catch (error) {
      console.error('Error fetching estate block units:', error);
      showError('Failed to load units', {
        title: 'Data Error',
        actionLabel: 'Retry',
        actionOnPress: () => fetchEstateBlockUnits(floorId)
      });
    }
  };

  const handleEstateChange = (estateId) => {
    setSelectedEstate(estateId);
    setSelectedBlock('');
    setSelectedUnit('');
    setEstateBlocks([]);
    setEstateBlockUnits([]);
    fetchEstateBlocks(estateId);
  };

  const handleBlockChange = (blockId) => {
    setSelectedBlock(blockId);
    setSelectedUnit('');
    setEstateBlockUnits([]);
    fetchEstateBlockUnits(blockId);
  };

  const saveTenant = async () => {
    // Validate form inputs first
    if (!selectedEstate) {
      warning('Please select an estate');
      return;
    }
    
    if (!selectedBlock) {
      warning('Please select a block');
      return;
    }
    
    if (!selectedUnit) {
      warning('Please select a unit');
      return;
    }
    
    if (!estateEmail.trim()) {
      warning('Please enter your estate email');
      return;
    }
    
    if (!estatePassword.trim()) {
      warning('Please enter your estate password');
      return;
    }
    
    // In a real implementation, this would call the API
    try {
      // Show loading indicator if needed
      setLoading(true);
      
      // Save estate credentials securely
      await AsyncStorage.setItem('estate_email', estateEmail);
      await AsyncStorage.setItem('estate_password', estatePassword);
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append("r_email", estateEmail);
      formData.append("r_password", estatePassword);
      
      // Call the API to verify credentials and get estate details
      const response = await fetch(ESTATE_INFO_ENDPOINT, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Check if login was successful
      if (result.status === "success" && result.data) {
        // Update the state with the API response data
        setEstateData(result.data);
        
        // Get branch ID from response or fall back to selected
        const branchId = result.data.branch_id || selectedEstate;
        
        // Reload data
        fetchEstateNotice(branchId);
        fetchEstateBills(branchId);
        fetchBlockBills(branchId, userData?.user_id);
        
        // Close modal and show success notification
        setEstateSetupModal(false);
        success('Estate details verified successfully', {
          title: 'Setup Complete',
          duration: 4000,
        });
      } else {
        // Fall back to selected data if API returns error
        console.warn("API verification failed, using form data", result);
        
        // Update the state to reflect the changes
        const estateName = estates.find(e => e.branch_id === selectedEstate)?.branch_name || 'Your Estate';
        setEstateData({
          branch_id: selectedEstate,
          branch_name: estateName, // Using branch_name as the estate name
          estate_name: estateName, // Redundant mapping for clarity
          unit_no: estateBlockUnits.find(u => u.uid === selectedUnit)?.unit_no || 'Your Unit',
          r_floor_no: estateBlocks.find(b => b.fid === selectedBlock)?.floor_no || 'Your Block',
          rid: userData?.user_id,
        });
        
        // Reload data with selected values
        fetchEstateNotice(selectedEstate);
        fetchEstateBills(selectedEstate);
        fetchBlockBills(selectedEstate, userData?.user_id);
        
        // Close modal and show partial success notification
        setEstateSetupModal(false);
        warning('Estate unit registered with limitations', {
          title: 'Setup Partial',
          message: 'Your estate was set up, but API verification failed. Some features may be limited.',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error saving tenant:', error);
      showError('Failed to save tenant information', {
        title: 'Setup Failed',
        duration: 5000,
      });
      
      // Fall back to selected data
      const estateName = estates.find(e => e.branch_id === selectedEstate)?.branch_name || 'Your Estate';
      setEstateData({
        branch_id: selectedEstate,
        branch_name: estateName, // Using branch_name as the estate name
        estate_name: estateName, // Redundant mapping for clarity
        unit_no: estateBlockUnits.find(u => u.uid === selectedUnit)?.unit_no || 'Your Unit',
        r_floor_no: estateBlocks.find(b => b.fid === selectedBlock)?.floor_no || 'Your Block',
        rid: userData?.user_id,
      });
      
      // Reload data with selected values
      fetchEstateNotice(selectedEstate);
      fetchEstateBills(selectedEstate);
      fetchBlockBills(selectedEstate, userData?.user_id);
      
      // Close modal but inform user of limited functionality
      setEstateSetupModal(false);
    } finally {
      setLoading(false);
    }
  };
  
  const inviteGuest = async () => {
    if (!estateData) {
      warning('Please setup your estate first');
      return;
    }
    
    // Validate form inputs
    if (!guestName.trim()) {
      warning('Please enter guest name');
      return;
    }
    
    if (!guestNumber.trim()) {
      warning('Please enter guest mobile number');
      return;
    }
    
    try {
      // Confirm guest invitation before proceeding
      await confirm({
        title: 'Confirm Invitation',
        message: `Are you sure you want to invite ${guestName} on ${visitDate.toLocaleDateString()}?`,
        confirmText: 'Invite',
        type: 'default',
        icon: 'person-add'
      });
      
      // In a real implementation, this would call the API
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Close modal and reset form
      setAddGuestModal(false);
      
      // Reset form
      setGuestName('');
      setGuestNumber('');
      setVisitDate(new Date());
      setGuestType('Relation');
      setTotalGuests('1');
      
      // Show success notification
      success('Guest invitation has been sent', {
        title: 'Invitation Sent',
        duration: 3000,
        actionLabel: 'View Guests',
        actionOnPress: () => {
          // This would navigate to guest list in a real implementation
          info('Navigating to guest list', { duration: 2000 });
        }
      });
    } catch (error) {
      // User canceled or error occurred
      if (error !== false) { // False means user canceled
        console.error('Error inviting guest:', error);
        showError('Failed to invite guest');
      }
    }
  };
  
  const submitComplaint = async () => {
    // Validate form inputs
    if (!complaintTitle.trim()) {
      warning('Please enter a complaint title');
      return;
    }
    
    if (!complaintDescription.trim()) {
      warning('Please provide a complaint description');
      return;
    }
    
    try {
      // Confirm submission if it's an urgent complaint
      if (complaintType === 'urgent') {
        await confirmWarning(
          'You are about to submit an urgent complaint. Estate management will be notified immediately.',
          {
            title: 'Urgent Complaint',
            confirmText: 'Submit Urgent',
            icon: 'warning'
          }
        );
      }
      
      // In a real implementation, this would call the API
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Close modal and show success
      setAddComplainModal(false);
      
      // Reset form
      setComplaintTitle('');
      setComplaintType('urgent');
      setComplaintDescription('');
      
      // Show success notification
      success('Your complaint has been submitted successfully', {
        title: 'Complaint Registered',
        duration: 4000,
        actionLabel: 'View Status',
        actionOnPress: () => {
          // This would navigate to complaint status in a real implementation
          info('Feature coming soon', { duration: 2000 });
        }
      });
    } catch (error) {
      // User canceled or error occurred
      if (error !== false) { // False means user canceled
        console.error('Error submitting complaint:', error);
        showError('Failed to submit complaint');
      }
    }
  };

  const handleViewInvoice = (item) => {
    setInvoiceData(item);
    setReceiptModal(true);
  };

  const handlePayInvoice = async (item) => {
    try {
      // Close the receipt modal
      setReceiptModal(false);
      
      // Show payment confirmation dialog
      await confirm({
        title: 'Confirm Payment',
        message: `You are about to pay ₦${formatNumber(item.total_amount || item.amount)} for ${item.bill_type_name || item.type} bill. Proceed?`,
        confirmText: 'Pay Now',
        type: 'default',
        icon: 'cash'
      });
      
      // This would navigate to payment screen in a real implementation
      // For now, show a notification
      info('Redirecting to payment gateway...', { 
        duration: 2000,
        onDismiss: () => {
          // Navigate to payment screen
          // navigation.navigate('PaymentScreen', { bill: item });
          
          // Simulate successful payment for now
          setTimeout(() => {
            success('Payment successful!', {
              title: 'Payment Complete',
              duration: 4000
            });
          }, 3000);
        }
      });
    } catch (error) {
      // User canceled or error occurred
      if (error !== false) { // False means user canceled
        console.error('Error processing payment:', error);
        showError('Payment process failed', { title: 'Payment Error' });
      }
    }
  };

  const formatNumber = (balance) => {
    balance = parseFloat(balance);
    const parts = balance.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${parts.join('.')}`;
  };

  const calculateRemainingDays = (issueDate, paidDate) => {
    const issue = new Date(issueDate);
    const due = new Date(paidDate);
    const current = new Date();

    let remainingDays = Math.round((due.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

    if (remainingDays < 0) {
      return `Overdue by ${Math.abs(remainingDays)} days.`;
    } else if (remainingDays === 0) {
      return 'Due today!';
    } else {
      return `${remainingDays} days to due date.`;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff9500" />
        <Text style={styles.loadingText}>Loading estate data...</Text>
      </View>
    );
  }

  // Render modals
  const renderEstateSetupModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={estateSetupModal}
      onRequestClose={() => setEstateSetupModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>MyEstate Settings</Text>
            <TouchableOpacity onPress={() => setEstateSetupModal(false)}>
              <Ionicons name="close" size={25} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Choose Estate</Text>
              <View style={styles.pickerContainer}>
                <View style={styles.picker}>
                  {estates.map((estate) => (
                    <TouchableOpacity 
                      key={estate.branch_id} 
                      style={[
                        styles.pickerItem,
                        selectedEstate === estate.branch_id && styles.pickerItemSelected
                      ]}
                      onPress={() => handleEstateChange(estate.branch_id)}
                    >
                      <Text style={styles.pickerItemText}>{estate.branch_name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Choose Block</Text>
              <View style={styles.pickerContainer}>
                <View style={styles.picker}>
                  {estateBlocks.length > 0 ? (
                    estateBlocks.map((block) => (
                      <TouchableOpacity 
                        key={block.fid} 
                        style={[
                          styles.pickerItem,
                          selectedBlock === block.fid && styles.pickerItemSelected
                        ]}
                        onPress={() => handleBlockChange(block.fid)}
                      >
                        <Text style={styles.pickerItemText}>{block.floor_no}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.pickerPlaceholder}>Please select an estate first</Text>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Choose Block Unit</Text>
              <View style={styles.pickerContainer}>
                <View style={styles.picker}>
                  {estateBlockUnits.length > 0 ? (
                    estateBlockUnits.map((unit) => (
                      <TouchableOpacity 
                        key={unit.uid} 
                        style={[
                          styles.pickerItem,
                          selectedUnit === unit.uid && styles.pickerItemSelected
                        ]}
                        onPress={() => setSelectedUnit(unit.uid)}
                      >
                        <Text style={styles.pickerItemText}>{unit.unit_no}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.pickerPlaceholder}>Please select a block first</Text>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Estate Account Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter estate email"
                value={estateEmail}
                onChangeText={setEstateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.formHelpText}>
                This email is used to access your estate information
              </Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Estate Account Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter estate password"
                value={estatePassword}
                onChangeText={setEstatePassword}
                secureTextEntry={true}
              />
              <Text style={styles.formHelpText}>
                Your estate account password for verification
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={saveTenant}
            >
              <Text style={styles.submitButtonText}>Update</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Add Guest Modal
  const renderAddGuestModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addGuestModal}
      onRequestClose={() => setAddGuestModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite Guest</Text>
            <TouchableOpacity onPress={() => setAddGuestModal(false)}>
              <Ionicons name="close" size={25} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={guestName}
                  onChangeText={setGuestName}
                />
              </View>
              
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mobile Number"
                  value={guestNumber}
                  onChangeText={setGuestNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Visit Date</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                >
                  <Text>{visitDate.toISOString().split('T')[0]}</Text>
                  <Ionicons name="calendar" size={18} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Guest Type</Text>
                <View style={styles.pickerContainer}>
                  <View style={styles.picker}>
                    {['Relation', 'Friend', 'Delivery', 'Domestic'].map((type) => (
                      <TouchableOpacity 
                        key={type} 
                        style={[
                          styles.pickerItem,
                          guestType === type && styles.pickerItemSelected
                        ]}
                        onPress={() => setGuestType(type)}
                      >
                        <Text style={styles.pickerItemText}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Total Guests</Text>
              <TextInput
                style={styles.input}
                value={totalGuests}
                onChangeText={setTotalGuests}
                keyboardType="number-pad"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.inviteButton}
              onPress={inviteGuest}
            >
              <Text style={styles.inviteButtonText}>Invite</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Add Complaint Modal
  const renderAddComplainModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addComplainModal}
      onRequestClose={() => setAddComplainModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Register Complaint</Text>
            <TouchableOpacity onPress={() => setAddComplainModal(false)}>
              <Ionicons name="close" size={25} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={complaintTitle}
                onChangeText={setComplaintTitle}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Complaint Type</Text>
              <View style={styles.pickerContainer}>
                <View style={styles.picker}>
                  {['urgent', 'noturgent'].map((type) => (
                    <TouchableOpacity 
                      key={type} 
                      style={[
                        styles.pickerItem,
                        complaintType === type && styles.pickerItemSelected
                      ]}
                      onPress={() => setComplaintType(type)}
                    >
                      <Text style={styles.pickerItemText}>
                        {type === 'urgent' ? 'Urgent' : 'Not Urgent'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={complaintDescription}
                onChangeText={setComplaintDescription}
                multiline={true}
                numberOfLines={4}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={submitComplaint}
            >
              <Text style={styles.submitButtonText}>Send</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Receipt Modal
  const renderReceiptModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={receiptModal}
      onRequestClose={() => setReceiptModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setReceiptModal(false)}
          >
            <Ionicons name="close-circle" size={30} color="#000" />
          </TouchableOpacity>
          
          {invoiceData && (
            <>
              <ScrollView style={styles.receiptContent}>
                {ViewShot ? (
                  <ViewShot 
                    ref={receiptViewRef} 
                    options={{ format: "jpg", quality: 0.9 }}
                    style={styles.receiptViewShot}
                  >
                    <View style={[
                      styles.receiptHeader, 
                      { backgroundColor: (invoiceData.bill_status || invoiceData.status) === "0" ? '#ff3b30' : '#4cd964' }
                    ]}>
                      <View style={styles.receiptRow}>
                        <View>
                          <Text style={styles.receiptHeaderTitle}>
                            {invoiceData.bill_type_name || invoiceData.type} Bill
                          </Text>
                          <Text style={styles.receiptHeaderSubtitle}>
                            {estateData?.branch_name || 'Your Estate'}
                          </Text>
                          <Text style={[styles.receiptHeaderSubtitle, styles.smallText]}>
                            Invoice #: {invoiceData.id}
                          </Text>
                        </View>
                        <View style={styles.receiptHeaderRight}>
                          <Text style={styles.receiptHeaderTitle}>
                            <Ionicons name="checkmark-circle" size={18} color="#fff" /> 
                            {(invoiceData.bill_status || invoiceData.status) === "0" ? 'Due' : 'Paid'}
                          </Text>
                          <Text style={styles.receiptHeaderSubtitle}>
                            <Text style={styles.bold}>
                              ₦{formatNumber(invoiceData.total_amount || invoiceData.amount)}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.receiptBody}>
                      {/* Tenant Info Card */}
                      <View style={styles.tenantInfoCard}>
                        <Text style={styles.tenantName}>
                          {userData?.first_name} {userData?.last_name || 'Resident'}
                        </Text>
                        <Text style={styles.tenantAddress}>
                          {estateData?.r_floor_no || 'Your Block'}, {estateData?.unit_no || 'Your Unit'}
                        </Text>
                        <Text style={styles.estateName}>
                          {estateData?.branch_name || 'Your Estate'}
                        </Text>
                      </View>
                      
                      <View style={styles.receiptSection}>
                        <View style={styles.receiptColumn}>
                          <Text style={styles.receiptSectionTitle}>Bill Details:</Text>
                          <Text style={styles.receiptDetail}>
                            <Text style={styles.bold}>Type:</Text> {invoiceData.bill_type_name || invoiceData.type}
                          </Text>
                          {invoiceData.provider && (
                            <Text style={styles.receiptDetail}>
                              <Text style={styles.bold}>Provider:</Text> {invoiceData.provider}
                            </Text>
                          )}
                          {invoiceData.package && (
                            <Text style={styles.receiptDetail}>
                              <Text style={styles.bold}>Package:</Text> {invoiceData.package}
                            </Text>
                          )}
                          {invoiceData.plan && (
                            <Text style={styles.receiptDetail}>
                              <Text style={styles.bold}>Plan:</Text> {invoiceData.plan}
                            </Text>
                          )}
                          <Text style={styles.receiptDetail}>
                            <Text style={styles.bold}>Month:</Text> {invoiceData.month_name || invoiceData.month}
                          </Text>
                          <Text style={styles.receiptDetail}>
                            <Text style={styles.bold}>Status:</Text> <Text style={[
                              styles.statusText, 
                              { color: (invoiceData.bill_status || invoiceData.status) === "0" ? '#ff3b30' : '#4cd964' }
                            ]}>
                              {(invoiceData.bill_status || invoiceData.status) === "0" ? 'Unpaid' : 'Paid'}
                            </Text>
                          </Text>
                          <Text style={styles.receiptDetail}>
                            <Text style={styles.bold}>Date:</Text> {new Date().toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      
                      {(invoiceData.bill_status || invoiceData.status) === "0" && (
                        <TouchableOpacity 
                          style={[
                            styles.receiptButton,
                            { backgroundColor: '#000' }
                          ]}
                          onPress={() => handlePayInvoice(invoiceData)}
                        >
                          <Text style={styles.receiptButtonText}>
                            Pay Now
                          </Text>
                          <Ionicons 
                            name="cash" 
                            size={20} 
                            color="#fff" 
                            style={{ marginLeft: 10 }}
                          />
                        </TouchableOpacity>
                      )}
                      
                      <View style={styles.receiptFooter}>
                        <Text style={styles.receiptFooterText}>
                          Generated via WaoCard Mobile App
                        </Text>
                        <Text style={styles.receiptFooterText}>
                          {new Date().toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </ViewShot>
                ) : (
                  <View style={styles.receiptViewShot}>
                    <View style={[
                      styles.receiptHeader, 
                      { backgroundColor: (invoiceData.bill_status || invoiceData.status) === "0" ? '#ff3b30' : '#4cd964' }
                    ]}>
                      <View style={styles.receiptRow}>
                        <View>
                          <Text style={styles.receiptHeaderTitle}>
                            {invoiceData.bill_type_name || invoiceData.type} Bill
                          </Text>
                          <Text style={styles.receiptHeaderSubtitle}>
                            {estateData?.branch_name || 'Your Estate'}
                          </Text>
                          <Text style={[styles.receiptHeaderSubtitle, styles.smallText]}>
                            Invoice #: {invoiceData.id}
                          </Text>
                        </View>
                        <View style={styles.receiptHeaderRight}>
                          <Text style={styles.receiptHeaderTitle}>
                            <Ionicons name="checkmark-circle" size={18} color="#fff" /> 
                            {(invoiceData.bill_status || invoiceData.status) === "0" ? 'Due' : 'Paid'}
                          </Text>
                          <Text style={styles.receiptHeaderSubtitle}>
                            <Text style={styles.bold}>
                              ₦{formatNumber(invoiceData.total_amount || invoiceData.amount)}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.receiptBody}>
                      {/* Tenant Info Card */}
                      <View style={styles.tenantInfoCard}>
                        <Text style={styles.tenantName}>
                          {userData?.first_name} {userData?.last_name || 'Resident'}
                        </Text>
                        <Text style={styles.tenantAddress}>
                          {estateData?.r_floor_no || 'Your Block'}, {estateData?.unit_no || 'Your Unit'}
                        </Text>
                        <Text style={styles.estateName}>
                          {estateData?.branch_name || 'Your Estate'}
                        </Text>
                      </View>
                      
                      <View style={styles.receiptSection}>
                        <View style={styles.receiptColumn}>
                          <Text style={styles.receiptSectionTitle}>Bill Details:</Text>
                          <Text style={styles.receiptDetail}>
                            <Text style={styles.bold}>Type:</Text> {invoiceData.bill_type_name || invoiceData.type}
                          </Text>
                          {invoiceData.provider && (
                            <Text style={styles.receiptDetail}>
                              <Text style={styles.bold}>Provider:</Text> {invoiceData.provider}
                            </Text>
                          )}
                          {invoiceData.package && (
                            <Text style={styles.receiptDetail}>
                              <Text style={styles.bold}>Package:</Text> {invoiceData.package}
                            </Text>
                          )}
                          {invoiceData.plan && (
                            <Text style={styles.receiptDetail}>
                              <Text style={styles.bold}>Plan:</Text> {invoiceData.plan}
                            </Text>
                          )}
                          <Text style={styles.receiptDetail}>
                            <Text style={styles.bold}>Month:</Text> {invoiceData.month_name || invoiceData.month}
                          </Text>
                          <Text style={styles.receiptDetail}>
                            <Text style={styles.bold}>Status:</Text> <Text style={[
                              styles.statusText, 
                              { color: (invoiceData.bill_status || invoiceData.status) === "0" ? '#ff3b30' : '#4cd964' }
                            ]}>
                              {(invoiceData.bill_status || invoiceData.status) === "0" ? 'Unpaid' : 'Paid'}
                            </Text>
                          </Text>
                          <Text style={styles.receiptDetail}>
                            <Text style={styles.bold}>Date:</Text> {new Date().toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      
                      {(invoiceData.bill_status || invoiceData.status) === "0" && (
                        <TouchableOpacity 
                          style={[
                            styles.receiptButton,
                            { backgroundColor: '#000' }
                          ]}
                          onPress={() => handlePayInvoice(invoiceData)}
                        >
                          <Text style={styles.receiptButtonText}>
                            Pay Now
                          </Text>
                          <Ionicons 
                            name="cash" 
                            size={20} 
                            color="#fff" 
                            style={{ marginLeft: 10 }}
                          />
                        </TouchableOpacity>
                      )}
                      
                      <View style={styles.receiptFooter}>
                        <Text style={styles.receiptFooterText}>
                          Generated via WaoCard Mobile App
                        </Text>
                        <Text style={styles.receiptFooterText}>
                          {new Date().toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
              
              {/* Receipt Actions */}
              <View style={styles.receiptActions}>
                <TouchableOpacity 
                  style={styles.receiptActionButton}
                  onPress={() => printReceipt(invoiceData)}
                >
                  <Ionicons name="print-outline" size={24} color="#000" />
                  <Text style={styles.receiptActionText}>Print</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.receiptActionButton}
                  onPress={shareReceipt}
                >
                  <Ionicons name="share-social-outline" size={24} color="#000" />
                  <Text style={styles.receiptActionText}>Share</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.receiptActionButton}
                  onPress={() => exportReceiptAsPDF(invoiceData)}
                >
                  <Ionicons name="document-outline" size={24} color="#000" />
                  <Text style={styles.receiptActionText}>PDF</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // Emergency contact handlers
  const handleEmergencyContact = async (type) => {
    setHelpModal(false);
    
    try {
      await confirmWarning(
        `This will send an emergency alert to ${type}. Do you want to proceed?`,
        {
          title: 'Emergency Alert',
          confirmText: 'Send Alert',
          icon: 'alert-circle',
        }
      );
      
      // Show loading notification
      info(`Contacting ${type}...`, {
        duration: 2000,
        onDismiss: () => {
          // Show success notification after "contacting"
          success(`Emergency alert sent to ${type}`, {
            title: 'Alert Sent',
            duration: 5000,
            actionLabel: 'Track Response',
            actionOnPress: () => handleTrackResponse(type)
          });
        }
      });
    } catch (error) {
      // User canceled or error occurred
      if (error !== false) {
        showError(`Failed to contact ${type}`);
      }
    }
  };
  
  const handleTrackResponse = (type) => {
    // This would show a real-time tracking UI in a real implementation
    info('Response tracking will be available soon', { duration: 3000 });
  };
  
  // Generate HTML for receipt printing
  const generateReceiptHTML = (item) => {
    const isPaid = (item.bill_status || item.status) === "1";
    const estateName = estateData?.branch_name || estateData?.estate_name || 'Your Estate';
    const blockName = estateData?.r_floor_no || 'Your Block';
    const unitName = estateData?.unit_no || 'Your Unit';
    const residentName = estateData?.resident_name || userData?.first_name + ' ' + userData?.last_name || 'Resident';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .receipt {
            max-width: 400px;
            margin: 0 auto;
            border: 1px solid #ddd;
            border-radius: 10px;
            overflow: hidden;
          }
          .receipt-header {
            background-color: ${isPaid ? '#4cd964' : '#ff3b30'};
            color: white;
            padding: 15px;
            position: relative;
          }
          .receipt-title {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
          }
          .receipt-subtitle {
            font-size: 16px;
            margin-top: 5px;
            font-weight: normal;
          }
          .receipt-id {
            font-size: 14px;
            margin-top: 5px;
          }
          .receipt-status {
            position: absolute;
            top: 15px;
            right: 15px;
            background-color: rgba(255,255,255,0.2);
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 14px;
          }
          .receipt-body {
            padding: 20px;
            background-color: white;
          }
          .receipt-section {
            margin-bottom: 20px;
          }
          .receipt-section-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #666;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 1px;
          }
          .receipt-detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .receipt-label {
            color: #666;
          }
          .receipt-value {
            font-weight: 500;
          }
          .receipt-amount {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 15px 0;
          }
          .receipt-footer {
            padding: 15px 20px;
            background-color: #f9f9f9;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
          .logo {
            text-align: center;
            margin-bottom: 15px;
          }
          .tenant-info {
            text-align: center;
            margin-bottom: 15px;
            padding: 15px;
            background-color: #f8f8f8;
            border-radius: 8px;
            border: 1px dashed #ddd;
          }
          .tenant-name {
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }
          .tenant-address {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .estate-name {
            font-size: 15px;
            font-weight: 500;
            color: #555;
            margin-top: 5px;
          }
          .highlight {
            font-weight: bold;
            color: ${isPaid ? '#4cd964' : '#ff3b30'};
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header">
            <h1 class="receipt-title">${item.bill_type_name || item.type} Bill</h1>
            <div class="receipt-subtitle">${estateName}</div>
            <div class="receipt-id">Invoice #${item.id}</div>
            <div class="receipt-status">${isPaid ? 'PAID' : 'UNPAID'}</div>
          </div>
          
          <div class="receipt-body">
            <div class="logo">
              <div style="font-size: 26px; font-weight: bold; color: #000;">
                Wao<span style="font-weight: normal; opacity: 0.7;">Card</span>
              </div>
            </div>
            
            <div class="tenant-info">
              <div class="tenant-name">${residentName}</div>
              <div class="tenant-address">${blockName}, ${unitName}</div>
              <div class="estate-name">${estateName}</div>
            </div>
            
            <div class="receipt-amount">
              ₦${formatNumber(item.total_amount || item.amount)}
            </div>
            
            <div class="receipt-section">
              <div class="receipt-section-title">Bill Details</div>
              <div class="receipt-detail">
                <span class="receipt-label">Bill Type:</span>
                <span class="receipt-value">${item.bill_type_name || item.type}</span>
              </div>
              ${item.provider ? `
              <div class="receipt-detail">
                <span class="receipt-label">Provider:</span>
                <span class="receipt-value">${item.provider}</span>
              </div>
              ` : ''}
              ${item.package ? `
              <div class="receipt-detail">
                <span class="receipt-label">Package:</span>
                <span class="receipt-value">${item.package}</span>
              </div>
              ` : ''}
              ${item.plan ? `
              <div class="receipt-detail">
                <span class="receipt-label">Plan:</span>
                <span class="receipt-value">${item.plan}</span>
              </div>
              ` : ''}
              <div class="receipt-detail">
                <span class="receipt-label">Month:</span>
                <span class="receipt-value">${item.month_name || item.month}</span>
              </div>
              <div class="receipt-detail">
                <span class="receipt-label">Status:</span>
                <span class="receipt-value highlight">
                  ${isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <div class="receipt-detail">
                <span class="receipt-label">Date:</span>
                <span class="receipt-value">${new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            <div class="receipt-section">
              <div class="receipt-section-title">Estate Details</div>
              <div class="receipt-detail">
                <span class="receipt-label">Estate:</span>
                <span class="receipt-value">${estateName}</span>
              </div>
              <div class="receipt-detail">
                <span class="receipt-label">Block:</span>
                <span class="receipt-value">${blockName}</span>
              </div>
              <div class="receipt-detail">
                <span class="receipt-label">Unit:</span>
                <span class="receipt-value">${unitName}</span>
              </div>
            </div>
            
            <div class="receipt-section">
              <div class="receipt-section-title">Resident Information</div>
              <div class="receipt-detail">
                <span class="receipt-label">Name:</span>
                <span class="receipt-value">${residentName}</span>
              </div>
              <div class="receipt-detail">
                <span class="receipt-label">Account:</span>
                <span class="receipt-value">${userData?.user_id || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div class="receipt-footer">
            Generated via WaoCard Mobile App on ${new Date().toLocaleString()}
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  // Print receipt function
  const printReceipt = async (item) => {
    // Check if Print is available
    if (!Print) {
      showError('Printing functionality is not available', { 
        title: 'Feature Unavailable',
        duration: 3000 
      });
      return;
    }
    
    try {
      info('Preparing receipt for printing...', { duration: 2000 });
      
      const html = generateReceiptHTML(item);
      
      // iOS and Android have different print behaviors
      if (Platform.OS === 'ios') {
        await Print.printAsync({
          html,
          printerUrl: undefined,
        });
      } else {
        // On Android, usually saves as PDF first
        const { uri } = await Print.printToFileAsync({ html });
        await Print.printAsync({
          uri,
          printerUrl: undefined,
        });
      }
      
      success('Receipt sent to printer', { duration: 3000 });
    } catch (error) {
      console.error('Error printing receipt:', error);
      showError('Failed to print receipt', { duration: 3000 });
    }
  };
  
  // Share receipt function using ViewShot
  const shareReceipt = async () => {
    // Check if ViewShot is available
    if (!ViewShot || !receiptViewRef.current) {
      // Fallback to basic sharing if possible
      if (invoiceData) {
        try {
          const message = `WaoCard Receipt\n\nBill Type: ${invoiceData.bill_type_name || invoiceData.type}\nAmount: ₦${formatNumber(invoiceData.total_amount || invoiceData.amount)}\nStatus: ${(invoiceData.bill_status || invoiceData.status) === "0" ? 'Unpaid' : 'Paid'}\nMonth: ${invoiceData.month_name || invoiceData.month}`;
          
          await Share.share({
            message,
            title: 'WaoCard Receipt',
          });
          return;
        } catch (error) {
          showError('Unable to share receipt', { duration: 3000 });
          return;
        }
      } else {
        showError('Unable to share receipt', { duration: 3000 });
        return;
      }
    }
    
    try {
      info('Preparing receipt for sharing...', { duration: 2000 });
      
      // Capture the ViewShot component
      const uri = await receiptViewRef.current.capture();
      
      if (Platform.OS === 'ios') {
        // On iOS we can use Share API
        await Share.share({
          url: uri,
          title: 'WaoCard Receipt',
        });
      } else {
        // On Android use Sharing API from expo
        if (Sharing && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          // Fallback to basic Share API
          await Share.share({
            message: 'WaoCard Receipt',
            title: 'WaoCard Receipt',
          });
        }
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
      showError('Failed to share receipt', { duration: 3000 });
    }
  };
  
  // Export receipt as PDF function
  const exportReceiptAsPDF = async (item) => {
    // Check if PDF export is available
    if (!Print || !Sharing) {
      showError('PDF export functionality is not available', { 
        title: 'Feature Unavailable',
        duration: 3000 
      });
      return;
    }
    
    try {
      info('Preparing PDF export...', { duration: 2000 });
      
      const html = generateReceiptHTML(item);
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save or share your receipt',
          UTI: 'com.adobe.pdf'
        });
        
        success('Receipt exported successfully', { duration: 3000 });
      } else {
        showError('PDF export is not available on this device', { duration: 3000 });
      }
    } catch (error) {
      console.error('Error exporting receipt as PDF:', error);
      showError('Failed to export receipt', { duration: 3000 });
    }
  };
  
  // Help/Emergency Modal
  const renderHelpModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={helpModal}
      onRequestClose={() => setHelpModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.helpModalContainer}>
          <Text style={styles.helpModalTitle}>
            <Text style={styles.helpModalTitleLight}>Emergency</Text>{'\n'}Flash!
          </Text>
          
          <View style={styles.helpButtonRow}>
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => handleEmergencyContact('Estate Security')}
            >
              <View style={styles.helpButtonIcon}>
                <Ionicons name="shield" size={24} color="#fff" />
              </View>
              <Text style={styles.helpButtonText}>Estate Security</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => handleEmergencyContact('Estate Committee')}
            >
              <View style={styles.helpButtonIcon}>
                <Ionicons name="people" size={24} color="#fff" />
              </View>
              <Text style={styles.helpButtonText}>Estate Committee</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => handleEmergencyContact('Family & Friends')}
            >
              <View style={styles.helpButtonIcon}>
                <Ionicons name="heart" size={24} color="#fff" />
              </View>
              <Text style={styles.helpButtonText}>Family & Friends</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.closeHelpButton}
            onPress={() => setHelpModal(false)}
          >
            <Text style={styles.closeHelpButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            My<Text style={styles.titleLight}> Estate</Text>
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setHelpModal(true)}
          >
            <Ionicons name="alert-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setEstateSetupModal(true)}
          >
            <Ionicons name="home-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Estate Header Section */}
        <View style={styles.estateHeaderSection}>
          {estateData ? (
            <>
              {/* Estate Name with Badge when estate data exists */}
              <View style={styles.estateName}>
                <Text style={styles.estateNameText}>
                  {estateData.branch_name || estateData.estate_name || "Your Estate"}
                </Text>
                <View style={styles.estateInfoBadge}>
                  <Text style={styles.estateBadgeText}>
                    {estateData.r_floor_no}, {estateData.unit_no}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Welcome message with setup button when no estate data */}
              <View style={styles.welcomeRow}>
                <Text style={styles.estateNameText}>
                  Welcome to MyEstate
                </Text>
              </View>
              <View style={styles.setupButtonContainer}>
                <TouchableOpacity 
                  style={styles.setupButton}
                  onPress={() => setEstateSetupModal(true)}
                >
                  <Text style={styles.setupButtonText}>
                    Setup Your Estate
                  </Text>
                  <Ionicons name="arrow-forward-circle" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        
        {/* Estate Details - only shown when estate data is available */}
        {estateData && estateData.branch_address && (
          <View style={styles.estateDetailsCard}>
            <View style={styles.estateDetailRow}>
              <Ionicons name="location" size={18} color="#ff9500" />
              <Text style={styles.estateDetailText}>{estateData.branch_address}</Text>
            </View>
            
            {estateData.resident_name && (
              <View style={styles.estateDetailRow}>
                <Ionicons name="person" size={18} color="#ff9500" />
                <Text style={styles.estateDetailText}>{estateData.resident_name}</Text>
              </View>
            )}
            
            {estateData.security_contact && (
              <View style={styles.estateDetailRow}>
                <Ionicons name="shield" size={18} color="#ff9500" />
                <Text style={styles.estateDetailText}>Security: {estateData.security_contact}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Estate Services */}
        <View style={styles.servicesContainer}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.servicesScroll}
          >
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigation.navigate('AirtimeScreen')}
            >
              <View style={styles.serviceCardInner}>
                <View style={styles.serviceIconBox}>
                  <Ionicons name="phone-portrait" size={24} color="#000" />
                </View>
                <Text style={styles.serviceText}>Airtime</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigation.navigate('PaymentsScreen')}
            >
              <View style={styles.serviceCardInner}>
                <View style={styles.serviceIconBox}>
                  <Ionicons name="flash" size={24} color="#000" />
                </View>
                <Text style={styles.serviceText}>Electricity</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigation.navigate('PaymentsScreen')}
            >
              <View style={styles.serviceCardInner}>
                <View style={styles.serviceIconBox}>
                  <Ionicons name="wifi" size={24} color="#000" />
                </View>
                <Text style={styles.serviceText}>Internet</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Estate Notices */}
        {estateNotice ? (
          <View style={[styles.noticeCard, { backgroundColor: '#ffcccc' }]}>
            <View style={styles.noticeContent}>
              <View style={{ width: '80%' }}>
                <Text style={styles.noticeTitle}>{estateNotice.notice_title}</Text>
                <Text style={styles.noticeDescription}>{estateNotice.notice_description}</Text>
                <Text style={styles.noticeDate}>{estateNotice.created_date}</Text>
              </View>
              <Image 
                source={require('../../assets/images/waocard-icon.png')} 
                style={styles.noticeImage}
              />
            </View>
          </View>
        ) : (
          <ScrollView 
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.noticeContainer}
          >
            {notices.map(notice => renderNoticeCard(notice))}
          </ScrollView>
        )}
        
        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setAddGuestModal(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255, 149, 0, 0.2)' }]}>
                <Ionicons name="person-add" size={22} color="#ff9500" />
              </View>
              <Text style={styles.quickActionText}>Add Visitor</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => info('Loading committee information...', {
                title: 'Estate Committee',
                duration: 2000,
                onDismiss: () => {
                  // This would show committee info in a real implementation
                  // For now we'll just show another notification
                  success('Committee information loaded', {
                    title: 'Estate Committee',
                    actionLabel: 'View Details',
                    actionOnPress: () => {
                      // This would navigate to committee details screen
                      info('Committee details coming soon', { duration: 2000 });
                    }
                  });
                }
              })}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(76, 217, 100, 0.2)' }]}>
                <Ionicons name="people" size={22} color="#4cd964" />
              </View>
              <Text style={styles.quickActionText}>Committee</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setAddComplainModal(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(76, 217, 100, 0.2)' }]}>
                <Ionicons name="chatbox-ellipses" size={22} color="#4cd964" />
              </View>
              <Text style={styles.quickActionText}>Complain</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setHelpModal(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255, 59, 48, 0.2)' }]}>
                <Ionicons name="alert-circle" size={22} color="#ff3b30" />
              </View>
              <Text style={styles.quickActionText}>Emergency</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Estate Bills */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Estate Bills</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>All</Text>
          </TouchableOpacity>
        </View>
        
        {estateBills === null ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="wallet-outline" size={40} color="#ddd" />
            </View>
            <Text style={styles.emptyTitle}>Loading Bills</Text>
            <Text style={styles.emptyText}>
              We're preparing your estate bill information.
            </Text>
            <View style={styles.emptyActionContainer}>
              <ActivityIndicator size="small" color="#ff9500" style={{marginRight: 8}} />
              <Text style={styles.emptySubtext}>Please wait a moment...</Text>
            </View>
          </View>
        ) : estateBills === 'error' ? (
          <TouchableOpacity 
            style={styles.errorContainer}
            onPress={() => fetchEstateBills(estateData?.branch_id)}
          >
            <Ionicons name="refresh-circle" size={24} color="#ff3b30" />
            <Text style={styles.errorText}>Tap to retry loading bills</Text>
          </TouchableOpacity>
        ) : estateBills.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="receipt-outline" size={40} color="#ddd" />
            </View>
            <Text style={styles.emptyTitle}>No Estate Bills</Text>
            <Text style={styles.emptyText}>
              You don't have any estate bills at the moment.
            </Text>
            <Text style={styles.emptySubtext}>
              Bills for utilities and services will appear here when available.
            </Text>
          </View>
        ) : (
          <View style={styles.billsList}>
            {estateBills.map(bill => renderBillItem(bill))}
          </View>
        )}
        
        {/* Block/Flat Bills */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Block/Flat Bills</Text>
        </View>
        
        {blockBills === null ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="business-outline" size={40} color="#ddd" />
            </View>
            <Text style={styles.emptyTitle}>Loading Block Bills</Text>
            <Text style={styles.emptyText}>
              We're retrieving your building's bill information.
            </Text>
            <View style={styles.emptyActionContainer}>
              <ActivityIndicator size="small" color="#ff9500" style={{marginRight: 8}} />
              <Text style={styles.emptySubtext}>Please wait a moment...</Text>
            </View>
          </View>
        ) : blockBills === 'error' ? (
          <TouchableOpacity 
            style={styles.errorContainer}
            onPress={() => fetchBlockBills(estateData?.branch_id, userData?.user_id)}
          >
            <Ionicons name="refresh-circle" size={24} color="#ff3b30" />
            <Text style={styles.errorText}>Tap to retry loading block bills</Text>
          </TouchableOpacity>
        ) : blockBills.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="home-outline" size={40} color="#ddd" />
            </View>
            <Text style={styles.emptyTitle}>No Block or Flat Bills</Text>
            <Text style={styles.emptyText}>
              You don't have any block or flat bills at the moment.
            </Text>
            <Text style={styles.emptySubtext}>
              Bills for building maintenance and common areas will appear here when available.
            </Text>
          </View>
        ) : (
          <View style={styles.billsList}>
            {blockBills.map(bill => renderBillItem(bill))}
          </View>
        )}
      </ScrollView>
      
      {/* Render all modals */}
      {renderEstateSetupModal()}
      {renderAddGuestModal()}
      {renderAddComplainModal()}
      {renderReceiptModal()}
      {renderHelpModal()}
      
      {/* Render the confirmation component */}
      <ConfirmationComponent />
    </SafeAreaView>
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    padding: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  titleLight: {
    fontWeight: '300',
    color: '#ccc',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  estateName: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estateHeaderSection: {
    marginVertical: 10,
  },
  welcomeRow: {
    marginBottom: 10,
  },
  setupButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  estateNameText: {
    fontSize: 18,
    fontWeight: '600',
  },
  setupButton: {
    backgroundColor: '#ff9500',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 5,
  },
  estateInfoBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  estateBadgeText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  estateDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  estateDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  estateDetailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  servicesContainer: {
    marginBottom: 15,
  },
  servicesScroll: {
    flexDirection: 'row',
  },
  serviceCard: {
    width: 100,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceCardInner: {
    alignItems: 'center',
    padding: 10,
  },
  serviceIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#ff9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  serviceText: {
    fontSize: 12,
    color: '#333',
  },
  noticeContainer: {
    height: 120,
    marginBottom: 15,
  },
  noticeCard: {
    height: 120,
    width: 300,
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  noticeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noticeDescription: {
    fontSize: 14,
    marginBottom: 10,
  },
  noticeDate: {
    fontSize: 12,
    color: '#000',
    backgroundColor: '#fff',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  noticeImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  quickActionsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickActionButton: {
    alignItems: 'center',
    width: '23%',
    marginBottom: 10,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 10,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLink: {
    fontSize: 14,
    color: '#666',
  },
  billsList: {
    marginBottom: 15,
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billIconContainer: {
    marginRight: 10,
  },
  billIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  billDetails: {
    flex: 1,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  billPeriod: {
    fontSize: 12,
    color: '#666',
  },
  billDueDate: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 3,
  },
  billActionButton: {
    backgroundColor: '#ff9500',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff9500',
  },
  modalContent: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  formColumn: {
    flex: 1,
    marginRight: 10,
  },
  formLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    padding: 5,
  },
  pickerItem: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#ff9500',
  },
  pickerItemText: {
    fontSize: 14,
  },
  pickerPlaceholder: {
    padding: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  inviteButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  receiptContent: {
    paddingBottom: 20,
  },
  receiptHeader: {
    padding: 15,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  receiptHeaderSubtitle: {
    fontSize: 14,
    color: '#fff',
  },
  receiptHeaderRight: {
    alignItems: 'flex-end',
  },
  receiptBody: {
    padding: 15,
  },
  receiptSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  receiptColumn: {
    flex: 1,
  },
  receiptSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  receiptDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  bold: {
    fontWeight: 'bold',
  },
  receiptButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  receiptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  receiptFooter: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    alignItems: 'center',
  },
  receiptFooterText: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  receiptViewShot: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tenantInfoCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderStyle: 'dashed',
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  tenantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tenantAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  estateName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginTop: 4,
  },
  smallText: {
    fontSize: 12,
    opacity: 0.9,
  },
  statusText: {
    fontWeight: 'bold',
  },
  formHelpText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  receiptActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  receiptActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  receiptActionText: {
    fontSize: 12,
    color: '#000',
    marginTop: 4,
    fontWeight: '500',
  },
  helpModalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  helpModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  helpModalTitleLight: {
    fontWeight: '300',
    color: '#666',
  },
  helpButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  helpButton: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 15,
  },
  helpButtonIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpButtonText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  closeHelpButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  closeHelpButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  
  // Error and empty states
  loader: {
    marginVertical: 20,
    alignSelf: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 10,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    marginLeft: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});

export default MyEstateScreen;