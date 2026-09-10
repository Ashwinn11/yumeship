import { Colors } from '@/constants/theme';
import { useMemo } from 'react';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

// A soft tonal glow from one corner — no marks at all, the most minimal of
// the backdrop fills.
type Props = {
  width: number;
  height: number;
  color?: string;
};

export function WashBackdrop({ width, height, color = Colors.sakura }: Props) {
  const id = useMemo(() => 'wash-' + Math.random().toString(36).slice(2, 7), []);
  if (width <= 0 || height <= 0) return null;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="82%" cy="18%" r="80%">
          <Stop offset="0%" stopColor={color} stopOpacity={0.45} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${id})`} />
    </Svg>
  );
}
