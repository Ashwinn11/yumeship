import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { Colors } from '@/constants/theme';

type BulletProps = {
  size?: number;
  color?: string;
};

export const Bullets = {
  Heart: ({ size = 12, color = Colors.sakuraDeep }: BulletProps) => (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M8 14 C 3 11 1 8.5 1 5.5 C 1 3.5 2.5 2 4.5 2 C 6 2 7.3 2.9 8 4.3 C 8.7 2.9 10 2 11.5 2 C 13.5 2 15 3.5 15 5.5 C 15 8.5 13 11 8 14 Z"
        fill={color}
      />
    </Svg>
  ),
  Sakura: ({ size = 12, color = Colors.sakuraDeep }: BulletProps) => (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      {[0, 72, 144, 216, 288].map((r) => (
        <Ellipse
          key={r}
          cx="8"
          cy="4"
          rx="2"
          ry="3"
          fill={color}
          transform={`rotate(${r} 8 8)`}
        />
      ))}
      <Circle cx="8" cy="8" r="1.2" fill={Colors.butter} />
    </Svg>
  ),
  Star: ({ size = 12, color = Colors.sakuraDeep }: BulletProps) => (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z" fill={color} />
    </Svg>
  ),
  Dot: ({ size = 12, color = Colors.sakuraDeep }: BulletProps) => (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle cx="8" cy="8" r="5" fill={color} />
    </Svg>
  ),
};
