import { View, ViewStyle } from 'react-native';

// design/components.jsx — Stack layout helper
type Props = {
  children: React.ReactNode;
  gap?: number;
  style?: ViewStyle;
};

export function Stack({ children, gap = 16, style }: Props) {
  return (
    <View style={[{ flexDirection: 'column', gap }, style]}>
      {children}
    </View>
  );
}
