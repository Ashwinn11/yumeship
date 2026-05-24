import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path, Circle, Ellipse, Rect, G,
  Defs, Pattern, ClipPath,
  Text as SvgText, TextPath,
} from 'react-native-svg';
import { colors } from '@/tokens/theme';

// ─── Sparkle ──────────────────────────────────────────────────
export const Sparkle = ({
  size = 14,
  color = colors.sakuraDeep,
  opacity = 1,
}: {
  size?: number;
  color?: string;
  opacity?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" opacity={opacity}>
    <Path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z" fill={color} />
  </Svg>
);

// ─── SparkleCluster ───────────────────────────────────────────
export const SparkleCluster = ({
  color = colors.sakuraDeep,
}: {
  color?: string;
}) => (
  <View style={{ width: 24, height: 24 }}>
    <View style={[StyleSheet.absoluteFill]}>
      <View style={{ position: 'absolute', top: 0, left: 4 }}>
        <Sparkle size={10} color={color} />
      </View>
      <View style={{ position: 'absolute', top: 8, left: 12 }}>
        <Sparkle size={6} color={color} opacity={0.7} />
      </View>
      <View style={{ position: 'absolute', top: 14, left: 2 }}>
        <Sparkle size={5} color={color} opacity={0.5} />
      </View>
    </View>
  </View>
);

// ─── Heart ────────────────────────────────────────────────────
export const Heart = ({
  size = 14,
  color = colors.sakuraDeep,
  outline = false,
}: {
  size?: number;
  color?: string;
  outline?: boolean;
}) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Path
      d="M8 14 C 3 11 1 8.5 1 5.5 C 1 3.5 2.5 2 4.5 2 C 6 2 7.3 2.9 8 4.3 C 8.7 2.9 10 2 11.5 2 C 13.5 2 15 3.5 15 5.5 C 15 8.5 13 11 8 14 Z"
      fill={outline ? 'none' : color}
      stroke={color}
      strokeWidth={outline ? 1.4 : 0}
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Sakura ───────────────────────────────────────────────────
export const Sakura = ({
  size = 18,
  color = colors.sakura,
  core = colors.butter,
}: {
  size?: number;
  color?: string;
  core?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    {([0, 72, 144, 216, 288] as number[]).map((rot) => (
      <Ellipse
        key={rot}
        cx="12" cy="6.5" rx="3.6" ry="5.5"
        fill={color}
        transform={`rotate(${rot} 12 12)`}
      />
    ))}
    <Circle cx="12" cy="12" r="1.8" fill={core} />
  </Svg>
);

// ─── Star ─────────────────────────────────────────────────────
export const Star = ({
  size = 14,
  color = colors.butterDeep,
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Path d="M8 1 L9.8 5.8 L15 6.3 L11 9.7 L12.3 14.8 L8 12 L3.7 14.8 L5 9.7 L1 6.3 L6.2 5.8 Z" fill={color} />
  </Svg>
);

// ─── Ribbon ───────────────────────────────────────────────────
export const Ribbon = ({
  size = 26,
  color = colors.sakuraDeep,
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size * 1.6} height={size} viewBox="0 0 40 24" fill={color}>
    <Path d="M20 12 C 14 4, 4 4, 4 12 C 4 20, 14 20, 20 12 Z" />
    <Path d="M20 12 C 26 4, 36 4, 36 12 C 36 20, 26 20, 20 12 Z" />
    <Circle cx="20" cy="12" r="3" />
    <Path d="M18 14 L 14 22 L 18 21 Z" />
    <Path d="M22 14 L 26 22 L 22 21 Z" />
  </Svg>
);

// ─── WashiTape ────────────────────────────────────────────────
export const WashiTape = ({
  width = 80,
  height = 18,
  pattern = 'stripe' as 'stripe' | 'dot' | 'heart' | 'check' | 'solid',
  color = colors.sakura,
  rotate = -3,
}: {
  width?: number;
  height?: number;
  pattern?: 'stripe' | 'dot' | 'heart' | 'check' | 'solid';
  color?: string;
  rotate?: number;
}) => {
  const id = useMemo(() => 'wt-' + Math.random().toString(36).slice(2, 7), []);
  return (
    <View style={{ transform: [{ rotate: `${rotate}deg` }] }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} opacity={0.85}>
        <Defs>
          {pattern === 'stripe' && (
            <Pattern id={id} width="6" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <Rect width="3" height="10" fill={color} />
            </Pattern>
          )}
          {pattern === 'dot' && (
            <Pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
              <Circle cx="3" cy="3" r="1.2" fill={color} />
            </Pattern>
          )}
          {pattern === 'heart' && (
            <Pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
              <Path d="M5 8 C 2 6, 1.5 4.5, 2.5 3.5 C 3.5 2.5, 5 3.5, 5 4.5 C 5 3.5, 6.5 2.5, 7.5 3.5 C 8.5 4.5, 8 6, 5 8 Z" fill={color} />
            </Pattern>
          )}
          {pattern === 'check' && (
            <Pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
              <Rect width="3" height="3" fill={color} />
              <Rect x="3" y="3" width="3" height="3" fill={color} />
            </Pattern>
          )}
        </Defs>
        <Rect
          width={width} height={height}
          fill={pattern === 'solid' ? color : `url(#${id})`}
          opacity={0.55}
        />
        <Rect width={width} height={height} fill={color} opacity={0.25} />
        <Path d={`M 0 0 L ${width} 0 L ${width} 2 L 0 2 Z`} fill="rgba(255,255,255,0.15)" />
      </Svg>
    </View>
  );
};

// ─── Seal ─────────────────────────────────────────────────────
export const Seal = ({
  size = 56,
  color = colors.sakuraDeep,
  label = 'yume',
  ja = '夢',
  rotate = -8,
}: {
  size?: number;
  color?: string;
  label?: string;
  ja?: string;
  rotate?: number;
}) => {
  const id = useMemo(() => 'seal-' + Math.random().toString(36).slice(2, 7), []);
  const textContent = `★ ${label.toUpperCase()} ・ ${label.toUpperCase()} ・ ${label.toUpperCase()} ・ ${label.toUpperCase()} ・ `;
  return (
    <View style={{ transform: [{ rotate: `${rotate}deg` }] }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <Path id={id} d="M 50 50 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0" />
        </Defs>
        <Circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="2,3" />
        <Circle cx="50" cy="50" r="32" fill="none" stroke={color} strokeWidth="2" />
        <SvgText fontFamily="DM Sans, sans-serif" fontSize="11" fill={color} fontWeight="600" letterSpacing="2">
          <TextPath href={`#${id}`} startOffset="0%">{textContent}</TextPath>
        </SvgText>
        <SvgText
          x="50" y="58" textAnchor="middle"
          fill={color} fontFamily="Klee One, serif"
          fontSize="28" fontWeight="600"
        >
          {ja}
        </SvgText>
      </Svg>
    </View>
  );
};

// ─── QuoteMark ────────────────────────────────────────────────
export const QuoteMark = ({
  size = 40,
  color = colors.sakura,
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill={color}>
    <Path d="M8 22 C 8 14, 12 9, 18 7 L 19 10 C 14 12, 12 15, 12 18 C 13 17, 14 16.5, 15.5 16.5 C 18 16.5, 20 18.5, 20 21 C 20 23.5, 18 25.5, 15.5 25.5 C 11 25.5, 8 23, 8 22 Z" />
    <Path d="M24 22 C 24 14, 28 9, 34 7 L 35 10 C 30 12, 28 15, 28 18 C 29 17, 30 16.5, 31.5 16.5 C 34 16.5, 36 18.5, 36 21 C 36 23.5, 34 25.5, 31.5 25.5 C 27 25.5, 24 23, 24 22 Z" />
  </Svg>
);

// ─── Pin ──────────────────────────────────────────────────────
export const Pin = ({
  size = 16,
  color = colors.sakuraDeep,
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Ellipse cx="8" cy="5" rx="4" ry="3" fill={color} />
    <Ellipse cx="6.5" cy="4" rx="1.2" ry="0.8" fill="rgba(255,255,255,0.5)" />
    <Path d="M8 8 L 8 14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </Svg>
);

// ─── Cloud ────────────────────────────────────────────────────
export const Cloud = ({
  size = 30,
  color = colors.paperDeep,
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size * 1.5} height={size} viewBox="0 0 45 30" fill={color}>
    <Circle cx="11" cy="18" r="9" />
    <Circle cx="22" cy="13" r="11" />
    <Circle cx="33" cy="18" r="9" />
    <Rect x="8" y="18" width="28" height="9" rx="3" />
  </Svg>
);

// ─── SakuraConfetti ───────────────────────────────────────────
const CONFETTI_FLOWERS = [
  [50, 40, 14, colors.sakura, 0.3],
  [110, 90, 9, colors.lavender, 0.25],
  [200, 60, 18, colors.sakura, 0.2],
  [300, 50, 11, colors.butter, 0.3],
  [350, 130, 14, colors.sakura, 0.25],
  [60, 180, 10, colors.sage, 0.3],
  [160, 220, 16, colors.sakura, 0.22],
  [260, 200, 12, colors.lavender, 0.28],
  [340, 280, 9, colors.sakura, 0.3],
  [40, 320, 14, colors.butter, 0.25],
  [180, 340, 11, colors.sakura, 0.3],
  [280, 350, 9, colors.lavender, 0.25],
] as const;

export const SakuraConfetti = () => (
  <Svg
    viewBox="0 0 400 400"
    preserveAspectRatio="xMidYMid slice"
    style={StyleSheet.absoluteFill}
  >
    {CONFETTI_FLOWERS.map(([cx, cy, r, c, o], i) => (
      <G key={i} transform={`translate(${cx},${cy}) rotate(${(i * 37) % 360})`} opacity={o}>
        {([0, 72, 144, 216, 288] as number[]).map((rot) => (
          <Ellipse
            key={rot}
            cx="0" cy={String(-r * 0.4)}
            rx={String(r * 0.4)} ry={String(r * 0.6)}
            fill={c}
            transform={`rotate(${rot} 0 0)`}
          />
        ))}
      </G>
    ))}
  </Svg>
);
