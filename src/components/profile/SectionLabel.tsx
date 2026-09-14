import { StyleSheet, Text, View } from 'react-native';

import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, sf } from '@/constants/theme';

/** Small heart+caps heading used above every section that sits below the
 *  hero card (about, songs/gallery, etc.) — one shared definition so each
 *  section reads as part of the same page instead of its own styling. */
export function SectionLabel({ children }: { children: string }) {
  return (
    <View style={styles.row}>
      <Heart size={9} color={Colors.sakuraDeep} outline />
      <Text style={styles.label}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 2 },
  label: {
    fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3,
    letterSpacing: 1.4, textTransform: 'uppercase',
  },
});
