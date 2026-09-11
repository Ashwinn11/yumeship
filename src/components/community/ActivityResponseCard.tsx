import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { CommunityPost } from '@/store/community';

import { LikeButton } from './LikeButton';
import { MediaCarousel } from './MediaCarousel';
import { PostAuthorHeader } from './PostAuthorHeader';

type Props = {
  post: CommunityPost;
  onToggleLike: () => void;
};

// A response to an activity only ever gets liked, never commented on — so it
// reads as a reply in a thread (CommentThread's card shell: avatar(s), name
// and F/O tag all inside one bordered card) rather than a standalone post.
function ActivityResponseCardImpl({ post, onToggleLike }: Props) {
  const onOpen = () => router.push(`/social/post/${post.id}` as any);

  return (
    <Pressable style={styles.bubble} onPress={onOpen}>
      <PostAuthorHeader author={post.author} fo={post.fo} createdAt={post.createdAt} />

      {!!post.body && <Text style={styles.body}>{post.body}</Text>}

      {post.media.length > 0 && (
        <View style={styles.mediaWrap}>
          <MediaCarousel media={post.media} variant="thumb" likedByMe={post.likedByMe} onDoubleTap={onToggleLike} />
        </View>
      )}

      <LikeButton liked={post.likedByMe} count={post.likeCount} onToggle={onToggleLike} size={14} />
    </Pressable>
  );
}

export const ActivityResponseCard = memo(ActivityResponseCardImpl);

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r3,
    padding: Spacing.s3,
    gap: 6,
    ...Shadow.s1,
  },
  body: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink2, lineHeight: sf(18) },
  mediaWrap: { borderRadius: Radius.r2, overflow: 'hidden' },
});
