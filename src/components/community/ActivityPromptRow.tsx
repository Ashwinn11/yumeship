import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Heart } from '@/components/deco/Heart';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import type { CommunityPost } from '@/store/community';

import { MentionText } from './MentionText';

const AVATAR_SIZE = 30;

function Avatar({ uri, name }: { uri: string; name: string }) {
  return (
    <View style={styles.avatar}>
      {uri ? (
        <Image source={{ uri }} style={styles.avatarImg} contentFit="cover" recyclingKey={uri} {...AVATAR_IMAGE} />
      ) : (
        <Text style={styles.avatarInitial}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
      )}
    </View>
  );
}

/** One row in the submission pool. Rows stack together as a single list —
 * shared side borders, a bottom border doubling as the divider between
 * rows, and only the last row gets bottom corners — rather than each being
 * its own separate card. */
export function ActivityPromptRow({
  post,
  onToggleLike,
  isLast,
}: {
  post: CommunityPost;
  onToggleLike: () => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <Avatar uri={post.author.avatarUrl} name={post.author.name} />
      <View style={styles.textCol}>
        <MentionText body={post.body} mentions={post.mentions} style={styles.body} numberOfLines={3} />
        {!!post.author.username && <Text style={styles.username}>@{post.author.username}</Text>}
      </View>
      <Pressable style={styles.likeChip} onPress={onToggleLike} hitSlop={8}>
        <Heart size={13} color={post.likedByMe ? Colors.sakuraDeep : Colors.ink3} outline={!post.likedByMe} />
        <Text style={[styles.likeCount, post.likedByMe && styles.likeCountActive]}>{post.likeCount}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.vellum,
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: Colors.line,
    padding: Spacing.s3,
  },
  rowLast: { borderBottomLeftRadius: Radius.r4, borderBottomRightRadius: Radius.r4 },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.sakura, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(12), color: '#fff' },
  textCol: { flex: 1, minWidth: 0, gap: 3, paddingTop: 1 },
  body: { fontFamily: FontFamily.ui, fontSize: sf(13.5), color: Colors.ink, lineHeight: sf(19) },
  username: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink3 },
  likeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.paperDeep, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  likeCount: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3 },
  likeCountActive: { color: Colors.sakuraDeep },
});
