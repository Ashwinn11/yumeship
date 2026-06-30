import { Colors, FontFamily, FontSize, Radius ,sf } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

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
    fontFamily: FontFamily.ja,
    fontSize: FontSize.caption,
  },
  label: {
    fontSize: sf(10),
    color: Colors.ink2,
    fontFamily: FontFamily.ui,
  },
  count: {
    fontFamily: FontFamily.marker,
    fontSize: sf(9),
  },
});
