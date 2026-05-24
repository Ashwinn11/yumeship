// All values ported directly from design/tokens.css — no hardcoded values anywhere else

export const colors = {
  // Foundation
  paper:        '#fdf3ee',
  paperDeep:    '#f7e6dc',
  paperSoft:    '#fcf7f2',
  vellum:       '#fffaf5',
  ink:          '#2b1a26',
  ink2:         '#5a3f53',
  ink3:         '#8a7383',
  line:         '#f0d8c8',
  lineStrong:   '#e5b9a0',

  // Brand / sentiment
  sakura:       '#f3b6c4',
  sakuraSoft:   '#fadde5',
  sakuraDeep:   '#d77a8d',
  sakuraInk:    '#8b3a4a',
  plum:         '#6e3a5a',
  lavender:     '#c7b5e3',
  lavenderSoft: '#ece4f7',
  lavenderDeep: '#8b6fc4',
  sage:         '#b4c8a5',
  sageSoft:     '#e0ebd4',
  sageDeep:     '#6e8762',
  butter:       '#f0d189',
  butterSoft:   '#fbecc4',
  butterDeep:   '#b8902a',
  peach:        '#f4b89a',
  peachSoft:    '#fde0ce',
  peachDeep:    '#b76b48',
  ember:        '#d4694a',

  // Semantic aliases
  typeRomantic: '#d77a8d',  // sakuraDeep
  typePlatonic: '#6e8762',  // sageDeep
  typeFamilial: '#b76b48',  // peachDeep
  shareNg:      '#d4694a',  // ember
  shareWelcome: '#6e8762',  // sageDeep
  shareMirror:  '#8b6fc4',  // lavenderDeep
} as const;

export const spacing = {
  s0:  2,
  s1:  4,
  s2:  8,
  s3:  12,
  s4:  16,
  s5:  20,
  s6:  24,
  s7:  32,
  s8:  40,
  s9:  56,
  s10: 72,
  s11: 96,
} as const;

export const radii = {
  r1:   4,
  r2:   8,
  r3:   12,
  r4:   18,
  r5:   24,
  r6:   32,
  pill: 999,
} as const;

export const fontSize = {
  hairline: 11,
  caption:  12,
  meta:     13,
  body:     15,
  bodyLg:   17,
  h6:       18,
  h5:       22,
  h4:       28,
  h3:       36,
  h2:       48,
  h1:       64,
  display:  96,
} as const;

// Warm plum-tinted shadows — use with React Native shadow props
export const shadows = {
  sm: {
    shadowColor: '#6e3a5a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#6e3a5a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },
  lg: {
    shadowColor: '#6e3a5a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
} as const;

// Gradients (use with LinearGradient)
export const gradients = {
  coverDefault: ['#f3b6c4', '#c79bb5', '#6b3d5b'] as const,
  onboardingBg: ['#fadde5', '#ece4f7'] as const,
  lockScreen:   ['#6b3d5b', '#2b1a26', '#0e0610'] as const,
} as const;

export type ColorKey = keyof typeof colors;
