import { memo } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Sparkle } from '@/components/deco/Sparkle';
import { IconFlag, IconPin, IconTrashSolid } from '@/components/ui/Icon';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { CommunityPost } from '@/store/community';

import { BingoCardView } from './BingoCardView';
import { LikeButton } from './LikeButton';
import { MediaCarousel } from './MediaCarousel';
import { MentionText } from './MentionText';
import { PollView } from './PollView';
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
  /** posts with a poll only */
  onPollVote?: (optionIndex: number) => void;
  /** own-profile posts only — public feed/profile cards never get this */
  onRequestDelete?: () => void;
  /** own-profile posts only — toggles whether this is the profile's one pinned post */
  onRequestTogglePin?: () => void;
  /** true when this is the profile's pinned post — shown to every viewer, not just the owner */
  pinned?: boolean;
  /** someone else's post only — never shown alongside pin/delete, which only
   *  ever apply to your own posts */
  onRequestReport?: () => void;
};

function PostCardImpl({ post, onToggleLike, onPollVote, onRequestDelete, onRequestTogglePin, pinned, onRequestReport }: Props) {
  // a featured activity opens its own responses page; a regular post opens
  // its comments. An unfeatured pool prompt has neither — nothing to see
  // beyond the card itself, so it isn't navigable at all.
  const isFeaturedActivity = post.kind === 'activity' && !!post.featuredDate;
  const destination = post.kind === 'activity' ? (isFeaturedActivity ? `/social/activity/${post.id}` : null) : `/social/post/${post.id}`;
  const onOpen = destination ? () => router.push(destination as any) : undefined;

  return (
    <Pressable style={styles.card} onPress={onOpen}>
      {onRequestDelete || onRequestTogglePin ? (
        <View style={styles.cornerActions}>
          {onRequestTogglePin && (
            <Pressable
              style={styles.cornerBtn}
              onPress={onRequestTogglePin}
              hitSlop={8}
              accessibilityLabel={pinned ? 'Unpin post' : 'Pin post'}
            >
              <IconPin size={13} color={pinned ? Colors.sakuraDeep : Colors.ink3} />
            </Pressable>
          )}
          {onRequestDelete && (
            // tinted red, distinct from pin's neutral toggle — this one is destructive
            <Pressable
              style={[styles.cornerBtn, styles.cornerBtnDanger]}
              onPress={onRequestDelete}
              hitSlop={8}
              accessibilityLabel="Delete post"
            >
              <IconTrashSolid size={13} color={Colors.ember} />
            </Pressable>
          )}
        </View>
      ) : onRequestReport ? (
        <View style={styles.cornerActions}>
          <Pressable
            style={styles.cornerBtn}
            onPress={onRequestReport}
            hitSlop={8}
            accessibilityLabel="Report post"
          >
            <IconFlag size={13} color={Colors.ink3} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.sparkle} pointerEvents="none">
          <Sparkle size={12} color={Colors.lavenderDeep} />
        </View>
      )}

      {!!pinned && (
        <View style={styles.pinnedRow}>
          <IconPin size={10} color={Colors.ink3} />
          <Text style={styles.pinnedLabel}>pinned</Text>
        </View>
      )}

      <PostAuthorHeader author={post.author} fo={post.fo} createdAt={post.createdAt} />

      {!!post.title && <Text style={styles.title}>{post.title}</Text>}
      {!!post.body && (
        <MentionText body={post.body} mentions={post.mentions} style={styles.body} numberOfLines={6} />
      )}

      {post.media.length > 0 && (
        <MediaCarousel
          media={post.media}
          variant="thumb"
          likedByMe={post.likedByMe}
          onDoubleTap={onToggleLike}
          onSingleTap={onOpen}
        />
      )}

      {!!post.poll && <PollView poll={post.poll} onVote={(i) => onPollVote?.(i)} />}

      {!!post.bingo && <BingoCardView card={post.bingo} postId={post.id} />}

      {!isFeaturedActivity && (
        <>
          <View style={styles.divider} />
          <View style={styles.footer}>
            <LikeButton liked={post.likedByMe} count={post.likeCount} onToggle={onToggleLike} />
            {/* a response to an activity only ever gets likes — no comment thread */}
            {post.kind !== 'activity' && !post.activityId && (
              <View style={styles.commentRow}>
                <CommentBubbleIcon />
                <Text style={styles.commentCount}>{post.commentCount}</Text>
              </View>
            )}
          </View>
        </>
      )}
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
  cornerActions: { position: 'absolute', top: 8, right: 8, zIndex: 1, flexDirection: 'row', gap: 6 },
  cornerBtn: {
    width: 26, height: 26, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  // ember at low opacity, not a new named token — a one-off tint distinguishing
  // this destructive action from the neutral (reversible) pin toggle beside it
  cornerBtnDanger: { backgroundColor: 'rgba(212,105,74,0.12)' },
  pinnedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: -2 },
  pinnedLabel: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(10.5), color: Colors.ink3,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
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
