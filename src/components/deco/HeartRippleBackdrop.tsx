import { Colors } from '@/constants/theme';
import { useMemo } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

// Nested heart outlines radiating from one corner over a soft gradient wash
// — the same trick Instagram's Valentine's-day chat theme uses, redrawn
// with our own palette.
type Props = {
  width: number;
  height: number;
  color?: string;
};

const HEART_D = 'M0,-2 C-3,-6 -7,-6 -7,-2 C-7,1 -3,4 0,8 C3,4 7,1 7,-2 C7,-6 3,-6 0,-2 Z';
// [scale, opacity, strokeWidth]
const RINGS: [number, number, number][] = [
  [1, 0.65, 1.4], [1.9, 0.5, 1.3], [2.8, 0.38, 1.3], [3.7, 0.26, 1.2], [4.6, 0.15, 1.1],
];

export function HeartRippleBackdrop({ width, height, color = Colors.sakuraDeep }: Props) {
  const id = useMemo(() => 'heartripple-' + Math.random().toString(36).slice(2, 7), []);
  if (width <= 0 || height <= 0) return null;

  const cx = width * 0.78;
  const cy = height * 0.8;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0%" stopColor={Colors.lavender} />
          <Stop offset="100%" stopColor={Colors.sakura} />
        </LinearGradient>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${id})`} opacity={0.5} />
      <Rect width={width} height={height} fill={Colors.vellum} opacity={0.3} />
      <G stroke={color} fill="none">
        {RINGS.map(([scale, opacity, strokeWidth], i) => (
          <Path
            key={i}
            d={HEART_D}
            transform={`translate(${cx} ${cy}) scale(${scale})`}
            strokeWidth={strokeWidth}
            opacity={opacity}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </G>
      <Circle cx={width * 0.2} cy={height * 0.22} r={1.3} fill={Colors.vellum} opacity={0.8} />
      <Circle cx={width * 0.35} cy={height * 0.13} r={0.9} fill={Colors.vellum} opacity={0.65} />
      <Circle cx={width * 0.12} cy={height * 0.42} r={1} fill={Colors.vellum} opacity={0.7} />
    </Svg>
  );
}
