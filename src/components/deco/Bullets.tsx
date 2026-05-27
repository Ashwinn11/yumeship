import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
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
  Crescent: ({ size = 12, color = Colors.lavenderDeep }: BulletProps) => (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d="M11 2 A6 6 0 1 0 11 14 A4.5 4.5 0 0 1 11 2Z" fill={color} />
    </Svg>
  ),
  Square: ({ size = 11, color = Colors.sakuraDeep }: BulletProps) => (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Rect x="2" y="2" width="12" height="12" rx="2" fill={color} />
    </Svg>
  ),
  Tape: ({ size = 16, color = Colors.sakura }: BulletProps) => (
    <Svg width={size + 4} height={size - 4} viewBox="0 0 20 12">
      <Rect width="20" height="12" fill={color} opacity="0.6" />
      <Path
        d="M2 2h2M6 2h2M10 2h2M14 2h2M2 8h2M6 8h2M10 8h2M14 8h2"
        stroke={color}
        strokeWidth="1"
      />
    </Svg>
  ),
  Ribbon: ({ size = 14, color = Colors.sakuraDeep }: BulletProps) => (
    <Svg width={size + 4} height={size} viewBox="0 0 18 14">
      <Path d="M0 2 L6 7 L0 12 L4 7 Z M18 2 L12 7 L18 12 L14 7 Z" fill={color} opacity="0.7" />
      <Circle cx="9" cy="7" r="2" fill={color} />
    </Svg>
  ),
};
