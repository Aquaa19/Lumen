import React from 'react';
import { Svg, G, Polygon, Path } from 'react-native-svg';

interface AIIconProps {
  size?: number;
}

const AIIcon: React.FC<AIIconProps> = ({ size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G data-name="Product Icons">
        <Polygon points="20.69 12.43 12 16.78 12 22 20.69 17.65 20.69 12.43" fill="#4285f4" fillRule="evenodd" />
        <Path d="M6.78,4.61,3.31,6.35Z" fill="#1e88e5" fillRule="evenodd" />
        <Polygon points="17.22 8.09 17.22 8.09 17.22 12.43 20.69 10.7 20.69 6.35 17.22 8.09" fill="#4285f4" fillRule="evenodd" />
        <Polygon points="12 15.04 15.48 13.31 15.48 8.96 15.48 8.96 12 10.7 12 15.04" fill="#4285f4" fillRule="evenodd" />
        <Polygon points="6.78 4.61 3.31 6.35 6.78 8.09 10.26 6.35 6.78 4.61" fill="#aecbfa" />
        <Polygon points="12 2 8.52 3.74 12 5.48 17.22 8.09 20.69 6.35 12 2" fill="#aecbfa" fillRule="evenodd" />
        <Polygon points="12 7.22 8.52 8.96 12 10.7 15.48 8.96 12 7.22" fill="#aecbfa" />
        <Path d="M8.52,15v5.22L12,22V16.78Zm2.61,5.22-1.74-.87V16.78l1.74.87Z" fill="#669df6" />
        <Path d="M3.31,6.35v11.3l3.47,1.74V8.09Zm2.61,11.3-1.75-.87v-10l1.75.87Z" fill="#669df6" />
        <Path d="M8.52,9,12,10.7V15L8.52,13.31Zm2.61,4.35v-3L9.39,9.45v3Z" fill="#669df6" />
      </G>
    </Svg>
  );
};

export default AIIcon;
