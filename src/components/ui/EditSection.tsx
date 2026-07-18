import { StyleSheet, Text, View } from 'react-native';

import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';

// Shared "premium edit screen" section wrapper — same visual language on
// both the "me" profile edit and the F/O edit form, so the two feel like
// one consistent system rather than two different screens.
export function EditSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionLabelRow}>
        <Heart size={9} color={Colors.sakuraDeep} outline />
        <Text style={styles.sectionLabelText}>{label}</Text>
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export const styles = StyleSheet.create({
  sectionsWrap: {
    marginTop: Spacing.s5,
    gap: Spacing.s5,
  },
  section: { gap: 8 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 2 },
  sectionLabelText: {
    fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3,
    letterSpacing: 1.4, textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s4,
    ...Shadow.s1,
  },
  innerSpacer: { height: 14 },
  sectionHint: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3, lineHeight: 15 },
});
