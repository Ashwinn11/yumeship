import { Colors } from '@/constants/theme';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// design/components.jsx — I (inline icon set)
// All icons 14×14, 1.3–1.4px stroke, round caps/joins, no fill

type IconProps = {
  size?: number;
  color?: string;
};

export function IconPlus({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path d="M7 1.5v11M1.5 7h11" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function IconHeart({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M7 12C3 9 1.5 7.2 1.5 4.8c0-1.5 1.2-2.8 2.8-2.8 1 0 1.9.5 2.7 1.5C7.8 2.5 8.7 2 9.7 2c1.6 0 2.8 1.3 2.8 2.8C12.5 7.2 11 9 7 12z"
        stroke={color} strokeWidth="1.3" fill="none"
      />
    </Svg>
  );
}

export function IconBookmark({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path d="M3 1.5h8v11l-4-2.5-4 2.5v-11z" stroke={color} strokeWidth="1.3" fill="none" />
    </Svg>
  );
}

export function IconSend({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M1.5 7 12.5 1.5 9.5 12.5 7 8 1.5 7z"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconEdit({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M2 11l1-3 7-7 2 2-7 7-3 1zM8.5 2.5l2 2"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconMoon({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M11.5 8.5A4.5 4.5 0 0 1 5.5 2.5 5 5 0 1 0 11.5 8.5z"
        stroke={color} strokeWidth="1.3" fill="none"
      />
    </Svg>
  );
}

export function IconBell({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Path
        d="M3 10V6.5a4 4 0 1 1 8 0V10l1 1.5H2L3 10zM5.5 12.5a1.5 1.5 0 0 0 3 0"
        stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconSearch({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx="6" cy="6" r="4.2" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M9.5 9.5l3 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  );
}

export function IconLock({ size = 14, color = Colors.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Rect x="2.5" y="6.5" width="9" height="6.5" rx="1.2" stroke={color} strokeWidth="1.3" fill="none" />
      <Path d="M4.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2" stroke={color} strokeWidth="1.3" fill="none" />
    </Svg>
  );
}
