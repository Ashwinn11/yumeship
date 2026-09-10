import { Colors } from '@/constants/theme';
import { useMemo } from 'react';
import Svg, { Circle, Defs, Line, Path, Pattern as SvgPattern } from 'react-native-svg';

// A woven-ribbon trellis band framing a card — two sets of diagonal strips
// crossing at 45°, with a small bead at each crossing. Same band-around-the-
// edge idea as LaceFrame, just a trellis weave instead of a scalloped doily.
type Props = {
  width: number;
  height: number;
  radius?: number;
  bandWidth?: number;
  cell?: number;
  color?: string;
};

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + rr} ${y} H${x + w - rr} A${rr} ${rr} 0 0 1 ${x + w} ${y + rr} V${y + h - rr} A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h} H${x + rr} A${rr} ${rr} 0 0 1 ${x} ${y + h - rr} V${y + rr} A${rr} ${rr} 0 0 1 ${x + rr} ${y} Z`;
}

export function LatticeFrame({ width, height, radius = 18, bandWidth = 14, cell = 13, color = Colors.sakuraDeep }: Props) {
  const id = useMemo(() => 'lattice-' + Math.random().toString(36).slice(2, 7), []);
  if (width < bandWidth * 3 || height < bandWidth * 3) return null;

  const outer = roundedRectPath(0, 0, width, height, radius);
  const inner = roundedRectPath(bandWidth, bandWidth, width - bandWidth * 2, height - bandWidth * 2, Math.max(0, radius - bandWidth));

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <SvgPattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <Line x1={cell / 2.6} y1={0} x2={cell / 2.6} y2={cell} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
          <Line x1={0} y1={cell / 2.6} x2={cell} y2={cell / 2.6} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
          <Circle cx={cell / 2.6} cy={cell / 2.6} r={1.6} fill={Colors.butter} opacity={0.85} />
        </SvgPattern>
      </Defs>
      <Path d={`${outer} ${inner}`} fill={`url(#${id})`} fillRule="evenodd" />
    </Svg>
  );
}
