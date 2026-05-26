import { Colors } from '@/constants/theme';
import Svg, { Circle, Path } from 'react-native-svg';

// design/deco.jsx — Ribbon
// Bow with two loops, knot, and tails
type Props = {
  size?: number;
  color?: string;
};

export function Ribbon({ size = 26, color = Colors.sakuraDeep }: Props) {
  const w = Math.round(size * 1.6);
  return (
    <Svg width={w} height={size} viewBox="0 0 40 24" fill={color}>
      <Path d="M20 12 C 14 4, 4 4, 4 12 C 4 20, 14 20, 20 12 Z" />
      <Path d="M20 12 C 26 4, 36 4, 36 12 C 36 20, 26 20, 20 12 Z" />
      <Circle cx="20" cy="12" r="3" />
      <Path d="M18 14 L 14 22 L 18 21 Z" />
      <Path d="M22 14 L 26 22 L 22 21 Z" />
    </Svg>
  );
}
