// Shared shape for profile-card presentation customization — same fields for
// the "me" profile (stored in global settings) and each F/O profile (stored
// on the fo table), so one sheet/component can theme either.
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

/** One flag on a profile. Sexuality and badges used to be two separate fields
 *  saying the same thing; this is the merge of them. A flag is an identity we
 *  can draw stripes for, any symbol off the keyboard, or an image of their own —
 *  always with their own words beside it. */
export type ProfileFlag = {
  id: string;
  /** '' (none) | a SEXUALITY_OPTIONS key → stripes | any other string → shown
   *  literally, so ✧ 🎀 ୨୧ work. Ignored once imageUrl is set. */
  flag: string;
  /** custom uploaded flag image — wins over `flag` when set */
  imageUrl: string;
  /** entirely their words */
  text: string;
};

export const FLAGS_MAX = 12;
export const FLAG_TEXT_MAX = 40;

/** Parses a `user_flags`/`fo.flags` JSON string, tolerating anything malformed.
 *  Reads the older `{icon}` shape too, so rows written before the merge survive. */
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

// Both accents are independently toggleable and layer on top of each other —
// lace frames the edge, pattern fills the backdrop, neither claims the whole
// card the way the old torn/polaroid edges did, so there's no exclusive pick
// left to model. Just one flat set, stored comma-joined in `borderStyle`.
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
