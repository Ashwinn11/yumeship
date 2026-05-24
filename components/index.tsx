import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, radii, spacing, fontSize, shadows } from '@/tokens/theme';

// ─── Mark (brand logo — two intersecting circles) ─────────────
export const Mark = ({
  size = 48,
  color = colors.ink,
}: {
  size?: number;
  color?: string;
}) => {
  const fill = color === colors.ink ? colors.sakura : color;
  const dot = color === colors.ink ? colors.vellum : colors.paper;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="18" cy="24" r="13" fill={fill} opacity={0.85} />
      <Circle cx="30" cy="24" r="13" fill="none" stroke={color} strokeWidth="1.5" />
      <Circle cx="24" cy="24" r="1.2" fill={dot} />
    </Svg>
  );
};

// ─── Inline icons ─────────────────────────────────────────────
export const Icons = {
  plus: (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  ),
  heart: (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Path d="M7 12C3 9 1.5 7.2 1.5 4.8c0-1.5 1.2-2.8 2.8-2.8 1 0 1.9.5 2.7 1.5C7.8 2.5 8.7 2 9.7 2c1.6 0 2.8 1.3 2.8 2.8C12.5 7.2 11 9 7 12z" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </Svg>
  ),
  bookmark: (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Path d="M3 1.5h8v11l-4-2.5-4 2.5v-11z" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </Svg>
  ),
  send: (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Path d="M1.5 7 12.5 1.5 9.5 12.5 7 8 1.5 7z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </Svg>
  ),
  edit: (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Path d="M2 11l1-3 7-7 2 2-7 7-3 1zM8.5 2.5l2 2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </Svg>
  ),
  moon: (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Path d="M11.5 8.5A4.5 4.5 0 0 1 5.5 2.5 5 5 0 1 0 11.5 8.5z" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </Svg>
  ),
  bell: (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Path d="M3 10V6.5a4 4 0 1 1 8 0V10l1 1.5H2L3 10zM5.5 12.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </Svg>
  ),
  search: (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <Path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  ),
  lock: (
    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <Path d="M2.5 6.5h9v6.5H2.5z" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <Path d="M4.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </Svg>
  ),
};

// ─── Chip ─────────────────────────────────────────────────────
export const Chip = ({
  children,
  color,
  bg,
  active = false,
  onPress,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
  active?: boolean;
  onPress?: () => void;
}) => (
  <Pressable onPress={onPress}>
    <View style={[
      styles.chip,
      { backgroundColor: bg, borderColor: active ? color : 'transparent' },
    ]}>
      <Text style={[styles.chipText, { color, fontWeight: active ? '600' : '500' }]}>
        {children}
      </Text>
    </View>
  </Pressable>
);

// ─── Toggle ───────────────────────────────────────────────────
export const Toggle = ({
  on = false,
  onToggle,
}: {
  on?: boolean;
  onToggle?: () => void;
}) => (
  <Pressable onPress={onToggle}>
    <View style={[styles.toggleTrack, { backgroundColor: on ? colors.sakuraDeep : colors.lineStrong }]}>
      <View style={[styles.toggleThumb, { transform: [{ translateX: on ? 18 : 0 }] }]} />
    </View>
  </Pressable>
);

// ─── Btn ──────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'devoted' | 'soft' | 'ghost' | 'outline';
type BtnSize = 'sm' | 'md' | 'lg';

const btnVariants: Record<BtnVariant, { bg: string; textColor: string; borderColor: string }> = {
  primary:  { bg: colors.sakuraDeep, textColor: colors.vellum,   borderColor: colors.sakuraDeep },
  devoted:  { bg: colors.plum,       textColor: colors.vellum,   borderColor: colors.plum },
  soft:     { bg: colors.paperDeep,  textColor: colors.ink,      borderColor: colors.line },
  ghost:    { bg: 'transparent',     textColor: colors.ink,      borderColor: 'transparent' },
  outline:  { bg: 'transparent',     textColor: colors.ink,      borderColor: colors.lineStrong },
};

const btnSizes: Record<BtnSize, { height: number; px: number; fs: number }> = {
  sm: { height: 32, px: 14, fs: 13 },
  md: { height: 40, px: 18, fs: 14 },
  lg: { height: 50, px: 24, fs: 16 },
};

