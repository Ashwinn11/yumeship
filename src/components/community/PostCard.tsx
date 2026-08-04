import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Sparkle } from '@/components/deco/Sparkle';
import { MEDIA_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { CommunityPost } from '@/store/community';

import { LikeButton } from './LikeButton';
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
};

export function PostCard({ post, onToggleLike }: Props) {
  const firstMedia = post.media[0];

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/social/post/${post.id}` as any)}>
      <View style={styles.sparkle} pointerEvents="none">
        <Sparkle size={12} color={Colors.lavenderDeep} />
      </View>

      <PostAuthorHeader author={post.author} fo={post.fo} createdAt={post.createdAt} />

      {!!post.title && <Text style={styles.title}>{post.title}</Text>}
      {!!post.body && (
        <Text style={styles.body} numberOfLines={6}>
          {post.body}
        </Text>
      )}

      {post.media.length > 0 && (
        <View style={styles.mediaGrid}>
          {firstMedia.type === 'video' ? (
            <View style={styles.videoThumb}>
              <Image
                source={{ uri: firstMedia.thumbnailUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                recyclingKey={firstMedia.thumbnailUrl}
                {...MEDIA_IMAGE}
              />
              <View style={styles.playBadge}>
                <Svg width={14} height={14} viewBox="0 0 16 16">
                  <Path d="M4 2.5 L13 8 L4 13.5 Z" fill="#fff" />
                </Svg>
              </View>
            </View>
          ) : (
            post.media.map((m, i) =>
              m.type === 'image' ? (
                <Image
                  key={i}
                  // older posts have no thumbnail — fall back to the full photo
                  source={{ uri: m.thumbnailUrl || m.url }}
                  style={[styles.mediaImage, post.media.length === 1 && styles.mediaImageFull]}
                  contentFit="cover"
                  recyclingKey={m.thumbnailUrl || m.url}
                  {...MEDIA_IMAGE}
                />
              ) : null,
            )
          )}
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.footer}>
        <LikeButton liked={post.likedByMe} count={post.likeCount} onToggle={onToggleLike} />
        <View style={styles.commentRow}>
          <CommentBubbleIcon />
          <Text style={styles.commentCount}>{post.commentCount}</Text>
        </View>
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
  title: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(16), color: Colors.ink, marginTop: 2 },
  body: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink2, lineHeight: sf(19) },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  mediaImage: { width: '48%', aspectRatio: 1, borderRadius: Radius.r3, backgroundColor: Colors.paperDeep },
  mediaImageFull: { width: '100%', aspectRatio: 4 / 3 },
  videoThumb: {
    width: '100%', aspectRatio: 4 / 3, borderRadius: Radius.r3, backgroundColor: Colors.paperDeep,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  playBadge: {
    width: 40, height: 40, borderRadius: Radius.pill, backgroundColor: 'rgba(31,18,25,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: Colors.line, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  commentRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  commentCount: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3 },
});
