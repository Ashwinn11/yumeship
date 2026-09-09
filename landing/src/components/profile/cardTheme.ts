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
  /** comma-joined set of border-frame accents ('lace' | 'pattern'), e.g. "lace,pattern",
   *  "lace", or "" for no frame at all. See parseBorderFrame/buildBorderFrame. */
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

export const BORDER_FRAMES = ['lace', 'pattern'] as const;
export type BorderFrameKey = (typeof BORDER_FRAMES)[number];

export function parseBorderFrame(raw: string): { lace: boolean; pattern: boolean } {
  const parts = (raw || '').split(',').filter(Boolean);
  return { lace: parts.includes('lace'), pattern: parts.includes('pattern') };
}

export function buildBorderFrame(lace: boolean, pattern: boolean): string {
  return [lace ? 'lace' : '', pattern ? 'pattern' : ''].filter(Boolean).join(',');
}

export const NAME_FONTS = ['', 'script', 'marker', 'klee'] as const;
export type NameFontKey = (typeof NAME_FONTS)[number];
