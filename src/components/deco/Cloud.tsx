import { Colors } from '@/constants/theme';
import Svg, { Circle, Rect } from 'react-native-svg';

// design/deco.jsx — Cloud
// Soft blob cloud made of circles + rect base
type Props = {
  size?: number;
  color?: string;
};

export function Cloud({ size = 30, color = Colors.paperDeep }: Props) {
  const w = Math.round(size * 1.5);
  return (
    <Svg width={w} height={size} viewBox="0 0 45 30" fill={color}>
      <Circle cx="11" cy="18" r="9" />
      <Circle cx="22" cy="13" r="11" />
      <Circle cx="33" cy="18" r="9" />
      <Rect x="8" y="18" width="28" height="9" rx="3" />
    </Svg>
  );
}
