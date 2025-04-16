import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useNotification } from '../context/NotificationContext';
import useConfirmation from '../hooks/useConfirmation';

// Conditionally import Camera based on if it's installed
let Camera = null;
try {
  Camera = require('expo-camera').Camera;
} catch (error) {
  console.log('Camera module not available');
}

const { width, height } = Dimensions.get('window');

const AddCardScreen = ({ navigation, route }) => {
  // Get notification and confirmation hooks
  const notification = useNotification();
  const { confirm, confirmDelete, ConfirmationComponent } = useConfirmation();
  
 // Get parameters passed in navigation
  const { onAddCard, cardTypes } = route.params || {};
  
  // Form state
  const [cardType, setCardType] = useState('payment');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardIssuer, setCardIssuer] = useState('');
  const [cardLogo, setCardLogo] = useState(null);
  const [cardNetwork, setCardNetwork] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState('');
  const [giftCardBalance, setGiftCardBalance] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  
  // Check camera permissions when needed
  useEffect(() => {
    if (isCameraVisible && Camera) {
      (async () => {
        try {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(status === 'granted');
        } catch (error) {
          console.log('Camera permission error:', error);
          setHasPermission(false);
        }
      })();
    }
  }, [isCameraVisible]);
  
  // Handle back/close with confirmation
  const handleClose = async () => {
    // If form is empty, just go back
    if (currentStep === 1 && !cardType) {
      navigation.goBack();
      return;
    }
    
    // If any fields are filled, ask for confirmation before discarding
    if (currentStep === 2 && (cardName || cardNumber || cardHolderName || cardIssuer)) {
      try {
        await confirm({
          title: 'Discard Changes',
          message: 'You have unsaved changes. Are you sure you want to go back? All data will be lost.',
          confirmText: 'Discard',
          cancelText: 'Keep Editing',
          type: 'warning',
          icon: 'alert-circle'
        });
        
        // User confirmed discard
        navigation.goBack();
      } catch (error) {
        // User canceled discard, do nothing
      }
    } else {
      navigation.goBack();
    }
  };
  
  // Handle navigation between steps
    const handleNextStep = () => {
        if (currentStep === 1) {
            // First step logic remains the same
            if (!cardType) {
                notification.error('Please select a card type', {
                    actionLabel: 'Select',
                    actionOnPress: () => {
                        // Focus on card type section
                    }
                });
                return;
            }

            setCurrentStep(2);
            notification.info(`Adding new ${getCardTypeName(cardType)}`, {
                title: 'Step 2 of 2',
                animPattern: 'FADE_IN'
            });
        } else if (currentStep === 2) {
            // Form validation remains the same
            if (!cardName) {
                notification.error('Please enter a card name', {
                    actionLabel: 'OK'
                });
                return;
            }

            // Validate card-specific required fields
            if (cardType === 'payment') {
                if (!cardNumber || !cardHolderName) {
                    notification.error('Please fill in all required fields', {
                        title: 'Missing Information',
                        actionLabel: 'Review'
                    });
                    return;
                }
            }

            // Collect card data based on type
            const newCard = {
                type: cardType,
                name: cardName,
                issuer: cardIssuer,
                logo: cardLogo,
            };

            // Add card-specific fields (this stays the same)
            switch (cardType) {
                case 'payment':
                    newCard.number = cardNumber;
                    newCard.holderName = cardHolderName;
                    newCard.expiry = cardExpiry;
                    newCard.cvv = cardCVV;
                    newCard.network = cardNetwork;
                    break;
        case 'loyalty':
          newCard.number = cardNumber;
          newCard.points = loyaltyPoints;
          break;
        case 'gift':
          newCard.number = cardNumber;
          newCard.balance = giftCardBalance;
          break;
        case 'ticket':
          newCard.number = cardNumber;
          newCard.date = eventDate;
          newCard.location = eventLocation;
          break;
        default:
                    newCard.number = cardNumber;
            }

            // Use NavigationService to navigate back to the CardsTab with proper nesting
            // This replaces the problematic navigation.navigate('CardsScreen', { newCard }); line
            // First, go back to the TabNavigator
            navigation.navigate('Tabs', {
                screen: 'CardsTab',
                params: {
                    screen: 'CardsList',
                    params: { newCard }
                }
            });
            // Show success notification
            notification.success(`${cardName} added successfully!`, {
                title: 'Card Added'
            });
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      handleClose();
    }
  };
  
  // Handle card type selection
  const handleCardTypeSelect = (type) => {
    setCardType(type);
  };
  
  // Format card number with spaces
  const formatCardNumber = (text) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // Add spaces every 4 digits
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    
    setCardNumber(formatted);
  };
  
  // Format expiry date MM/YY
  const formatExpiryDate = (text) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length > 2) {
      setCardExpiry(cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4));
    } else {
      setCardExpiry(cleaned);
    }
  };
  
  // Open image picker to select logo
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        notification.error('We need access to your photo library to select a card logo', {
          title: 'Permission Required',
          actionLabel: 'Settings',
          actionOnPress: () => {
            // Would ideally link to settings
          }
        });
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setCardLogo(result.assets[0].uri);
        notification.success('Logo selected', {
          animPattern: 'FADE_IN'
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      notification.error('Failed to select image. Please try again.', {
        title: 'Error'
      });
    }
  };
  
  // Open camera to scan QR/barcode - simplified for now
  const openScanner = async () => {
    if (!Camera) {
      notification.error('The camera module is not available on this device.', {
        title: 'Camera Not Available'
      });
      return;
    }
    setIsCameraVisible(true);
  };
  
  // Handle barcode scanning - simplified
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setIsCameraVisible(false);
    
    // Simplified handling
    if (data && data.length > 0) {
      // If it looks like a card number, use it
      if (/^\d{4,}$/.test(data.replace(/\D/g, ''))) {
        setCardNumber(data.replace(/\D/g, ''));
        notification.success('Card number detected and added to form', {
          title: 'Data Scanned',
          animPattern: 'BOUNCE'
        });
      } else {
        notification.info('Scanned: ' + data.substring(0, 20) + '...', {
          title: 'Data Scanned',
          actionLabel: 'Use Value',
          actionOnPress: () => {
            setCardNumber(data);
          }
        });
      }
    }
  };
  
  // Simplified NFC handling with just an alert
  const startNfcScan = async () => {
    notification.warning('NFC scanning is not implemented in this version.', {
      title: 'Coming Soon',
      actionLabel: 'Learn More',
      actionOnPress: () => {
        notification.info('NFC card reading will be available in a future update.', {
          title: 'Feature Roadmap'
        });
      }
    });
  };
  
  // Handle deleting logo
  const handleDeleteLogo = async () => {
    try {
      await confirm({
        title: 'Remove Logo',
        message: 'Are you sure you want to remove this logo?',
        confirmText: 'Remove',
        cancelText: 'Keep',
        type: 'warning'
      });
      
      // User confirmed removal
      setCardLogo(null);
      notification.info('Logo removed', {
        animPattern: 'FADE_IN'
      });
    } catch (error) {
      // User canceled, keep logo
    }
  };
  
  // Render Step 1: Card Type Selection
  const renderStepOne = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Card Type</Text>
      <Text style={styles.stepDescription}>Choose the type of card you want to add</Text>
      
      <ScrollView style={styles.cardTypeList}>
        {cardTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.cardTypeItem,
              cardType === type.id && styles.cardTypeItemSelected
            ]}
            onPress={() => handleCardTypeSelect(type.id)}
          >
            <View style={styles.cardTypeIcon}>
              <Ionicons 
                name={type.icon} 
                size={24} 
                color={cardType === type.id ? '#FF9500' : '#FFF'} 
              />
            </View>
            <View style={styles.cardTypeTextContainer}>
              <Text style={styles.cardTypeTitle}>{type.name}</Text>
              <Text style={styles.cardTypeDescription}>
                {getCardTypeDescription(type.id)}
              </Text>
            </View>
            {cardType === type.id && (
              <Ionicons name="checkmark-circle" size={24} color="#FF9500" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
          <LinearGradient
            colors={['#FF9500', '#E08600']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render Step 2: Card Details Form
  const renderStepTwo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add Card Details</Text>
      <Text style={styles.stepDescription}>Enter the information for your {getCardTypeName(cardType)}</Text>
      
      <ScrollView style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Card Name (Required)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., My Visa Card"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={cardName}
            onChangeText={setCardName}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Card Issuer</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Chase, Target, Starbucks"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={cardIssuer}
            onChangeText={setCardIssuer}
          />
        </View>
        
        {/* Card number input - common for most card types */}
        {cardType !== 'id' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {cardType === 'payment' ? 'Card Number (Required)' : 'Card Number/ID'}
            </Text>
            <View style={styles.cardNumberContainer}>
              <TextInput
                style={styles.cardNumberInput}
                placeholder={
                  cardType === 'payment' 
                    ? '1234 5678 9012 3456' 
                    : cardType === 'loyalty' 
                      ? 'Membership ID' 
                      : 'Card Number'
                }
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={cardNumber}
                onChangeText={text => {
                  if (cardType === 'payment') {
                    formatCardNumber(text);
                  } else {
                    setCardNumber(text);
                  }
                }}
                keyboardType="numeric"
                maxLength={cardType === 'payment' ? 19 : 30} // 16 digits + 3 spaces for payment cards
              />
              <View style={styles.cardScanButtons}>
                <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
                  <Ionicons name="qr-code" size={20} color="#FF9500" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.scanButton} onPress={startNfcScan}>
                  <Ionicons name="wifi" size={20} color="#FF9500" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
        {/* Payment card specific fields */}
        {cardType === 'payment' && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cardholder Name (Required)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., JOHN DOE"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={cardHolderName}
                onChangeText={setCardHolderName}
                autoCapitalize="characters"
              />
            </View>
            
            <View style={styles.rowContainer}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={cardExpiry}
                  onChangeText={formatExpiryDate}
                  keyboardType="numeric"
                  maxLength={5} // MM/YY
                />
              </View>
              
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>CVV/CVC</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={cardCVV}
                  onChangeText={setCardCVV}
                  keyboardType="numeric"
                  maxLength={4} // Some cards like Amex have 4 digits
                  secureTextEntry
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Card Network</Text>
              <View style={styles.cardNetworkContainer}>
                <TouchableOpacity
                  style={[
                    styles.cardNetworkButton,
                    cardNetwork === 'visa' && styles.cardNetworkButtonSelected
                  ]}
                  onPress={() => setCardNetwork('visa')}
                >
                  <Text style={styles.cardNetworkText}>Visa</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.cardNetworkButton,
                    cardNetwork === 'mastercard' && styles.cardNetworkButtonSelected
                  ]}
                  onPress={() => setCardNetwork('mastercard')}
                >
                  <Text style={styles.cardNetworkText}>MasterCard</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.cardNetworkButton,
                    cardNetwork === 'amex' && styles.cardNetworkButtonSelected
                  ]}
                  onPress={() => setCardNetwork('amex')}
                >
                  <Text style={styles.cardNetworkText}>Amex</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.cardNetworkButton,
                    cardNetwork === 'other' && styles.cardNetworkButtonSelected
                  ]}
                  onPress={() => setCardNetwork('other')}
                >
                  <Text style={styles.cardNetworkText}>Other</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        
        {/* Loyalty card specific fields */}
        {cardType === 'loyalty' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Points Balance</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5000"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={loyaltyPoints}
              onChangeText={setLoyaltyPoints}
              keyboardType="numeric"
            />
          </View>
        )}
        
        {/* Gift card specific fields */}
        {cardType === 'gift' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Card Balance</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., $50.00"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={giftCardBalance}
              onChangeText={setGiftCardBalance}
            />
          </View>
        )}
        
        {/* Ticket specific fields */}
        {cardType === 'ticket' && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Date</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 30/12/2025"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={eventDate}
                onChangeText={setEventDate}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Arena Stadium"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={eventLocation}
                onChangeText={setEventLocation}
              />
            </View>
          </>
        )}
        
        {/* Card logo */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Card Logo (Optional)</Text>
          <TouchableOpacity style={styles.logoSelector} onPress={pickImage}>
            {cardLogo ? (
              <View style={styles.logoPreviewContainer}>
                <Image source={{ uri: cardLogo }} style={styles.logoPreview} />
                <TouchableOpacity
                  style={styles.logoRemoveButton}
                  onPress={handleDeleteLogo}
                >
                  <Ionicons name="close-circle" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="image-outline" size={30} color="#FFF" />
                <Text style={styles.logoPlaceholderText}>Add Logo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handlePrevStep}>
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
          <LinearGradient
            colors={['#FF9500', '#E08600']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>Add Card</Text>
            <Ionicons name="card" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Helper function to get card type description
  const getCardTypeDescription = (type) => {
    switch (type) {
      case 'payment':
        return 'Credit, debit, or prepaid cards';
      case 'loyalty':
        return 'Store loyalty and rewards cards';
      case 'id':
        return 'Identity and membership cards';
      case 'ticket':
        return 'Event tickets and passes';
      case 'gift':
        return 'Gift cards and vouchers';
      case 'business':
        return 'Business and corporate cards';
      default:
        return '';
    }
  };
  
  // Helper function to get card type name
  const getCardTypeName = (type) => {
    switch (type) {
      case 'payment':
        return 'Payment Card';
      case 'loyalty':
        return 'Loyalty Card';
      case 'id':
        return 'ID Card';
      case 'ticket':
        return 'Ticket';
      case 'gift':
        return 'Gift Card';
      case 'business':
        return 'Business Card';
      default:
        return 'Card';
    }
  };
  
  // Camera view for QR/barcode scanning
  const renderCameraView = () => {
    if (!Camera) {
      return (
        <View style={styles.cameraContainer}>
          <Text style={styles.cameraText}>Camera module not available</Text>
          <TouchableOpacity 
            style={styles.cameraCloseButton} 
            onPress={() => setIsCameraVisible(false)}
          >
            <Text style={styles.cameraCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    if (hasPermission === null) {
      return (
        <View style={styles.cameraContainer}>
          <Text style={styles.cameraText}>Requesting camera permission...</Text>
        </View>
      );
    }
    
    if (hasPermission === false) {
      return (
        <View style={styles.cameraContainer}>
          <Text style={styles.cameraText}>No access to camera</Text>
          <TouchableOpacity 
            style={styles.cameraCloseButton} 
            onPress={() => setIsCameraVisible(false)}
          >
            <Text style={styles.cameraCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          ratio="16:9"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.scannerBox} />
            <Text style={styles.scannerText}>
              Align QR code or barcode within the frame
            </Text>
            {scanned && (
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.scanAgainButtonText}>Scan Again</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.cameraCloseButton}
              onPress={() => setIsCameraVisible(false)}
            >
              <Ionicons name="close-circle" size={40} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ImageBackground
        source={require('../../assets/images/gradient-bg.png')}
        style={styles.backgroundImage}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handlePrevStep}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentStep === 1 ? 'Add New Card' : `New ${getCardTypeName(cardType)}`}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 30}
        >
          {currentStep === 1 ? renderStepOne() : renderStepTwo()}
        </KeyboardAvoidingView>
      </ImageBackground>
      {/* Camera Scanner Modal */} {isCameraVisible && (<Modal visible={isCameraVisible} transparent={false} onRequestClose={() => setIsCameraVisible(false)}> {renderCameraView()}</Modal>
      )}
      
      {/* Include the ConfirmationComponent */}
      <ConfirmationComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
    width: '100%',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  cardTypeList: {
    flex: 1,
    marginBottom: 20,
  },
  cardTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTypeItemSelected: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderColor: 'rgba(255, 149, 0, 0.5)',
  },
  cardTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTypeTextContainer: {
    flex: 1,
  },
  cardTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  cardTypeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  formContainer: {
    flex: 1,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardNumberInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    marginRight: 10,
  },
  cardScanButtons: {
    flexDirection: 'row',
  },
  scanButton: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  cardNetworkContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardNetworkButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardNetworkButtonSelected: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderColor: 'rgba(255, 149, 0, 0.5)',
  },
  cardNetworkText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  logoSelector: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontSize: 14,
  },
  logoPreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  logoRemoveButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FF9500',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  scanAgainButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 149, 0, 0.8)',
    borderRadius: 10,
  },
  scanAgainButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraCloseButton: {
    position: 'absolute',
    bottom: 50,
    padding: 10,
  },
  cameraCloseButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
  }
});

export default AddCardScreen;