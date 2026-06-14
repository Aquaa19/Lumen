import React from 'react';
import Svg, { Path } from 'react-native-svg';

const TrashIcon = ({ size = 24, color = "white" }) => {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth={2.5} // Set to 2.5 or 3 to match the bold look in your image
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Lid line */}
      <Path d="M3 6h18" />
      {/* Body and Top Handle */}
      <Path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      {/* Left inner line */}
      <Path d="M10 11v6" />
      {/* Right inner line */}
      <Path d="M14 11v6" />
    </Svg>
  );
};

export default TrashIcon;