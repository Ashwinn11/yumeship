import { Colors } from '@/constants/theme';
import React, { useMemo } from 'react';
import Svg, { Defs, Path, Pattern as SvgPattern, Rect, Circle, Ellipse, G } from 'react-native-svg';

export type TapePattern =
  | 'stripe'
  | 'dot'
  | 'heart'
  | 'check'
  | 'floral'
  | 'lace'
  | 'grid'
  | 'gingham'
  | 'star'
  | 'solid';

type Props = {
  width?: number;
  height?: number;
  pattern?: TapePattern;
  color?: string;
  rotate?: number;
  style?: any;
};

export function WashiTape({
  width = 80,
  height = 18,
  pattern = 'heart',
  color = Colors.sakura,
  rotate = -4,
  style = {},
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
          <SvgPattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
            <Circle cx="4" cy="4" r="1.5" fill={color} />
          </SvgPattern>
        );
      case 'heart':
        return (
          <SvgPattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
            <Path
              d="M6 9.5C3 7.5 2 6 2.8 4.6 3.6 3.2 5.2 4 6 5.2 6.8 4 8.4 3.2 9.2 4.6 10 6 9 7.5 6 9.5Z"
              fill={color}
            />
          </SvgPattern>
        );
      case 'check':
        return (
          <SvgPattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
            <Rect width="4" height="4" fill={color} />
            <Rect x="4" y="4" width="4" height="4" fill={color} />
          </SvgPattern>
        );
      case 'floral':
        return (
          <SvgPattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
            {[0, 72, 144, 216, 288].map((r) => (
              <Ellipse
                key={r}
                cx="7"
                cy="4"
                rx="1.6"
                ry="2.6"
                fill={color}
                transform={`rotate(${r} 7 7)`}
              />
            ))}
            <Circle cx="7" cy="7" r="0.9" fill="#fff" opacity={0.5} />
          </SvgPattern>
        );
      case 'lace':
        return (
          <SvgPattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
            <Circle cx="5" cy="5" r="1.2" fill="none" stroke={color} strokeWidth="0.7" />
            <Circle cx="0" cy="0" r="1.2" fill="none" stroke={color} strokeWidth="0.7" />
            <Circle cx="10" cy="10" r="1.2" fill="none" stroke={color} strokeWidth="0.7" />
          </SvgPattern>
        );
      case 'grid':
        return (
          <SvgPattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
            <Path d="M6 0v6M0 6h6" stroke={color} strokeWidth="0.7" />
          </SvgPattern>
        );
      case 'gingham':
        return (
          <SvgPattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
            <Rect width="4" height="4" fill={color} opacity="0.7" />
            <Rect x="4" y="4" width="4" height="4" fill={color} opacity="0.7" />
            <Rect x="4" width="4" height="4" fill={color} opacity="0.3" />
            <Rect y="4" width="4" height="4" fill={color} opacity="0.3" />
          </SvgPattern>
        );
      case 'star':
        return (
          <SvgPattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
            <Path
              d="M7 2l1.3 3.4L11.7 6 9 8.4 9.7 12 7 10.2 4.3 12 5 8.4 2.3 6l3.4-.6L7 2Z"
              fill={color}
            />
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
      style={[{ transform: [{ rotate: `${rotate}deg` }], opacity: 0.92 }, style]}
    >
      <Defs>{renderPattern()}</Defs>
      {/* patterned layer */}
      <Rect
        width={width}
        height={height}
        fill={pattern === 'solid' ? color : `url(#${id})`}
        opacity={0.6}
      />
      {/* base translucent layer */}
      <Rect width={width} height={height} fill={color} opacity={0.22} />
      {/* highlights */}
      <Rect width={width} height={2} fill="rgba(255,255,255,0.25)" />
      <Rect y={height - 2} width={width} height={2} fill="rgba(0,0,0,0.05)" />
    </Svg>
  );
}
