import { Dimensions, Platform } from 'react-native';

// Scale multiplier — read once at module load; safe because Dimensions is
// available before any component renders, and iPad portrait is always ≥ 768pt.
const _w = Dimensions.get('window').width;
const _s = _w >= 768 ? 1.22 : 1.0;
/** Scale a font size for the current device (iPad gets 1.22×). */
export const sf = (n: number) => Math.round(n * _s);
const ss = (n: number) => Math.round(n * (_w >= 768 ? 1.1 : 1.0));

// ─── Foundation ──────────────────────────────────────────────────────────────
export const Paper = {
  paper: '#fdf3ee', // primary background
  paperDeep: '#f7e6dc', // secondary surface
  paperSoft: '#fcf7f2', // card surface
  vellum: '#fffaf5', // highest surface, popovers
} as const;

export const Ink = {
  ink: '#2b1a26', // primary text — deep wine
  ink2: '#5a3f53', // secondary
  ink3: '#8a7383', // tertiary, hints, meta
} as const;

export const Line = {
  line: '#f0d8c8',
  lineStrong: '#e5b9a0',
} as const;

// ─── Brand palette ───────────────────────────────────────────────────────────
export const Sakura = {
  sakura: '#f3b6c4',
  sakuraSoft: '#fadde5',
  sakuraDeep: '#d77a8d', // primary action
  sakuraInk: '#8b3a4a',
} as const;

export const Plum = {
  plum: '#6e3a5a', // polycule / special
} as const;

export const Lavender = {
  lavender: '#c7b5e3',
  lavenderSoft: '#ece4f7',
  lavenderDeep: '#8b6fc4',
} as const;

export const Sage = {
  sage: '#b4c8a5',
  sageSoft: '#e0ebd4',
  sageDeep: '#6e8762',
} as const;

export const Butter = {
  butter: '#f0d189',
  butterSoft: '#fbecc4',
  butterDeep: '#b8902a',
} as const;

export const Peach = {
  peach: '#f4b89a',
  peachSoft: '#fde0ce',
  peachDeep: '#b76b48',
} as const;

export const Ember = {
  ember: '#d4694a', // alerts (rare)
} as const;

// ─── Semantic / relationship type colors ─────────────────────────────────────
export const RelationshipColors = {
  romantic: Sakura.sakuraDeep,
  platonic: Sage.sageDeep,
  familial: Peach.peachDeep,
} as const;

export const SharingColors = {
  ng: Ember.ember,
  welcome: Sage.sageDeep,
  mirror: Lavender.lavenderDeep,
} as const;

// ─── Flat color map (for indexed lookups) ────────────────────────────────────
export const Colors = {
  ...Paper,
  ...Ink,
  ...Line,
  ...Sakura,
  ...Plum,
  ...Lavender,
  ...Sage,
  ...Butter,
  ...Peach,
  ...Ember,
} as const;

export type ColorToken = keyof typeof Colors;

// ─── Typography ───────────────────────────────────────────────────────────────
// Font family names match the asset filenames loaded via expo-font.
export const FontFamily = {
  display: 'InstrumentSerif-Italic',
  displayItalic: 'InstrumentSerif-Italic',
  ui: 'Fredoka-Regular',
  uiMedium: 'Fredoka-Medium',
  uiSemiBold: 'Fredoka-SemiBold',
  ja: 'KleeOne-Regular',
  marker: 'Fredoka-Regular',
  markerMedium: 'Fredoka-Medium',
  markerBold: 'Fredoka-SemiBold',
  // tokens.css imports Caveat wght@500;700 — base is Medium (500), not Regular (400)
  script: 'Caveat-Bold',
  scriptBold: 'Caveat-Bold',
} as const;

export const FontSize = {
  hairline: sf(11),
  caption: sf(12),
  meta: sf(13),
  body: sf(15),
  bodyLg: sf(17),
  h6: sf(18),
  h5: sf(22),
  h4: sf(28),
  h3: sf(36),
  h2: sf(48),
  h1: sf(64),
  display: sf(96),
};

// ─── Spacing (4-step base) ────────────────────────────────────────────────────
export const Spacing = {
  s0: ss(2),
  s1: ss(4),
  s2: ss(8),
  s3: ss(12),
  s4: ss(16),
  s5: ss(20),
  s6: ss(24),
  s7: ss(32),
  s8: ss(40),
  s9: ss(56),
  s10: ss(72),
  s11: ss(96),
};

// ─── Radii (soft, never sharp) ───────────────────────────────────────────────
export const Radius = {
  r1: 4,
  r2: 8,
  r3: 12,
  r4: 18,
  r5: 24,
  r6: 32,
  pill: 999,
} as const;

// ─── Shadows (warm, plum-tinted) ─────────────────────────────────────────────
// React Native shadows split by platform.
const shadowColor = 'rgba(110, 58, 90, 1)'; // plum shadow tint

export const Shadow = {
  s1: Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    android: { elevation: 2 },
    default: {},
  }),
  s2: Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
    },
    android: { elevation: 5 },
    default: {},
  }),
  s3: Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 28,
    },
    android: { elevation: 10 },
    default: {},
  }),
} as const;

// ─── Backward-compat shims (Expo starter files — remove when replaced) ───────
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
export type ThemeColor = 'text' | 'background' | 'backgroundElement' | 'backgroundSelected' | 'textSecondary';
export const Fonts = {
  sans: FontFamily.ui,
  serif: FontFamily.display,
  rounded: FontFamily.ui,
  mono: FontFamily.marker,
} as const;

// ─── Motion ───────────────────────────────────────────────────────────────────
export const Duration = {
  d1: 120,
  d2: 220,
  d3: 360,
} as const;

// Bezier control points — use with Reanimated: Easing.bezier(...spread)
export const Easing = {
  // --ease-soft: cubic-bezier(0.32, 0.72, 0.24, 1)  — gentle settle
  soft: [0.32, 0.72, 0.24, 1] as const,
  // --ease-out:  cubic-bezier(0.16, 1, 0.3, 1)      — snappy overshoot
  out: [0.16, 1.00, 0.30, 1] as const,
} as const;
