import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { Text, View, ViewStyle } from 'react-native';

// design/components.jsx — Field
// Form field wrapper: mono uppercase label + children + optional hint
type Props = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Field({ label, hint, children, style }: Props) {
  return (
    <View style={[{ flexDirection: 'column', gap: 6 }, style]}>
      <Text
        style={{
          fontFamily: FontFamily.marker,
          fontSize: FontSize.hairline,
          color: Colors.ink3,
          letterSpacing: 0.12 * FontSize.hairline,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      {children}
      {hint && (
        <Text style={{ fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink3 }}>
          {hint}
        </Text>
      )}
    </View>
  );
}
