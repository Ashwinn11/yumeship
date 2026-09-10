import { Colors } from '@/constants/theme';
import Svg, { Path } from 'react-native-svg';

// Straight viewfinder-style corner marks — an L at each corner, nothing
// along the edges. The straight-line counterpart to FlourishCorners' curl.
type Props = {
  width: number;
  height: number;
  size?: number;
  inset?: number;
  color?: string;
};

export function BracketFrame({ width, height, size = 20, inset = 10, color = Colors.sakuraDeep }: Props) {
  if (width < size * 2 + inset * 2 || height < size * 2 + inset * 2) return null;
  const r = 6;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Path d={`M${inset} ${inset + size} V${inset + r} A${r} ${r} 0 0 1 ${inset + r} ${inset} H${inset + size}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <Path d={`M${width - inset} ${inset + size} V${inset + r} A${r} ${r} 0 0 0 ${width - inset - r} ${inset} H${width - inset - size}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <Path d={`M${inset} ${height - inset - size} V${height - inset - r} A${r} ${r} 0 0 0 ${inset + r} ${height - inset} H${inset + size}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <Path d={`M${width - inset} ${height - inset - size} V${height - inset - r} A${r} ${r} 0 0 1 ${width - inset - r} ${height - inset} H${width - inset - size}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    </Svg>
  );
}
