import { Colors } from '@/constants/theme';
import Svg, { Rect } from 'react-native-svg';

// A single row of round beads tracing the edge — a near-zero dash length
// with a round linecap renders as evenly spaced dots rather than dashes.
type Props = {
  width: number;
  height: number;
  radius?: number;
  inset?: number;
  color?: string;
};

export function BeadedFrame({ width, height, radius = 18, inset = 9, color = Colors.sakuraDeep }: Props) {
  if (width < inset * 3 || height < inset * 3) return null;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Rect
        x={inset} y={inset}
        width={width - inset * 2} height={height - inset * 2}
        rx={Math.max(0, radius - inset)}
        fill="none"
        stroke={color}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeDasharray="0.1 12"
        opacity={0.65}
      />
    </Svg>
  );
}
