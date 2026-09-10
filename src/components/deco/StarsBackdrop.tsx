import { useMemo } from 'react';
import Svg, { Defs, Path, Pattern as SvgPattern, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

// Same tiled-backdrop trick as PatternBackdrop, tiny stars instead of dots.
type Props = {
  width: number;
  height: number;
  color?: string;
};

const STAR_D = 'M7 2l1.3 3.4L11.7 6 9 8.4 9.7 12 7 10.2 4.3 12 5 8.4 2.3 6l3.4-.6L7 2Z';

export function StarsBackdrop({ width, height, color = Colors.butterDeep }: Props) {
  const id = useMemo(() => 'stars-' + Math.random().toString(36).slice(2, 7), []);
  if (width <= 0 || height <= 0) return null;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <SvgPattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
          <Path d={STAR_D} fill={color} opacity={0.32} />
          <Path d={STAR_D} fill={color} opacity={0.32} transform="translate(13,13)" />
        </SvgPattern>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${id})`} />
    </Svg>
  );
}
