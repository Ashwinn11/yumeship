import { Colors } from '@/constants/theme';
import Svg, { Path } from 'react-native-svg';

// design/deco.jsx — Sparkle
// 4-point star twinkle
type Props = {
  size?: number;
  color?: string;
  opacity?: number;
};

export function Sparkle({ size = 14, color = Colors.sakuraDeep, opacity = 1 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" opacity={opacity}>
      <Path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z" fill={color} />
    </Svg>
  );
}
