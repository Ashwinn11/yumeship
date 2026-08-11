import { StyleSheet, View } from 'react-native';

import { SkeletonBlock } from '@/components/ui/Skeleton';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';

/**
 * Mirrors PostCard's own padding/gap/radius exactly, so swapping the skeleton
 * for real content doesn't shift the feed by a pixel.
 */
export function PostCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <SkeletonBlock style={styles.avatar} />
        <View style={styles.headerText}>
          <SkeletonBlock style={styles.nameLine} />
          <SkeletonBlock style={styles.metaLine} />
        </View>
      </View>
      <SkeletonBlock style={styles.titleLine} />
      <SkeletonBlock style={styles.bodyLine} />
      <SkeletonBlock style={styles.bodyLineShort} />
      <View style={styles.divider} />
      <View style={styles.footerRow}>
        <SkeletonBlock style={styles.pill} />
        <SkeletonBlock style={styles.pillSmall} />
      </View>
    </View>
  );
}

export function FeedSkeleton() {
  return (
    <View style={styles.list}>
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: {
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s4,
    gap: 8,
    ...Shadow.s1,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  headerText: { flex: 1, gap: 6 },
  nameLine: { width: '40%', height: 12 },
  metaLine: { width: '25%', height: 9 },
  titleLine: { width: '70%', height: 15, marginTop: 4 },
  bodyLine: { width: '100%', height: 12 },
  bodyLineShort: { width: '55%', height: 12 },
  divider: { height: 1, backgroundColor: Colors.line, marginTop: 2 },
  footerRow: { flexDirection: 'row', gap: 18 },
  pill: { width: 40, height: 14 },
  pillSmall: { width: 24, height: 14 },
});
