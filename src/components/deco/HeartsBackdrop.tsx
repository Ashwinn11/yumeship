import { useMemo } from 'react';
import Svg, { Defs, Path, Pattern as SvgPattern, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

// Same tiled-backdrop trick as PatternBackdrop, tiny hearts instead of dots.
type Props = {
  width: number;
  height: number;
  color?: string;
};

const HEART_D = 'M6 9.5C3 7.5 2 6 2.8 4.6 3.6 3.2 5.2 4 6 5.2 6.8 4 8.4 3.2 9.2 4.6 10 6 9 7.5 6 9.5Z';

export function HeartsBackdrop({ width, height, color = Colors.sakuraDeep }: Props) {
  const id = useMemo(() => 'hearts-' + Math.random().toString(36).slice(2, 7), []);
  if (width <= 0 || height <= 0) return null;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <SvgPattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <Path d={HEART_D} fill={color} opacity={0.3} />
          <Path d={HEART_D} fill={color} opacity={0.3} transform="translate(12,12)" />
        </SvgPattern>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${id})`} />
    </Svg>
  );
}
