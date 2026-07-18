// Shared background color palette — used by the ship-template background
// customizer and the profile-card customizer so both feel like one system.
export const BG_COLORS = [
  // neutrals
  '#ffffff', '#faf7f4', '#f5f0eb', '#ede8e3', '#e0d8d0',
  '#1a1a1a', '#2c2c2c', '#3d3d3d', '#555555', '#888888',
  // pinks / roses
  '#fce4ec', '#f8bbd0', '#f48fb1', '#e91e8c', '#c2185b',
  '#fff0f3', '#ffe4e8', '#ffb3c1', '#ff4d6d', '#a4133c',
  // purples / lavender
  '#f3e5f5', '#e1bee7', '#ce93d8', '#9c27b0', '#6a1b9a',
  '#ede7f6', '#d1c4e9', '#b39ddb', '#7e57c2', '#4527a0',
  // blues
  '#e3f2fd', '#bbdefb', '#90caf9', '#1e88e5', '#0d47a1',
  '#e0f7fa', '#b2ebf2', '#80deea', '#00acc1', '#006064',
  // greens / sage
  '#e8f5e9', '#c8e6c9', '#a5d6a7', '#43a047', '#1b5e20',
  '#f1f8e9', '#dcedc8', '#c5e1a5', '#7cb342', '#33691e',
  // warm / peachy
  '#fff8e1', '#ffecb3', '#ffe082', '#ffa000', '#e65100',
  '#fbe9e7', '#ffccbc', '#ffab91', '#ff5722', '#bf360c',
  // special
  '#fdf6e3', '#f5deb3', '#deb887', '#d2691e', '#8b4513',
] as const;

// Curated for text — legible against most of the palette above, no near-invisible pairs.
export const TEXT_COLORS = [
  '#1a1a1a', '#3d3d3d', '#555555', '#faf7f4', '#ffffff',
  '#a4133c', '#c2185b', '#6a1b9a', '#4527a0', '#0d47a1',
  '#006064', '#1b5e20', '#33691e', '#e65100', '#bf360c',
  '#8b4513', '#d2691e',
] as const;
