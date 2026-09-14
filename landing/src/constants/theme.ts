// Web mirror of src/constants/theme.ts
// Single source of truth for design tokens across web and mobile.

const Paper = {
  paper: '#fdf3ee',     // primary background
  paperDeep: '#f7e6dc', // secondary surface
  paperSoft: '#fcf7f2', // card surface
  vellum: '#fffaf5',    // highest surface, popovers
} as const;

const Ink = {
  ink: '#2b1a26',  // primary text — deep wine
  ink2: '#5a3f53', // secondary
  ink3: '#8a7383', // tertiary, hints, meta
} as const;

const Line = {
  line: '#f0d8c8',
  lineStrong: '#e5b9a0',
} as const;

const Sakura = {
  sakura: '#f3b6c4',
  sakuraSoft: '#fadde5',
  sakuraDeep: '#d77a8d', // primary action
  sakuraInk: '#8b3a4a',
} as const;

const Plum = {
  plum: '#6e3a5a', // polycule / special
} as const;

const Lavender = {
  lavender: '#c7b5e3',
  lavenderSoft: '#ece4f7',
  lavenderDeep: '#8b6fc4',
} as const;

const Sage = {
  sage: '#b4c8a5',
  sageSoft: '#e0ebd4',
  sageDeep: '#6e8762',
} as const;

const Butter = {
  butter: '#f0d189',
  butterSoft: '#fbecc4',
  butterDeep: '#b8902a',
} as const;

const Peach = {
  peach: '#f4b89a',
  peachSoft: '#fde0ce',
  peachDeep: '#b76b48',
} as const;

const Ember = {
  ember: '#d4694a', // alerts (rare)
} as const;

export const RelationshipColors = {
  romantic: Sakura.sakuraDeep,
  platonic: Sage.sageDeep,
  familial: Peach.peachDeep,
  queerplatonic: Lavender.lavenderDeep,
  comfort: Butter.butterDeep,
} as const;

export type RelationshipType = keyof typeof RelationshipColors;

export const RelationshipLabels: Record<RelationshipType, string> = {
  romantic: 'romantic',
  platonic: 'platonic',
  familial: 'familial',
  queerplatonic: 'queerplatonic',
  comfort: 'comfort',
};

export const SharingColors = {
  no: Ember.ember,
  yes: Sage.sageDeep,
  selective: Lavender.lavenderDeep,
  mirror: Butter.butterDeep,
} as const;

export type SharingStatus = keyof typeof SharingColors;

export const SharingLabels: Record<SharingStatus, string> = {
  no: 'no',
  yes: 'yes',
  selective: 'selective',
  mirror: 'mirror',
};

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
