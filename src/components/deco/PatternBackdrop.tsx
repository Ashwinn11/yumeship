import { useMemo } from 'react';
import Svg, { Circle, Defs, Pattern as SvgPattern, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

// A restrained tiled dot pattern behind the whole card — the "someone's
// personal fan page background" texture (straw.page-style), dialed down
// for a mobile card instead of a whole webpage.
type Props = {
  width: number;
  height: number;
  color?: string;
};

export function PatternBackdrop({ width, height, color = Colors.sakuraDeep }: Props) {
  const id = useMemo(() => 'patternbg-' + Math.random().toString(36).slice(2, 7), []);
  if (width <= 0 || height <= 0) return null;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <SvgPattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
          <Circle cx="5" cy="5" r="2.2" fill={color} opacity={0.34} />
          <Circle cx="15" cy="15" r="2.2" fill={color} opacity={0.34} />
          <Circle cx="15" cy="5" r="1" fill={color} opacity={0.24} />
          <Circle cx="5" cy="15" r="1" fill={color} opacity={0.24} />
        </SvgPattern>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${id})`} />
    </Svg>
  );
}
