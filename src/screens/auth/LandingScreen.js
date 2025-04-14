// src/screens/auth/LandingScreen.js
import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  ImageBackground,
  SafeAreaView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import WaoCardLogo from '../../components/auth/WaoCardLogo';
import GradientButton from '../../components/auth/GradientButton';
import { colors, fonts, screenDimensions, spacing } from '../../styles/theme';

const { width, height } = screenDimensions;

const LandingScreen = ({ navigation }) => {
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
  }, []);

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
          
          {/* Animation */}
          <View style={styles.animationContainer}>
            <LottieView
              source={require('../../../assets/animations/digital-wallet.json')}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>
          
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
            <Text style={styles.tagline}>Financial Freedom for Africa</Text>
            <Text style={styles.description}>
              The leading digital wallet platform enabling financial inclusion across Africa
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
    marginTop: 40,
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
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.3,
  },
  animation: {
    width: width * 0.8,
    height: width * 0.8,
  },
  marketingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tagline: {
    fontSize: fonts.sizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: fonts.sizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
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