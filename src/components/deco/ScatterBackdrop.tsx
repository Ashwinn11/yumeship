import { Colors } from '@/constants/theme';
import Svg, { Circle } from 'react-native-svg';

// Irregular, sparse dots across the whole card — deliberately hand-placed
// rather than a repeating tile, so it reads as scattered instead of gridded.
type Props = {
  width: number;
  height: number;
  color?: string;
};

// normalized (0–1) positions/sizes/opacities, hand-placed for an irregular feel
const DOTS: [number, number, number, number][] = [
  [0.09, 0.17, 1.6, 0.5], [0.27, 0.08, 1, 0.35], [0.42, 0.28, 2.1, 0.45],
  [0.64, 0.13, 1.3, 0.5], [0.81, 0.24, 1, 0.3], [0.13, 0.48, 1, 0.4],
  [0.37, 0.56, 1.7, 0.4], [0.57, 0.44, 1, 0.35], [0.75, 0.57, 2, 0.45],
  [0.9, 0.46, 1.2, 0.4], [0.2, 0.8, 1.3, 0.45], [0.45, 0.87, 1, 0.3],
  [0.67, 0.81, 1.8, 0.4], [0.85, 0.89, 1, 0.35],
];

export function ScatterBackdrop({ width, height, color = Colors.sakuraDeep }: Props) {
  if (width <= 0 || height <= 0) return null;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      {DOTS.map(([x, y, r, o], i) => (
        <Circle key={i} cx={x * width} cy={y * height} r={r} fill={color} opacity={o} />
      ))}
    </Svg>
  );
}
