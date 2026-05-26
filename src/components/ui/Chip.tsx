import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { Text, Pressable, ViewStyle } from 'react-native';

// design/components.jsx — Chip
// Inline badge. active adds a 1px border in the chip's color.
type Props = {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Chip({ children, color = Colors.ink, bg = Colors.paperDeep, active = false, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          paddingVertical: 5,
          paddingHorizontal: 12,
          backgroundColor: bg,
          borderRadius: Radius.pill,
          borderWidth: 1,
          borderColor: active ? color : 'transparent',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: FontFamily.ui,
          fontSize: FontSize.caption,
          color,
          fontWeight: active ? '600' : '500',
          letterSpacing: 0.01 * FontSize.caption,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
