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
  /** comma-joined set of border-frame accents, e.g. "lace,pattern", "lattice", or ""
   *  for no frame at all. See BORDER_FRAMES / parseBorderFrame / buildBorderFrame. */
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

/** One link in a profile's "links" section — a label plus where it goes. */
export type ProfileLink = {
  id: string;
  /** e.g. "Instagram", "Spotify playlist" — shown as the row's title */
  label: string;
  url: string;
};

export const LINKS_MAX = 8;
export const LINK_LABEL_MAX = 30;

/** Parses a `user_links`/`fo.links` JSON string, tolerating anything malformed. */
export function parseProfileLinks(raw: string): ProfileLink[] {
  let v: unknown;
  try { v = JSON.parse(raw || '[]'); } catch { return []; }
  if (!Array.isArray(v)) return [];
  return v
    .map((entry) => {
      const e = (entry ?? {}) as Record<string, unknown>;
      return {
        id: typeof e.id === 'string' ? e.id : String(e.id ?? ''),
        label: typeof e.label === 'string' ? e.label : '',
        url: typeof e.url === 'string' ? e.url : '',
      };
    })
    .filter((l) => l.url);
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
// none claims the whole card the way the old torn/polaroid edges did, so
// there's no exclusive pick to model. Just one flat set, stored comma-joined
// in `borderStyle`. 'lace'/'lattice' are full-perimeter bands (they replace
// the card's own 1px border in ProfileCard.tsx); the rest are inset accents
// or full-card backdrop fills that sit fine alongside the plain border.
export const BORDER_FRAMES = [
  'lace', 'lattice', 'stitch', 'flourish', 'bracket', 'beaded', 'double',
  'pattern', 'scatter', 'wash', 'heartRipple', 'sakuraDrift', 'hearts', 'stars', 'mixed',
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
