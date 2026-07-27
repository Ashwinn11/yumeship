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
  /** '' (default) | 'dashed' | 'double' | 'torn' | 'polaroid' */
  borderStyle: string;
  /** '' (classic washi+sparkle) | 'sparkles' | 'hearts' | 'stars' | 'floral' | 'washi' | 'none' */
  decoration: string;
  /** '' (default display font) | 'script' | 'marker' */
  nameFont: string;
  /** short free-text flair badge shown near the name, e.g. "comfort character" */
  statusLabel: string;
};

export const GRADIENT_PRESETS: [string, string][] = [
  ['#fce4ec', '#e1bee7'], // sakura → lavender
  ['#e0f7fa', '#e1bee7'], // sky → lavender
  ['#fff8e1', '#f8bbd0'], // butter → rose
  ['#e8f5e9', '#fff8e1'], // sage → butter
  ['#fbe9e7', '#f3e5f5'], // peach → plum
  ['#1a1a1a', '#3d3d3d'], // ink duotone
];

export const BORDER_STYLES = ['', 'dashed', 'double', 'torn', 'polaroid'] as const;
export type BorderStyleKey = (typeof BORDER_STYLES)[number];

export const DECORATION_PRESETS = ['', 'sparkles', 'hearts', 'stars', 'floral', 'washi', 'none'] as const;
export type DecorationKey = (typeof DECORATION_PRESETS)[number];

export const NAME_FONTS = ['', 'script', 'marker'] as const;
export type NameFontKey = (typeof NAME_FONTS)[number];
