import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';

// design/screens.jsx — MiniHC
// Small pill chip showing a headcanon category: ja glyph + label + count.

type Props = {
  ja: string;
  label: string;
  count: number;
  color: string;
};

export function MiniHC({ ja, label, count, color }: Props) {
  return (
    <View style={[styles.chip, { borderColor: color + '30' }]}>
      <Text style={[styles.ja, { color }]}>{ja}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.count, { color }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  ja: {
    fontFamily: FontFamily.jaSemiBold,
    fontSize: FontSize.caption,
    fontWeight: '600',
  },
  label: {
    fontSize: 10,
    color: Colors.ink2,
    fontWeight: '500',
    fontFamily: FontFamily.ui,
  },
  count: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    fontWeight: '600',
  },
});
