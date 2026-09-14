// Web mirror of src/components/profile/cardTheme.ts
// Shared shape for profile-card presentation customization.

export type CardTheme = {
  pageBgColor: string;
  pageBgImage: string;
  cardBgColor: string;
  cardBgImage: string;
  /** two comma-joined hex colors, e.g. "#fce4ec,#e1bee7" — empty when unset */
  cardBgGradient: string;
  /** hero card has no fill at all, letting the page background show through */
  cardTransparent: boolean;
  textColor: string;
  /** comma-joined set of border-frame accents, e.g. "lace,pattern", "lattice", or ""
   *  for no frame at all. See BORDER_FRAMES / parseBorderFrame / buildBorderFrame. */
  borderStyle: string;
  /** '' (default display font) | 'script' | 'marker' | 'klee' */
  nameFont: string;
  /** '' (avatar above name, everything centered) | 'left' (avatar beside name, Instagram-style) */
  cardLayout: string;
};

/** One flag on a profile. */
export type ProfileFlag = {
  id: string;
  /** '' (none) | a flag key → stripes | any other string → shown literally. Ignored once imageUrl is set. */
  flag: string;
  /** custom uploaded flag image — wins over `flag` when set */
  imageUrl: string;
  /** user's own label */
  text: string;
};

// All accents are independently toggleable and layer on top of each other —
// 'lace'/'lattice' are full-perimeter bands (they replace the hero's own 1px
// border in ProfileCard.tsx); the rest are inset accents or full-card
// backdrop fills that sit fine alongside the plain border.
export const BORDER_FRAMES = [
  'lace', 'lattice', 'stitch', 'flourish', 'bracket', 'beaded', 'double',
  'pattern', 'scatter', 'wash', 'heartRipple', 'sakuraDrift', 'hearts', 'stars', 'mixed',
] as const;
export type BorderFrameKey = (typeof BORDER_FRAMES)[number];

export function parseBorderFrame(raw: string): Record<BorderFrameKey, boolean> {
  const parts = new Set((raw || '').split(',').filter(Boolean));
  return Object.fromEntries(BORDER_FRAMES.map((k) => [k, parts.has(k)])) as Record<BorderFrameKey, boolean>;
}

