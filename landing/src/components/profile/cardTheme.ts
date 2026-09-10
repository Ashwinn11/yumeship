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

export const FLAGS_MAX = 12;
export const FLAG_TEXT_MAX = 40;

/** Parses a `user_flags`/`fo.flags` JSON string, tolerating anything malformed. */
export function parseProfileFlags(raw: string): ProfileFlag[] {
  let v: unknown;
  try { v = JSON.parse(raw || '[]'); } catch { return []; }
  if (!Array.isArray(v)) return [];
  return v.map((entry) => {
    const e = (entry ?? {}) as Record<string, unknown>;
    return {
      id: typeof e.id === 'string' ? e.id : String(e.id ?? ''),
      flag: typeof e.flag === 'string' ? e.flag : typeof e.icon === 'string' ? e.icon : '',
      imageUrl: typeof e.imageUrl === 'string' ? e.imageUrl : '',
      text: typeof e.text === 'string' ? e.text : '',
    };
  });
}

export const GRADIENT_PRESETS: [string, string][] = [
  ['#fce4ec', '#e1bee7'], // sakura → lavender
  ['#e0f7fa', '#e1bee7'], // sky → lavender
  ['#fff8e1', '#f8bbd0'], // butter → rose
  ['#e8f5e9', '#fff8e1'], // sage → butter
  ['#fbe9e7', '#f3e5f5'], // peach → plum
  ['#1a1a1a', '#3d3d3d'], // ink duotone
];

// All accents are independently toggleable and layer on top of each other —
// 'lace'/'lattice' are full-perimeter bands (they replace the hero's own 1px
// border in ProfileCard.tsx); the rest are inset accents or full-card
// backdrop fills that sit fine alongside the plain border.
export const BORDER_FRAMES = [
  'lace', 'lattice', 'stitch', 'flourish', 'bracket', 'beaded', 'double',
  'pattern', 'scatter', 'wash', 'heartRipple', 'sakuraDrift',
] as const;
export type BorderFrameKey = (typeof BORDER_FRAMES)[number];

export function parseBorderFrame(raw: string): Record<BorderFrameKey, boolean> {
  const parts = new Set((raw || '').split(',').filter(Boolean));
  return Object.fromEntries(BORDER_FRAMES.map((k) => [k, parts.has(k)])) as Record<BorderFrameKey, boolean>;
}

export function buildBorderFrame(active: Partial<Record<BorderFrameKey, boolean>>): string {
  return BORDER_FRAMES.filter((k) => active[k]).join(',');
}

export const NAME_FONTS = ['', 'script', 'marker', 'klee'] as const;
export type NameFontKey = (typeof NAME_FONTS)[number];
