// src/screens/auth/LandingScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  ImageBackground,
  SafeAreaView,
  FlatList,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import WaoCardLogo from '../../components/auth/WaoCardLogo';
import GradientButton from '../../components/auth/GradientButton';
import { colors, fonts, screenDimensions, spacing } from '../../styles/theme';

const { width, height } = screenDimensions;

// Feature slider data
const featureData = [
  {
    id: '1',
    title: 'One Digital ID',
    description: 'Replace all your ID cards with a single, secure digital identity that works everywhere you go.',
    icon: 'shield-account',
    iconType: 'MaterialCommunity'
  },
  {
    id: '2',
    title: 'Easy Payments',
    description: 'Pay anyone, anywhere with a simple tap. No more juggling multiple payment apps or cards.',
    icon: 'credit-card',
    iconType: 'FontAwesome5'
  },
  {
    id: '3',
    title: 'Universal Access',
    description: 'Open doors, log in to services, and access your accounts - all with just one card.',
    icon: 'key',
    iconType: 'FontAwesome5'
  }
];

const LandingScreen = ({ navigation }) => {
  // State for slider
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto-scroll timer
    const timer = setInterval(() => {
      if (currentIndex < featureData.length - 1) {
        sliderRef.current?.scrollToIndex({
          index: currentIndex + 1,
          animated: true
        });
      } else {
        sliderRef.current?.scrollToIndex({
          index: 0,
          animated: true
        });
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [currentIndex]);

  // Feature slide item render
  const renderFeatureItem = ({ item }) => {
    return (
      <View style={styles.featureSlide}>
        <View style={styles.featureIconContainer}>
          {item.iconType === 'FontAwesome5' && (
            <FontAwesome5 name={item.icon} size={40} color={colors.primary} />
          )}
          {item.iconType === 'MaterialCommunity' && (
            <MaterialCommunityIcons name={item.icon} size={40} color={colors.primary} />
          )}
          {item.iconType === 'Material' && (
            <MaterialIcons name={item.icon} size={40} color={colors.primary} />
          )}
        </View>
        <Text style={styles.featureTitle}>{item.title}</Text>
        <Text style={styles.featureDescription}>{item.description}</Text>
      </View>
    );
  };

  // Indicator dots for slider
  const renderDotIndicator = () => {
    return (
      <View style={styles.paginationDots}>
        {featureData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? colors.primary : colors.textSecondary }
            ]}
          />
        ))}
      </View>
    );
  };

  // Handle scroll events
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Futuristic background */}
      <ImageBackground 
        source={require('../../../assets/images/gradient-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Animated blob overlay */}
        <View style={styles.blobOverlay}>
          <Svg 
            width={width * 1.2} 
            height={height * 0.6} 
            viewBox="0 0 160.46 151.813"
            style={styles.blobSvg}
          >
            <Defs>
              <RadialGradient 
                id="radial-gradient" 
                cx="0.668" 
                cy="0.733" 
                r="1.157"
                gradientUnits="objectBoundingBox"
              >
                <Stop offset="0" stopColor="#FF9500" stopOpacity="0.4" />
                <Stop offset="1" stopColor="#E08600" stopOpacity="0.1" />
              </RadialGradient>
            </Defs>
            <Path
              d="M18.256,0h91.058a18.256,18.256,0,0,1,18.256,18.256l.006,25.107L92,98.166.021,38.43,0,18.256A18.256,18.256,0,0,1,18.256,0Z"
              transform="matrix(-0.839, 0.545, -0.545, -0.839, 160.46, 82.329)"
              fill="url(#radial-gradient)"
            />
          </Svg>
        </View>
        
        {/* Grid pattern overlay */}
        <View style={styles.gridPattern} />
        
        {/* Content Container */}
        <SafeAreaView style={styles.contentContainer}>
          {/* Logo and Branding */}
          <View style={styles.logoContainer}>
            <WaoCardLogo width={80} height={80} />
            <Text style={styles.appTitle}>
              <Text style={styles.appTitleLight}>Wao</Text>Card
            </Text>
          </View>
          
          {/* Feature Slider */}
          <Animated.View 
            style={[
              styles.sliderContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }]
              }
            ]}
          >
            <FlatList
              ref={sliderRef}
              data={featureData}
              renderItem={renderFeatureItem}
              keyExtractor={item => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              onMomentumScrollEnd={handleScroll}
              decelerationRate="fast"
              snapToAlignment="center"
              snapToInterval={width}
            />
            {renderDotIndicator()}
          </Animated.View>
          
          {/* Marketing content */}
          <Animated.View 
            style={[
              styles.marketingContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }]
              }
            ]}
          >
            <Text style={styles.tagline}>One Card for Everything</Text>
            <Text style={styles.description}>
              The all-in-one card that simplifies your life and empowers your future
            </Text>
          </Animated.View>
          
          {/* Buttons */}
          <Animated.View 
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: buttonScaleAnim }]
              }
            ]}
          >
            <GradientButton 
              title="Sign In" 
              onPress={() => navigation.navigate('Login')} 
              style={styles.buttonPrimary}
            />
            
            <TouchableOpacity 
              style={styles.buttonSecondary}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonTextSecondary}>Create Account</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blobOverlay: {
    position: 'absolute',
    top: 0,
    left: -100,
    opacity: 0.8,
  },
  blobSvg: {
    position: 'absolute',
    top: -100,
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    // Using border to create a grid pattern effect
    borderRadius: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  appTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 10,
  },
  appTitleLight: {
    color: colors.primary,
    fontWeight: '300',
  },
  // Slider styles
  sliderContainer: {
    marginTop: 10,
    marginBottom: 5,
    height: height * 0.32,
  },
  featureSlide: {
    width: width - 60, // Account for padding
    height: height * 0.26,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  featureIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: fonts.sizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    height: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  marketingContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: fonts.sizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  buttonPrimary: {
    width: '100%',
    height: 56,
    marginBottom: 15,
  },
  buttonSecondary: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextSecondary: {
    color: colors.primary,
    fontSize: fonts.sizes.large,
    fontWeight: '500',
  },
});

export default LandingScreen;