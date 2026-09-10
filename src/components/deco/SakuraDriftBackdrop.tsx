import { Colors } from '@/constants/theme';
import Svg, { Circle, Ellipse, G } from 'react-native-svg';

// The app's own sakura petal (same 5-ellipse rosette WashiTape's floral
// pattern uses), scattered at varied scale/opacity — our answer to a chat
// app's "falling snowflakes" theme.
type Props = {
  width: number;
  height: number;
  color?: string;
};

const PETAL_ANGLES = [0, 72, 144, 216, 288];

// normalized (0–1) x/y, scale, opacity
const FLOWERS: [number, number, number, number][] = [
  [0.16, 0.19, 1.3, 0.55], [0.67, 0.15, 0.8, 0.35], [0.85, 0.56, 1.6, 0.5],
  [0.37, 0.48, 0.6, 0.3], [0.2, 0.83, 1.1, 0.4], [0.6, 0.85, 0.7, 0.3],
];

function Flower({ cx, cy, scale, opacity, color }: { cx: number; cy: number; scale: number; opacity: number; color: string }) {
  return (
    <G transform={`translate(${cx} ${cy}) scale(${scale})`} opacity={opacity}>
      {PETAL_ANGLES.map((rot) => (
        <Ellipse key={rot} cx={0} cy={-4} rx={2} ry={3.2} fill={color} transform={`rotate(${rot})`} />
      ))}
      <Circle r={1} fill={Colors.butter} />
    </G>
  );
}

export function SakuraDriftBackdrop({ width, height, color = Colors.sakura }: Props) {
  if (width <= 0 || height <= 0) return null;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      {FLOWERS.map(([x, y, scale, opacity], i) => (
        <Flower key={i} cx={x * width} cy={y * height} scale={scale} opacity={opacity} color={color} />
      ))}
    </Svg>
  );
}
