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
  /** comma-joined: one edge ('' | 'torn' | 'polaroid' | 'lace') plus any number of
   *  decorations ('stickers' | 'pattern'), e.g. "lace,stickers,pattern" or "" or
   *  "stickers" (plain edge, no mat). See parseBorderStyle/buildBorderStyle. */
  borderStyle: string;
  /** '' (default display font) | 'script' | 'marker' | 'klee' */
  nameFont: string;
  /** '' (none) | a NAME_ORNAMENTS key — line-art glyphs flanking the display name */
  nameOrnament: string;
  /** '' (none) | 'custom' — frames just the avatar photo; more presets coming */
  avatarFrame: string;
  /** uploaded custom frame image/gif — only meaningful when avatarFrame is 'custom' */
  avatarFrameUrl: string;
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

// Two independent axes, both stored together in the one `borderStyle` string
// (comma-joined) so no schema change is needed. Edge treatments physically
// overlap the same strip of card, so only one applies at a time; decorations
// are additive and layer on top of any edge (and each other).
export const BORDER_EDGES = ['', 'torn', 'polaroid', 'lace'] as const;
export type BorderEdgeKey = (typeof BORDER_EDGES)[number];

export const BORDER_DECORATIONS = ['stickers', 'pattern'] as const;
export type BorderDecorationKey = (typeof BORDER_DECORATIONS)[number];

export function parseBorderStyle(raw: string): { edge: BorderEdgeKey; stickers: boolean; pattern: boolean } {
  const parts = (raw || '').split(',').filter(Boolean);
  const edge = (BORDER_EDGES as readonly string[]).includes(parts.find((p) => p !== 'stickers' && p !== 'pattern') || '')
    ? ((parts.find((p) => p !== 'stickers' && p !== 'pattern') || '') as BorderEdgeKey)
    : '';
  return { edge, stickers: parts.includes('stickers'), pattern: parts.includes('pattern') };
}

export function buildBorderStyle(edge: string, stickers: boolean, pattern: boolean): string {
  return [edge, stickers ? 'stickers' : '', pattern ? 'pattern' : ''].filter(Boolean).join(',');
}

export const NAME_FONTS = ['', 'script', 'marker', 'klee'] as const;
export type NameFontKey = (typeof NAME_FONTS)[number];

export { NAME_ORNAMENTS, type NameOrnamentKey } from '@/components/deco/NameOrnament';

export const AVATAR_FRAMES = ['', 'custom'] as const;
export type AvatarFrameKey = (typeof AVATAR_FRAMES)[number];
