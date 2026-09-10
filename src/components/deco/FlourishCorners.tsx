import { Colors } from '@/constants/theme';
import Svg, { Path } from 'react-native-svg';

// A small calligraphic curl at each corner only — the edges themselves stay
// plain. Distinct from the other frames in that it decorates corners, not
// a continuous line or band around the whole perimeter.
type Props = {
  width: number;
  height: number;
  size?: number;
  inset?: number;
  color?: string;
};

// one curl, drawn to sit in the top-left corner; mirrored for the rest
const CURL_D = 'M2,20 C2,8 12,2 20,6 C14,3 6,8 8,14 C10,20 16,18 16,12';

export function FlourishCorners({ width, height, size = 22, inset = 10, color = Colors.sakuraDeep }: Props) {
  if (width < size * 2 + inset * 2 || height < size * 2 + inset * 2) return null;

  const corners = [
    { x: inset, y: inset, scaleX: 1, scaleY: 1 },
    { x: width - inset, y: inset, scaleX: -1, scaleY: 1 },
    { x: inset, y: height - inset, scaleX: 1, scaleY: -1 },
    { x: width - inset, y: height - inset, scaleX: -1, scaleY: -1 },
  ];

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      {corners.map((c, i) => (
        <Path
          key={i}
          d={CURL_D}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.65}
          transform={`translate(${c.x} ${c.y}) scale(${c.scaleX * (size / 22)} ${c.scaleY * (size / 22)})`}
        />
      ))}
    </Svg>
  );
}
