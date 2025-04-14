// src/screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  Animated, 
  Dimensions,
  SafeAreaView 
} from 'react-native';
import { Svg, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import WaoCardIcon from '../components/WaoCardIcon';

const { width, height } = Dimensions.get('window');

// Use React.memo to prevent unnecessary re-renders
const SplashScreen = React.memo(({ onAnimationComplete }) => {
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Reference to track if animation completed
  const animationCompleted = useRef(false);
  
  useEffect(() => {
    console.log('Starting splash screen animations');
    console.log('onAnimationComplete exists:', !!onAnimationComplete);
    
    // Create a timeout to ensure we navigate away even if animations fail
    const navigationTimeout = setTimeout(() => {
      console.log('Navigation timeout triggered');
      if (onAnimationComplete && !animationCompleted.current) {
        animationCompleted.current = true;
        onAnimationComplete();
        console.log('Called onAnimationComplete from timeout');
      }
    }, 5000); // 5 second safety timeout
    
    // Start the animations when component mounts
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ]),
      // Keep the splash screen visible for a moment
      Animated.delay(2000),
    ]).start(() => {
      console.log('Animations complete, calling onAnimationComplete');
      clearTimeout(navigationTimeout);
      
      // Signal that animations are complete, but only if not already called
      if (onAnimationComplete && !animationCompleted.current) {
        animationCompleted.current = true;
        onAnimationComplete();
        console.log('Called onAnimationComplete from animation completion');
      }
    });
    
    return () => {
      clearTimeout(navigationTimeout);
      console.log('SplashScreen unmounted');
    };
  }, []); // Empty dependency array to ensure it only runs once

  // Interpolate the rotation for animation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#000000', '#0d0d0d']}
        style={styles.background}
      />
      
      {/* Animated Blob SVG */}
      <View style={styles.svgContainer}>
        <Svg 
          width={width} 
          height={height * 0.4} 
          viewBox="0 0 160.46 151.813"
        >
          <Defs>
            <RadialGradient 
              id="radial-gradient" 
              cx="0.668" 
              cy="0.733" 
              r="1.157"
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0" stopColor="#FF9500" />
              <Stop offset="1" stopColor="#E08600" />
            </RadialGradient>
          </Defs>
          <Path
            d="M18.256,0h91.058a18.256,18.256,0,0,1,18.256,18.256l.006,25.107L92,98.166.021,38.43,0,18.256A18.256,18.256,0,0,1,18.256,0Z"
            transform="matrix(-0.839, 0.545, -0.545, -0.839, 160.46, 82.329)"
            fill="url(#radial-gradient)"
          />
        </Svg>
      </View>
      
      {/* Background Pattern Image */}
      <Image
        source={require('../../assets/images/splash-bg.png')}
        style={styles.backgroundPattern}
        resizeMode="cover"
      />
      
      {/* Logo and Text Container */}
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Animated Logo */}
        <Animated.View 
          style={[
            styles.logoContainer,
            { transform: [{ rotate: spin }] }
          ]}
        >
          <View style={styles.logoInner}>
            <WaoCardIcon color="black" width={50} height={50} />
          </View>
        </Animated.View>
        
        {/* App Title */}
        <Text style={styles.title}>
          <Text style={styles.titleLight}>Wao</Text>Card
        </Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>Wao Your world...</Text>
      </Animated.View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  svgContainer: {
    position: 'absolute',
    top: -50,
    left: -50,
    opacity: 0.7,
  },
  backgroundPattern: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.4,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFF',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  titleLight: {
    color: '#FF9500',
    fontWeight: '300',
  },
  tagline: {
    fontSize: 18,
    color: '#FF9500',
    fontWeight: '300',
  },
});

export default SplashScreen;