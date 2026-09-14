import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Spacing, sf } from '@/constants/theme';
import { SectionLabel } from './SectionLabel';

/** The longer writeup, as its own card below the profile hero — separate
 *  from the short tagline that lives on the hero itself, same as a bio vs.
 *  an about page. Renders nothing when there's no about text set. */
export function AboutSection({ about }: { about?: string }) {
  if (!about) return null;

  return (
    <View style={styles.section}>
      <SectionLabel>about</SectionLabel>
      <Text style={styles.text}>{about}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // this used to be a section inside ProfileCard's own gap-based wrapper —
  // now a sibling of it, it needs the same spacing itself instead
  section: { gap: 6, marginTop: Spacing.s5 },
  text: {
    fontFamily: FontFamily.ui, fontSize: sf(13.5), lineHeight: sf(20),
    color: Colors.ink2, paddingHorizontal: 2,
  },
});
