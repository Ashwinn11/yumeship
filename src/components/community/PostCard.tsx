import { memo } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Sparkle } from '@/components/deco/Sparkle';
import { IconTrashSolid } from '@/components/ui/Icon';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { CommunityPost } from '@/store/community';

import { LikeButton } from './LikeButton';
import { MediaCarousel } from './MediaCarousel';
import { PostAuthorHeader } from './PostAuthorHeader';

function CommentBubbleIcon({ size = 13, color = Colors.ink3 }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M2 3.5C2 2.7 2.7 2 3.5 2h9c.8 0 1.5.7 1.5 1.5v6c0 .8-.7 1.5-1.5 1.5H6l-3 2.5v-2.5h-.5C1.7 11 1 10.3 1 9.5v-6z"
        stroke={color}
        strokeWidth={1.2}
        fill="none"
      />
    </Svg>
  );
}

type Props = {
  post: CommunityPost;
  onToggleLike: () => void;
  /** own-profile posts only — public feed/profile cards never get this */
  onRequestDelete?: () => void;
};

function PostCardImpl({ post, onToggleLike, onRequestDelete }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/social/post/${post.id}` as any)}>
      {onRequestDelete ? (
        <Pressable style={styles.deleteBtn} onPress={onRequestDelete} hitSlop={8}>
          <IconTrashSolid size={13} color={Colors.ink3} />
        </Pressable>
      ) : (
        <View style={styles.sparkle} pointerEvents="none">
          <Sparkle size={12} color={Colors.lavenderDeep} />
        </View>
      )}

      <PostAuthorHeader author={post.author} fo={post.fo} createdAt={post.createdAt} />

      {!!post.activity && (
        <Pressable onPress={() => router.push(`/social/post/${post.activity!.id}` as any)} hitSlop={4}>
          <Text style={styles.activityChip} numberOfLines={1}>
            ↳ {post.activity.title || post.activity.body || 'an activity'}
          </Text>
        </Pressable>
      )}

      {!!post.title && <Text style={styles.title}>{post.title}</Text>}
      {!!post.body && (
        <Text style={styles.body} numberOfLines={6}>
          {post.body}
        </Text>
      )}

      {post.media.length > 0 && (
        <MediaCarousel
          media={post.media}
          variant="thumb"
          likedByMe={post.likedByMe}
          onDoubleTap={onToggleLike}
          onSingleTap={() => router.push(`/social/post/${post.id}` as any)}
        />
      )}

      <View style={styles.divider} />

      <View style={styles.footer}>
        {/* voting on an activity prompt is just liking it — same button, same
            handler, only the label changes to say what the tap actually means */}
        <LikeButton
          liked={post.likedByMe}
          count={post.likeCount}
          onToggle={onToggleLike}
          label={post.kind === 'activity' ? 'votes' : undefined}
        />
        {post.kind === 'activity' ? (
          <View style={styles.commentRow}>
            <Text style={styles.commentCount}>{post.responseCount} responses</Text>
          </View>
        ) : (
          <View style={styles.commentRow}>
            <CommentBubbleIcon />
            <Text style={styles.commentCount}>{post.commentCount}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s4,
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.s1,
  },
  sparkle: { position: 'absolute', top: 10, right: 12 },
  deleteBtn: {
    position: 'absolute', top: 8, right: 8, zIndex: 1,
    width: 26, height: 26, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  activityChip: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.sakuraDeep },
  title: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(16), color: Colors.ink, marginTop: 2 },
  body: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink2, lineHeight: sf(19) },
  divider: { height: 1, backgroundColor: Colors.line, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  commentRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  commentCount: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3 },
});

/**
 * Memoised because the feed re-renders on every like, comment count change and
 * realtime insert. Without this each of those repainted every card in the list;
 * with stable callbacks upstream, only the card whose post actually changed does.
 */
export const PostCard = memo(PostCardImpl);
