import { Colors } from '@/constants/theme';
import Svg, { Rect } from 'react-native-svg';

// Two concentric outlines with a gap between them — invitation-card style,
// the plainest and most formal of the edge treatments.
type Props = {
  width: number;
  height: number;
  radius?: number;
  color?: string;
};

export function DoubleLineFrame({ width, height, radius = 18, color = Colors.sakuraDeep }: Props) {
  if (width < 40 || height < 40) return null;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Rect x={7} y={7} width={width - 14} height={height - 14} rx={radius} fill="none" stroke={color} strokeWidth={1.1} opacity={0.55} />
      <Rect x={13} y={13} width={width - 26} height={height - 26} rx={Math.max(0, radius - 6)} fill="none" stroke={color} strokeWidth={1.1} opacity={0.4} />
    </Svg>
  );
}
