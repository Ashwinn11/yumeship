import { Colors } from '@/constants/theme';
import { useMemo } from 'react';
import Svg, { Defs, Path, Pattern as SvgPattern, Rect, Circle } from 'react-native-svg';

// design/deco.jsx — WashiTape
// Tape strip with patterned fill. Patterns: stripe / dot / heart / check
type TapePattern = 'stripe' | 'dot' | 'heart' | 'check' | 'solid';

type Props = {
  width?: number;
  height?: number;
  pattern?: TapePattern;
  color?: string;
  rotate?: number;
};

export function WashiTape({
  width = 80,
  height = 18,
  pattern = 'stripe',
  color = Colors.sakura,
  rotate = -3,
}: Props) {
  const id = useMemo(() => 'wt-' + Math.random().toString(36).slice(2, 7), []);

  const renderPattern = () => {
    switch (pattern) {
      case 'stripe':
        return (
          <SvgPattern id={id} width="6" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Rect width="3" height="10" fill={color} />
          </SvgPattern>
        );
      case 'dot':
        return (
          <SvgPattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
            <Circle cx="3" cy="3" r="1.2" fill={color} />
          </SvgPattern>
        );
      case 'heart':
        return (
          <SvgPattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
            <Path
              d="M5 8 C 2 6, 1.5 4.5, 2.5 3.5 C 3.5 2.5, 5 3.5, 5 4.5 C 5 3.5, 6.5 2.5, 7.5 3.5 C 8.5 4.5, 8 6, 5 8 Z"
              fill={color}
            />
          </SvgPattern>
        );
      case 'check':
        return (
          <SvgPattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
            <Rect width="3" height="3" fill={color} />
            <Rect x="3" y="3" width="3" height="3" fill={color} />
          </SvgPattern>
        );
      default:
        return null;
    }
  };

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ transform: [{ rotate: `${rotate}deg` }], opacity: 0.85 }}
    >
      <Defs>{renderPattern()}</Defs>
      {/* patterned layer */}
      <Rect
        width={width}
        height={height}
        fill={pattern === 'solid' ? color : `url(#${id})`}
        opacity={0.55}
      />
      {/* base translucent layer */}
      <Rect width={width} height={height} fill={color} opacity={0.25} />
      {/* deckle edge highlight */}
      <Path d={`M 0 0 L ${width} 0 L ${width} 2 L 0 2 Z`} fill="rgba(255,255,255,0.15)" />
    </Svg>
  );
}
