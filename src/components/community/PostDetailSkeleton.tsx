import { StyleSheet, View } from 'react-native';

import { SkeletonBlock } from '@/components/ui/Skeleton';
import { Colors, Spacing } from '@/constants/theme';

/** Matches the post detail screen's own header/title/body/comment rhythm. */
export function PostDetailSkeleton() {
  return (
    <View style={styles.page}>
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
      <SkeletonBlock style={styles.media} />

      <View style={styles.divider} />
      <SkeletonBlock style={styles.commentsLabel} />

      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.commentRow}>
          <SkeletonBlock style={styles.commentAvatar} />
          <View style={styles.commentText}>
            <SkeletonBlock style={styles.commentNameLine} />
            <SkeletonBlock style={styles.commentBodyLine} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  headerText: { flex: 1, gap: 6 },
  nameLine: { width: '45%', height: 14 },
  metaLine: { width: '25%', height: 10 },
  titleLine: { width: '65%', height: 18, marginTop: Spacing.s2 },
  bodyLine: { width: '100%', height: 13 },
  bodyLineShort: { width: '70%', height: 13 },
  media: { width: '100%', aspectRatio: 4 / 3, marginTop: Spacing.s2 },
  divider: { height: 1, backgroundColor: Colors.line, marginTop: Spacing.s4, marginBottom: 4 },
  commentsLabel: { width: 90, height: 10, marginBottom: 6 },
  commentRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  commentAvatar: { width: 30, height: 30, borderRadius: 15 },
  commentText: { flex: 1, gap: 6 },
  commentNameLine: { width: '35%', height: 11 },
  commentBodyLine: { width: '85%', height: 11 },
});
