import { useMemo } from 'react';
import Svg, { Circle, Defs, Path, Pattern as SvgPattern, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

// Same tiled-backdrop trick as PatternBackdrop, a dot + a heart + a star
// sharing one tile instead of just one repeated element.
type Props = {
  width: number;
  height: number;
  color?: string;
};

const HEART_D = 'M6 9.5C3 7.5 2 6 2.8 4.6 3.6 3.2 5.2 4 6 5.2 6.8 4 8.4 3.2 9.2 4.6 10 6 9 7.5 6 9.5Z';
const STAR_D = 'M7 2l1.3 3.4L11.7 6 9 8.4 9.7 12 7 10.2 4.3 12 5 8.4 2.3 6l3.4-.6L7 2Z';

export function MixedBackdrop({ width, height, color = Colors.sakuraDeep }: Props) {
  const id = useMemo(() => 'mixed-' + Math.random().toString(36).slice(2, 7), []);
  if (width <= 0 || height <= 0) return null;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <SvgPattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
          <Circle cx="6" cy="6" r="2" fill={color} opacity={0.3} />
          <Path d={HEART_D} fill={color} opacity={0.32} transform="translate(14,2) rotate(-8 6 6)" />
          <Path d={STAR_D} fill={color} opacity={0.3} transform="translate(2,16) rotate(10 7 7)" />
          <Circle cx="22" cy="22" r="1.4" fill={color} opacity={0.24} />
        </SvgPattern>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${id})`} />
    </Svg>
  );
}
