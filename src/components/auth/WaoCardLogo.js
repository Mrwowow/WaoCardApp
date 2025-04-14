import React from 'react';
import { Svg, Path } from 'react-native-svg';

const WaoCardLogo = ({ width = 60, height = 60, color = "#FF9500" }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20">
      <Path d="M16.45 12.4401C17.9191 12.4401 19.11 11.2492 19.11 9.78012C19.11 8.31104 17.9191 7.12012 16.45 7.12012C14.9809 7.12012 13.79 8.31104 13.79 9.78012C13.79 11.2492 14.9809 12.4401 16.45 12.4401Z" fill={color}/>
      <Path d="M12.56 6.12004L10.62 4.29004C7.59999 7.51004 7.73999 12.57 10.96 15.6L12.79 13.66C10.65 11.65 10.55 8.25004 12.56 6.12004Z" fill="white"/>
      <Path d="M8.67999 2.44988L6.73999 0.629883C1.67999 5.98988 1.92999 14.4199 7.29999 19.4799L9.12999 17.5399C4.83999 13.5099 4.63999 6.72988 8.67999 2.44988Z" fill="white"/>
    </Svg>
  );
};

export default WaoCardLogo;