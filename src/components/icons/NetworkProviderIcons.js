// src/components/icons/NetworkProviderIcons.js
import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Import SVG files as components
import MTNLogo from '../../../assets/images/mtn.svg';
import AirtelLogo from '../../../assets/images/airtel.svg';
import GloLogo from '../../../assets/images/glo.svg';
import NineMobileLogo from '../../../assets/images/9mobile.svg';

// MTN Icon Component
export const MTNIcon = ({ size = 24, style }) => (
  <MTNLogo width={size} height={size} style={style} />
);

// Airtel Icon Component
export const AirtelIcon = ({ size = 24, style }) => (
  <AirtelLogo width={size} height={size} style={style} />
);

// Glo Icon Component
export const GloIcon = ({ size = 24, style }) => (
  <GloLogo width={size} height={size} style={style} />
);

// 9mobile Icon Component
export const NineMobileIcon = ({ size = 24, style }) => (
  <NineMobileLogo width={size} height={size} style={style} />
);

// Generic network icon as fallback
export const NetworkIcon = ({ size = 24, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path 
      d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48L3.5 14.4l-.35-.95zM6.4 13.9l1.48-.85 1.48.85-.85 1.48H6.4l-.85-1.48zm4.25-2.45L12 9.97l1.35 1.48-.85 1.48H10.5l-.85-1.48zm4.25 0L16.25 9.97 17.6 11.45l-.85 1.48H15.4l-.85-1.48zm4.25 2.45L20.5 14.4l-.35-.95-.85-1.48L20.15 10.52 21 11.47l-.85 1.48z" 
      fill="#666"
    />
  </Svg>
);

// Provider icon mapper
export const getProviderIcon = (providerName, size = 24, style) => {
  if (!providerName) return <NetworkIcon size={size} style={style} />;
  
  const name = providerName.toLowerCase();
  
  if (name.includes('mtn')) {
    return <MTNIcon size={size} style={style} />;
  } else if (name.includes('airtel')) {
    return <AirtelIcon size={size} style={style} />;
  } else if (name.includes('glo')) {
    return <GloIcon size={size} style={style} />;
  } else if (name.includes('9mobile') || name.includes('9-mobile')) {
    return <NineMobileIcon size={size} style={style} />;
  } else {
    return <NetworkIcon size={size} style={style} />;
  }
};