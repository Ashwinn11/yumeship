import Svg, { Path } from 'react-native-svg';

import { Colors } from '@/constants/theme';

// Small line-art glyphs that flank a display name — the black-outlined
// ornaments this community sets around theirs ("angel ⟡", "☆: … :☆").
// Stroke-only on purpose: filled shapes read as stickers, outlines read as
// penwork, and penwork is what they use.

export const NAME_ORNAMENTS = ['', 'wing', 'swash', 'sparkle', 'bow', 'heart', 'star'] as const;
export type NameOrnamentKey = (typeof NAME_ORNAMENTS)[number];

type Props = {
  kind: string;
  size?: number;
  color?: string;
  /** mirrors the glyph, so a pair reads as a matched set around the name */
  flip?: boolean;
};

const PATHS: Record<string, string> = {
  // a folded wing with a trailing tail-stroke
  wing: 'M2 15c3.5.6 6.4-.4 8.7-3M3.4 11.2c3.2.5 5.8-.4 7.8-2.7M6 7.4c2.4.4 4.4-.3 5.9-2M11 17c3.4-1.2 6-3.9 7.6-8.1M18.6 8.9c.9-2.3 1.3-4 1.4-5.4',
  // a calligraphic flourish
  swash: 'M1.5 12c2.6-4.4 5.2-4.7 6.3-1.6.9 2.6-.6 5-2.4 4.5-1.7-.5-1.3-3.3 1.2-4.6 2.3-1.2 5 .3 7 2 1.9 1.6 3.8 2 5.4-.3',
  // four-point twinkle with a small companion
  sparkle: 'M9 2.5c.9 4 1.6 4.7 5.5 5.6-3.9.9-4.6 1.6-5.5 5.6-.9-4-1.6-4.7-5.5-5.6 3.9-.9 4.6-1.6 5.5-5.6ZM17 13.4c.4 1.9.8 2.2 2.6 2.6-1.8.4-2.2.7-2.6 2.6-.4-1.9-.8-2.2-2.6-2.6 1.8-.4 2.2-.7 2.6-2.6Z',
  // a ribbon bow, drawn as two loops and a knot
  bow: 'M10 10.5C7.6 7.2 4.4 6.2 2.8 7.8 1.2 9.4 2.4 12.6 6 13.4M10 10.5c2.4-3.3 5.6-4.3 7.2-2.7 1.6 1.6.4 4.8-3.2 5.6M6 13.4c1.5.4 3 .1 4-1.4M14 13.4c-1.5.4-3 .1-4-1.4M8.6 11.7c.4 1 1 1.6 1.4 1.6s1-.6 1.4-1.6',
  // heart with a small trailing curl
  heart: 'M10 17.5C4.6 14.2 2 11.4 2 8.1 2 5.7 3.8 4 6 4c1.6 0 3.1 1 4 2.5C10.9 5 12.4 4 14 4c2.2 0 4 1.7 4 4.1 0 3.3-2.6 6.1-8 9.4Z',
  // five-point star
  star: 'M10 2.6l2.3 5.1 5.5.6-4.1 3.7 1.2 5.4L10 14.6l-4.9 2.8 1.2-5.4L2.2 8.3l5.5-.6L10 2.6Z',
};

export function NameOrnament({ kind, size = 18, color = Colors.ink, flip = false }: Props) {
  const d = PATHS[kind];
  if (!d) return null;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      style={flip ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      <Path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
