import { StyleSheet, View } from 'react-native';

import { SkeletonBlock } from '@/components/ui/Skeleton';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';

/**
 * Stands in for the public profile / F/O profile screens while their one
 * network round-trip is in flight. Matches ProfileCard's hero padding and the
 * about/details sections below it, so the swap to real content doesn't jump.
 */
export function ProfileCardSkeleton() {
  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <SkeletonBlock style={styles.avatar} />
        <SkeletonBlock style={styles.name} />
        <SkeletonBlock style={styles.pronouns} />
      </View>

      <View style={styles.section}>
        <SkeletonBlock style={styles.sectionLabel} />
        <View style={styles.aboutCard}>
          <SkeletonBlock style={styles.bioLine} />
          <SkeletonBlock style={styles.bioLineShort} />
        </View>
      </View>

      <View style={styles.section}>
        <SkeletonBlock style={styles.sectionLabel} />
        <View style={styles.statsGrid}>
          <SkeletonBlock style={styles.stat} />
          <SkeletonBlock style={styles.stat} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: Spacing.s5 },
  hero: {
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s5,
    paddingTop: Spacing.s6,
    paddingBottom: Spacing.s6,
    alignItems: 'center',
    ...Shadow.s1,
  },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  name: { width: 140, height: 22, marginTop: Spacing.s3, borderRadius: Radius.r2 },
  pronouns: { width: 70, height: 12, marginTop: 8 },

  section: { gap: 6 },
  sectionLabel: { width: 60, height: 10 },
  aboutCard: {
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s4,
    gap: 8,
    ...Shadow.s1,
  },
  bioLine: { width: '90%', height: 14 },
  bioLineShort: { width: '55%', height: 14 },

  statsGrid: { flexDirection: 'row', gap: Spacing.s2 },
  stat: { flexBasis: '48%', flexGrow: 1, height: 54, borderRadius: Radius.r3 },
});
