import { Colors } from '@/constants/theme';
import Svg, { Ellipse, Path } from 'react-native-svg';

// design/deco.jsx — Pin
// Push-pin: rounded head + needle
type Props = {
  size?: number;
  color?: string;
};

export function Pin({ size = 16, color = Colors.sakuraDeep }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Ellipse cx="8" cy="5" rx="4" ry="3" fill={color} />
      <Ellipse cx="6.5" cy="4" rx="1.2" ry="0.8" fill="rgba(255,255,255,0.5)" />
      <Path d="M8 8 L 8 14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}
