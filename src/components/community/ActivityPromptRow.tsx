import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Heart } from '@/components/deco/Heart';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
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

/** One card in the submission pool, same bordered+elevated card language as
 * PostCard rather than a bespoke stitched-list row — the rest of the app
 * never treats a list of content as one fused block. `rank` is the row's
 * standing in the like-sorted pool (1 = closest to winning tomorrow), shown
 * as a small badge since the ordering itself is the point of this list. */
export function ActivityPromptRow({
  post,
  onToggleLike,
  rank,
}: {
  post: CommunityPost;
  onToggleLike: () => void;
  rank: number;
}) {
  const leading = rank === 1;
  return (
    <View style={[styles.card, leading && styles.cardLeading]}>
      <View style={[styles.rankBadge, leading && styles.rankBadgeLeading]}>
        <Text style={[styles.rankText, leading && styles.rankTextLeading]}>#{rank}</Text>
      </View>
      <Avatar uri={post.author.avatarUrl} name={post.author.name} />
      <View style={styles.textCol}>
        <MentionText body={post.body} mentions={post.mentions} style={styles.body} numberOfLines={3} />
        {!!post.author.username && <Text style={styles.username}>@{post.author.username}</Text>}
      </View>
      <Pressable
        style={({ pressed }) => [styles.likeChip, pressed && styles.likeChipPressed]}
        onPress={onToggleLike}
        hitSlop={8}
      >
        <Heart size={13} color={post.likedByMe ? Colors.sakuraDeep : Colors.ink3} outline={!post.likedByMe} />
        <Text style={[styles.likeCount, post.likedByMe && styles.likeCountActive]}>{post.likeCount}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s3,
    ...Shadow.s1,
  },
  cardLeading: { borderColor: Colors.sakura, backgroundColor: Colors.sakuraSoft },
  rankBadge: {
    minWidth: 22, height: 22, borderRadius: Radius.pill, paddingHorizontal: 4,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  rankBadgeLeading: { backgroundColor: Colors.sakuraDeep },
  rankText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(10.5), color: Colors.ink3 },
  rankTextLeading: { color: '#fff' },
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
  likeChipPressed: { transform: [{ scale: 0.96 }] },
  likeCount: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3 },
  likeCountActive: { color: Colors.sakuraDeep },
});