export const Btn = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  disabled = false,
  full = false,
  onPress,
}: {
  variant?: BtnVariant;
  size?: BtnSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  full?: boolean;
  onPress?: () => void;
}) => {
  const v = btnVariants[variant];
  const s = btnSizes[size];
  return (
    <Pressable onPress={!disabled ? onPress : undefined} style={full ? { width: '100%' } : undefined}>
      <View style={[
        styles.btn,
        {
          height: s.height,
          paddingHorizontal: s.px,
          backgroundColor: v.bg,
          borderColor: v.borderColor,
          opacity: disabled ? 0.4 : 1,
          ...(variant === 'primary' || variant === 'devoted' ? shadows.sm : {}),
        },
        full && styles.btnFull,
      ]}>
        {icon && <View style={styles.btnIcon}>{icon}</View>}
        <Text style={[styles.btnText, { color: v.textColor, fontSize: s.fs }]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
};

// ─── Field (label wrapper) ────────────────────────────────────
export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
    {hint && <Text style={styles.fieldHint}>{hint}</Text>}
  </View>
);

// ─── Row / Stack ──────────────────────────────────────────────
export const Row = ({
  children,
  gap = 16,
  align = 'center' as ViewStyle['alignItems'],
  wrap = false,
  style,
}: {
  children: React.ReactNode;
  gap?: number;
  align?: ViewStyle['alignItems'];
  wrap?: boolean;
  style?: ViewStyle;
}) => (
  <View style={[{ flexDirection: 'row', gap, alignItems: align, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>
    {children}
  </View>
);

export const Stack = ({
  children,
  gap = 16,
  style,
}: {
  children: React.ReactNode;
  gap?: number;
  style?: ViewStyle;
}) => (
  <View style={[{ flexDirection: 'column', gap }, style]}>
    {children}
  </View>
);

// ─── Devotion progress bar ────────────────────────────────────
export const Devotion = ({ value = 0.5 }: { value?: number }) => (
  <View style={styles.devotionWrap}>
    <View style={styles.devotionTrack}>
      <View style={[styles.devotionFill, { width: `${value * 100}%` as any }]} />
      <View style={[styles.devotionThumb, { left: `${value * 100}%` as any }]} />
    </View>
    <Row style={{ justifyContent: 'space-between', marginTop: spacing.s2 }}>
      <Text style={styles.devotionLabel}>casual</Text>
      <Text style={styles.devotionLabel}>devoted</Text>
      <Text style={[styles.devotionLabel, { color: colors.plum, fontWeight: '600' }]}>riako</Text>
    </Row>
  </View>
);

// ─── SmallIconBtn (circle icon button) ───────────────────────
export const SmallIconBtn = ({
  children,
  onPress,
  color = colors.ink2,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  color?: string;
}) => (
  <Pressable onPress={onPress}>
    <View style={[styles.smallIconBtn, { borderColor: colors.line }]}>
      <View style={{ color } as any}>{children}</View>
    </View>
  </Pressable>
);

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: fontSize.caption,
    letterSpacing: 0.1,
  },
  toggleTrack: {
    width: 40,
    height: 22,
    borderRadius: radii.pill,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.vellum,
    ...shadows.sm,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    gap: 8,
  },
  btnFull: {
    width: '100%',
  },
  btnIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontWeight: '500',
    letterSpacing: 0.05,
  },
  field: {
    gap: spacing.s1,
  },
  fieldLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.ink3,
    fontFamily: 'JetBrainsMono',
  },
  fieldHint: {
    fontSize: fontSize.hairline,
    color: colors.ink3,
  },
  devotionWrap: {
    width: '100%',
  },
  devotionTrack: {
    position: 'relative',
    height: 4,
    backgroundColor: colors.paperDeep,
    borderRadius: radii.pill,
    overflow: 'visible',
  },
  devotionFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: radii.pill,
    backgroundColor: colors.sakura,
  },
  devotionThumb: {
    position: 'absolute',
    top: '50%' as any,
    width: 18,
    height: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.vellum,
    borderWidth: 1.5,
    borderColor: colors.plum,
    ...shadows.sm,
    transform: [{ translateX: -9 }, { translateY: -9 }],
  },
  devotionLabel: {
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 1,
    fontFamily: 'JetBrainsMono',
  },
  smallIconBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.vellum,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
