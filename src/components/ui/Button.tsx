import { Colors, FontFamily, FontSize, Radius, Shadow } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

// design/components.jsx — Btn
// 5 variants × 3 sizes. Pill-shaped. Icon slot on the left.

type Variant = 'primary' | 'devoted' | 'soft' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  full?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

const SIZES = {
  sm: { height: 32, paddingHorizontal: 14, fontSize: FontSize.meta,  gap: 6 },
  md: { height: 40, paddingHorizontal: 18, fontSize: 14,              gap: 8 },
  lg: { height: 50, paddingHorizontal: 24, fontSize: FontSize.bodyLg, gap: 10 },
} as const;

const VARIANTS: Record<Variant, { bg: string; color: string; borderColor: string; shadow?: boolean }> = {
  primary: { bg: Colors.sakuraDeep, color: Colors.vellum,  borderColor: Colors.sakuraDeep, shadow: true },
  devoted: { bg: Colors.plum,       color: Colors.vellum,  borderColor: Colors.plum,        shadow: true },
  soft:    { bg: Colors.paperDeep,  color: Colors.ink,     borderColor: Colors.line },
  ghost:   { bg: 'transparent',     color: Colors.ink,     borderColor: 'transparent' },
  outline: { bg: 'transparent',     color: Colors.ink,     borderColor: Colors.lineStrong },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  full = false,
  onPress,
  style,
}: Props) {
  const s = SIZES[size];
  const v = VARIANTS[variant];

  const iconNode = icon ? <View style={{ flexShrink: 0 }}>{icon}</View> : null;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          backgroundColor: v.bg,
          borderColor: v.borderColor,
          gap: s.gap,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          alignSelf: full ? undefined : 'flex-start',
          width: full ? '100%' : undefined,
          justifyContent: full ? 'center' : 'flex-start',
        },
        v.shadow ? Shadow.s1 : undefined,
        style,
      ]}
    >
      {iconPosition === 'left' && iconNode}
      <Text
        style={{
          fontFamily: FontFamily.uiMedium,
          fontSize: s.fontSize,
          color: v.color,
          letterSpacing: 0.005 * s.fontSize,
        }}
      >
        {children}
      </Text>
      {iconPosition === 'right' && iconNode}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});
