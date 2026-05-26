import { View, ViewStyle } from 'react-native';

// design/components.jsx — Row layout helper
type Props = {
  children: React.ReactNode;
  gap?: number;
  align?: ViewStyle['alignItems'];
  wrap?: boolean;
  style?: ViewStyle;
};

export function Row({ children, gap = 16, align = 'center', wrap = false, style }: Props) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: align,
          gap,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
