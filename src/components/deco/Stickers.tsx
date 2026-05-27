import { Colors } from '@/constants/theme';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

type StickerProps = {
  size?: number;
  style?: ViewStyle;
  color?: string;
};

function StickerShadow({
  children,
  w,
  h,
  style,
}: {
  children: React.ReactNode;
  w: number;
  h: number;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          width: w,
          height: h,
          shadowColor: 'rgba(110, 58, 90, 0.18)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 3,
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Envelope with heart wax seal
export function StickerEnvelope({ size = 60, style }: StickerProps) {
  const w = size;
  const h = size * 0.78;
  return (
    <StickerShadow w={w} h={h} style={style}>
      <Svg width={w} height={h} viewBox="0 0 60 48">
        <Path
          d="M5 7 Q 5 4, 8 4 L52 4 Q 55 4, 55 7 L55 41 Q 55 44, 52 44 L8 44 Q 5 44, 5 41 Z"
          fill="white"
          stroke="white"
          strokeWidth="3"
        />
        <Path
          d="M7 9 Q 7 6, 10 6 L50 6 Q 53 6, 53 9 L53 39 Q 53 42, 50 42 L10 42 Q 7 42, 7 39 Z"
          fill="#fbe8dc"
          stroke="#a8765c"
          strokeWidth="1.1"
        />
        <Path d="M7 9 L30 26 L53 9" fill="none" stroke="#a8765c" strokeWidth="1.1" />
        <Path d="M7 39 L23 28 M53 39 L37 28" stroke="#a8765c" strokeWidth="0.9" opacity="0.6" />
        <Path d="M7 9 Q 7 6, 10 6 L50 6 Q 53 6, 53 9 L30 25 Z" fill="#fff5ec" opacity="0.6" />
        <G transform="translate(30 26)">
          <Circle r="5.5" fill="#fadde5" stroke="#a8765c" strokeWidth="0.8" opacity="0.4" />
          <Path
            d="M0 4 C -3.5 1.5 -4.5 0 -3.8 -1.5 C -3 -2.8 -1.2 -2 0 -0.5 C 1.2 -2 3 -2.8 3.8 -1.5 C 4.5 0 3.5 1.5 0 4 Z"
            fill="#d77a8d"
            stroke="#8b3a4a"
            strokeWidth="0.6"
          />
        </G>
      </Svg>
    </StickerShadow>
  );
}

// Sakura branch
export function StickerSakuraBranch({ size = 70, style }: StickerProps) {
  return (
    <StickerShadow w={size} h={size} style={style}>
      <Svg width={size} height={size} viewBox="0 0 70 70">
        <G stroke="white" strokeWidth="4" fill="white">
          <Path d="M10 60 Q 22 42 35 32 Q 48 22 58 8" />
          <Ellipse cx="22" cy="50" rx="5" ry="9" transform="rotate(50 22 50)" />
          <Ellipse cx="44" cy="22" rx="5" ry="9" transform="rotate(20 44 22)" />
          <Circle cx="18" cy="58" r="8" />
          <Circle cx="34" cy="32" r="9" />
          <Circle cx="50" cy="14" r="8" />
          <Circle cx="42" cy="42" r="6" />
        </G>
        <Path
          d="M10 60 Q 22 42 35 32 Q 48 22 58 8"
          stroke="#8a5e48"
          strokeWidth="1.6"
          fill="none"
        />
        <Path d="M22 48 Q 26 45 30 42" stroke="#8a5e48" strokeWidth="1.1" fill="none" opacity="0.7" />
        <Path d="M40 26 Q 44 24 48 22" stroke="#8a5e48" strokeWidth="1.1" fill="none" opacity="0.7" />
        <G>
          <Ellipse cx="22" cy="50" rx="3.5" ry="6" fill="#9a7a8a" transform="rotate(50 22 50)" />
          <Path
            d="M19 55 Q 22 50 25 45"
            stroke="#7a5b6b"
            strokeWidth="0.6"
            fill="none"
            transform="rotate(50 22 50)"
          />
          <Ellipse cx="44" cy="22" rx="3.5" ry="6" fill="#9a7a8a" transform="rotate(20 44 22)" />
          <Path
            d="M41 27 Q 44 22 47 17"
            stroke="#7a5b6b"
            strokeWidth="0.6"
            fill="none"
            transform="rotate(20 44 22)"
          />
        </G>
        {([
          [18, 58, 6, 'a'],
          [34, 32, 7, 'b'],
          [50, 14, 6, 'c'],
          [42, 42, 4.5, 'd'],
        ] as const).map(([cx, cy, r, k]) => (
          <G key={k} transform={`translate(${cx} ${cy})`}>
            {[0, 72, 144, 216, 288].map((rot, i) => (
              <G key={i} transform={`rotate(${rot})`}>
                <Ellipse
                  cx="0"
                  cy={-r * 0.55}
                  rx={r * 0.42}
                  ry={r * 0.65}
                  fill="#f0a8b8"
                  stroke="#c46a82"
                  strokeWidth="0.6"
                />
                <Ellipse
                  cx="-0.8"
                  cy={-r * 0.7}
                  rx={r * 0.18}
                  ry={r * 0.28}
                  fill="#fadde5"
                  opacity={0.7}
                />
              </G>
            ))}
            <Circle r={r * 0.18} fill="#c46a82" />
            <Circle r={r * 0.08} fill="#8b3a4a" />
          </G>
        ))}
      </Svg>
    </StickerShadow>
  );
}

// Polaroid with moonlit landscape
export function StickerPolaroid({ size = 64, style }: StickerProps) {
  const w = size;
  const h = size * 1.18;
  return (
    <StickerShadow w={w} h={h} style={style}>
      <Svg width={w} height={h} viewBox="0 0 64 76">
        <G transform="rotate(-5 32 38)">
          <Rect x="4" y="4" width="56" height="68" rx="2" fill="white" stroke="white" strokeWidth="3" />
          <Rect x="6" y="6" width="52" height="64" fill="#fffaf5" stroke="#a8765c" strokeWidth="0.8" />
          <Defs>
            <LinearGradient id="moon-sky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#3a2a5e" />
              <Stop offset="0.5" stopColor="#7a6092" />
              <Stop offset="1" stopColor="#c7a8c0" />
            </LinearGradient>
          </Defs>
          <Rect x="9" y="9" width="46" height="44" fill="url(#moon-sky)" />
          <Circle cx="42" cy="18" r="3.5" fill="#fff3e0" />
          <Circle cx="42.8" cy="17.4" r="3.2" fill="#3a2a5e" />
          <Circle cx="41.6" cy="18.4" r="3.5" fill="#fff3e0" opacity={0.6} />
          <Circle cx="14" cy="13" r="0.7" fill="#fff3e0" />
          <Circle cx="22" cy="11" r="0.5" fill="#fff3e0" />
          <Circle cx="30" cy="16" r="0.6" fill="#fff3e0" />
          <Circle cx="50" cy="13" r="0.5" fill="#fff3e0" />
          <Path d="M9 53 L 17 42 L 23 47 L 30 38 L 37 44 L 46 36 L 55 44 L 55 53 Z" fill="#5a3a6e" opacity={0.85} />
          <Ellipse cx="20" cy="24" rx="6" ry="1.4" fill="#c7a8c0" opacity="0.6" />
          <Ellipse cx="36" cy="26" rx="5" ry="1.2" fill="#c7a8c0" opacity="0.55" />
        </G>
      </Svg>
    </StickerShadow>
  );
}

// Ticket with washi tape on top
export function StickerTicket({ size = 60, style }: StickerProps) {
  const w = size * 1.5;
  const h = size * 0.75;
  return (
    <StickerShadow w={w} h={h} style={style}>
      <Svg width={w} height={h} viewBox="0 0 90 45">
        <Path
          d="M2 8 Q 2 4, 6 4 L84 4 Q 88 4, 88 8 L88 16 Q 86 19, 86 22.5 Q 86 26, 88 29 L88 37 Q 88 41, 84 41 L60 41 L60 36 L54 36 L54 41 L6 41 Q 2 41, 2 37 L2 29 Q 4 26, 4 22.5 Q 4 19, 2 16 Z"
          fill="white"
          stroke="white"
          strokeWidth="3"
        />
        <Path
          d="M4 9 Q 4 6, 7 6 L83 6 Q 86 6, 86 9 L86 17 Q 84 20, 84 22.5 Q 84 25, 86 28 L86 36 Q 86 39, 83 39 L62 39 L62 34 L52 34 L52 39 L7 39 Q 4 39, 4 36 L4 28 Q 6 25, 6 22.5 Q 6 20, 4 17 Z"
          fill="#fadde5"
          stroke="#a8765c"
          strokeWidth="0.9"
        />
        <Path d="M58 6 V 14 M58 18 V 22 M58 26 V 30 M58 34 V 39" stroke="#a8765c" strokeWidth="0.8" strokeDasharray="2,2" />
        <G transform="rotate(-4 40 8)">
          <Rect x="20" y="-2" width="40" height="11" fill="#f3b6c4" opacity={0.85} stroke="#a8765c" strokeWidth="0.4" />
          {[24, 30, 36, 42, 48, 54].map((x) => (
            <Circle key={x} cx={x} cy="3.5" r="0.8" fill="#d77a8d" />
          ))}
        </G>
        <G transform="translate(28 25)">
          {[0, 72, 144, 216, 288].map((r) => (
            <Ellipse key={r} cx="0" cy="-3" rx="1.8" ry="2.8" fill="#d77a8d" transform={`rotate(${r})`} />
          ))}
          <Circle r="0.9" fill="#b8902a" />
        </G>
        <Path d="M40 22 H 76 M40 27 H 70" stroke="#a8765c" strokeWidth="0.5" strokeDasharray="1.5,2" />
      </Svg>
    </StickerShadow>
  );
}

// Wax seal
export function StickerWaxSeal({ size = 48, style }: StickerProps) {
  return (
    <StickerShadow w={size} h={size} style={style}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <G>
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((r) => (
            <Ellipse
              key={r}
              cx="24"
              cy="8"
              rx="4"
              ry="6"
              fill="white"
              stroke="white"
              strokeWidth="3"
              transform={`rotate(${r} 24 24)`}
            />
          ))}
          <Circle cx="24" cy="24" r="16" fill="white" stroke="white" strokeWidth="3" />
        </G>
        {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((r) => (
          <Ellipse
            key={r}
            cx="24"
            cy="9"
            rx="3.5"
            ry="5.5"
            fill="#a83a52"
            transform={`rotate(${r} 24 24)`}
          />
        ))}
        <Circle cx="24" cy="24" r="14" fill="#a83a52" />
        <Circle cx="24" cy="24" r="11" fill="#c4566a" />
        <Path
          d="M24 31 C 18 27 16 24 16 21 C 16 19 17.5 18 19 18 C 21 18 23 19 24 21 C 25 19 27 18 29 18 C 30.5 18 32 19 32 21 C 32 24 30 27 24 31 Z"
          fill="#8b3a4a"
        />
        <Path d="M18 21 Q 19 19 21 19" stroke="#e8a8b5" strokeWidth="0.8" fill="none" opacity={0.6} />
        <Path d="M14 14 Q 18 10 24 9" stroke="#e8a8b5" strokeWidth="1" fill="none" opacity={0.5} />
      </Svg>
    </StickerShadow>
  );
}

// Heart patch
export function StickerHeartPatch({ size = 42, style }: StickerProps) {
  return (
    <StickerShadow w={size} h={size} style={style}>
      <Svg width={size} height={size} viewBox="0 0 42 42">
        <Path
          d="M21 37 C 9 28 4 22 4 14 C 4 8 8 5 12 5 C 15 5 18 7 21 11 C 24 7 27 5 30 5 C 34 5 38 8 38 14 C 38 22 33 28 21 37 Z"
          fill="white"
          stroke="white"
          strokeWidth="4"
        />
        <Path
          d="M21 36 C 10 27 5 22 5 14 C 5 9 9 6 13 6 C 16 6 19 8 21 12 C 23 8 26 6 29 6 C 33 6 37 9 37 14 C 37 22 32 27 21 36 Z"
          fill="#f8c4d0"
        />
        <Path
          d="M21 33 C 12 25 8 21 8 15 C 8 11 11 9 14 9 C 17 9 19 11 21 14 C 23 11 25 9 28 9 C 31 9 34 11 34 15 C 34 21 30 25 21 33 Z"
          fill="none"
          stroke="#c46a82"
          strokeWidth="0.9"
          strokeDasharray="2,2"
        />
      </Svg>
    </StickerShadow>
  );
}

// Sakura flower (large)
export function StickerSakuraFlower({ size = 40, style }: StickerProps) {
  return (
    <StickerShadow w={size} h={size} style={style}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <G stroke="white" strokeWidth="4" fill="white">
          {[0, 72, 144, 216, 288].map((r) => (
            <Ellipse key={r} cx="20" cy="8" rx="5.5" ry="9" transform={`rotate(${r} 20 20)`} />
          ))}
          <Circle cx="20" cy="20" r="3" />
        </G>
        <Ellipse cx="32" cy="32" rx="3" ry="5" fill="#9a7a8a" transform="rotate(40 32 32)" />
        {[0, 72, 144, 216, 288].map((r) => (
          <G key={r} transform={`rotate(${r} 20 20)`}>
            <Ellipse cx="20" cy="9" rx="5" ry="8" fill="#f0a8b8" stroke="#c46a82" strokeWidth="0.7" />
            <Ellipse cx="18" cy="6" rx="2" ry="3.5" fill="#fadde5" opacity={0.7} />
          </G>
        ))}
        <Circle cx="20" cy="20" r="2.5" fill="#fff3e0" />
        <Circle cx="20" cy="20" r="1.5" fill="#c46a82" />
        {[20, 80, 140, 200, 260, 320].map((r) => {
          const x = 20 + Math.cos((r * Math.PI) / 180) * 1.8;
          const y = 20 + Math.sin((r * Math.PI) / 180) * 1.8;
          return <Circle key={r} cx={x} cy={y} r="0.5" fill="#b8902a" />;
        })}
      </Svg>
    </StickerShadow>
  );
}



// Sticker Sparkle
export function StickerSparkle({ size = 16, color = '#d77a8d', style }: StickerProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" style={style}>
      <Path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z" fill={color} />
    </Svg>
  );
}
