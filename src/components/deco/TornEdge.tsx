import { Colors } from '@/constants/theme';
import Svg, { Path } from 'react-native-svg';

// A jagged paper-tear strip, meant to sit flush against one edge of a card
// (torn-photo scrapbook aesthetic) rather than to reveal what's behind it.
type Props = {
  width?: number;
  height?: number;
  color?: string;
  style?: any;
};

export function TornEdge({ width = 320, height = 12, color = Colors.vellum, style }: Props) {
  const teeth = Math.max(6, Math.round(width / 22));
  const step = width / teeth;
  let d = `M0 ${height}`;
  for (let i = 0; i < teeth; i++) {
    const xMid = step * (i + 0.5);
    const xEnd = step * (i + 1);
    d += ` L${xMid} 0 L${xEnd} ${height}`;
  }
  d += ' Z';

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={style}>
      <Path d={d} fill={color} />
    </Svg>
  );
}
