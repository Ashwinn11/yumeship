import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { CommentThread } from '@/components/community/CommentThread';
import { LikeButton } from '@/components/community/LikeButton';
import { MediaCarousel } from '@/components/community/MediaCarousel';
import { PollView } from '@/components/community/PollView';
import { PostAuthorHeader } from '@/components/community/PostAuthorHeader';
import { PostDetailSkeleton } from '@/components/community/PostDetailSkeleton';
import { VoteButtons } from '@/components/community/VoteButtons';
import { useIPad } from '@/hooks/use-ipad';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { addComment, deleteComment, deletePost, logSyncFailure, useCommunityPost } from '@/store/community';
import { InlineToast, useInlineToast } from '@/components/ui/InlineToast';
import { useAuthUser } from '@/store/auth';
import { CozyModal } from '@/components/ui/CozyModal';

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { post, comments, loading, toggleLikeOptimistic, voteOptimistic, pollVoteOptimistic, insertComment } = useCommunityPost(id);
  const isActivity = post?.kind === 'activity';
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { message: toastMsg, nonce: toastNonce, show: showToast } = useInlineToast();
  const me = useAuthUser();
  const isMine = !!me && post?.author.id === me.id;

  // realtime removes it from the thread once the delete lands
  function handleDeleteComment(commentId: string) {
    deleteComment(commentId).catch(logSyncFailure('delete comment'));
  }

  async function handleDeletePost() {
    setConfirmDelete(false);
    try {
      await deletePost(id);
      router.back();
    } catch (e) {
      logSyncFailure('delete post')(e);
    }
  }

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  async function send() {
    if (!draft.trim() || !post) return;
    // clear straight away so the composer feels instant — the sent text is held
    // aside and put back only if the insert actually fails
    const body = draft;
    const parent = replyTo?.id;
    setDraft('');
    setReplyTo(null);
    setSending(true);
    try {
      // shown immediately rather than waiting on the realtime echo, which
      // never arrives if the channel is down — insertComment already dedupes
      // by id, so the echo landing later is a harmless no-op
      const comment = await addComment(post.id, body, parent);
      insertComment(comment);
    } catch {
      setDraft(body);
      showToast("couldn't send — try again");
    } finally {
      setSending(false);
    }
  }

  if (loading || !post) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={[styles.header, column]}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>‹</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={[styles.content, column]} showsVerticalScrollIndicator={false}>
          <PostDetailSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      // this view already starts at the top of the window, so any offset here is
      // added straight onto the keyboard gap — it must stay 0
      keyboardVerticalOffset={0}
    >
      <View style={[styles.toastWrap, { top: insets.top + Spacing.s2 }]} pointerEvents="none">
        <InlineToast message={toastMsg} nonce={toastNonce} />
      </View>

      <View style={[styles.header, column, { paddingTop: insets.top + Spacing.s1 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={20} />
          <Text style={styles.headerTitle}>post</Text>
        </View>
        {/* only the author can delete, and RLS enforces that server-side too */}
        {isMine ? (
          <Pressable onPress={() => setConfirmDelete(true)} style={styles.headerBtn} hitSlop={6}>
            <Text style={styles.headerDelete}>⋯</Text>
          </Pressable>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, column]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PostAuthorHeader author={post.author} fo={post.fo} createdAt={post.createdAt} size="lg" />

        {!!post.title && <Text style={styles.title}>{post.title}</Text>}
        {!!post.body && (
          <Text style={[styles.body, !post.title && styles.bodyNoTitle]}>{post.body}</Text>
        )}

        {post.media.length > 0 && (
          <View style={styles.mediaWrap}>
            <MediaCarousel
              media={post.media}
              variant="full"
              likedByMe={post.likedByMe}
              onDoubleTap={() => toggleLikeOptimistic(() => showToast("couldn't update like — try again"))}
            />
          </View>
        )}

        {!!post.poll && (
          <PollView
            poll={post.poll}
            onVote={(i) => pollVoteOptimistic(i, () => showToast("couldn't update vote — try again"))}
          />
        )}

        <View style={styles.likeRow}>
          {isActivity ? (
            <VoteButtons
              score={post.voteScore}
              myVote={post.myVote}
              onVote={(d) => voteOptimistic(d, () => showToast("couldn't update vote — try again"))}
              size={19}
            />
          ) : (
            <LikeButton
              liked={post.likedByMe}
              count={post.likeCount}
              onToggle={() => toggleLikeOptimistic(() => showToast("couldn't update like — try again"))}
              size={19}
            />
          )}
        </View>

        <View style={styles.divider} />

        <Text style={styles.commentsLabel}>comments · {comments.length}</Text>
        <CommentThread
          comments={comments}
          onReply={(pid, name) => setReplyTo({ id: pid, name })}
          viewerId={me?.id}
          onDelete={handleDeleteComment}
        />
      </ScrollView>

      {/* the raised keyboard already covers the home indicator, so the safe-area
          inset would sit as dead space between the bar and the keys */}
      <CozyModal
        visible={confirmDelete}
        title="Delete this post?"
        message="It disappears for everyone, along with its likes and comments. This can't be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeletePost}
        onClose={() => setConfirmDelete(false)}
        isDestructive
      />

      <View
        style={[
          styles.composerWrap,
          column,
          { paddingBottom: (keyboardOpen ? 0 : insets.bottom) + Spacing.s2 },
        ]}
      >
        {replyTo && (
          <View style={styles.replyBanner}>
            <Text style={styles.replyBannerText}>replying to {replyTo.name}</Text>
            <Pressable onPress={() => setReplyTo(null)}>
              <Text style={styles.replyBannerCancel}>✕</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.composerInputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={replyTo ? `reply to ${replyTo.name}…` : 'add a comment…'}
            placeholderTextColor={Colors.ink3}
            style={styles.composerInput}
            multiline
          />
          <Pressable
            onPress={send}
            disabled={!draft.trim() || sending}
            hitSlop={6}
            style={({ pressed }) => [
              styles.sendBtn,
              (!draft.trim() || sending) && styles.sendBtnDisabled,
              pressed && styles.sendBtnPressed,
            ]}
          >
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Path
                d="M8 13.5V3M8 3L3.5 7.5M8 3l4.5 4.5"
                stroke="#fff"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnText: { fontSize: sf(20), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: sf(22) },
  headerDelete: { fontSize: sf(18), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: sf(20) },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s3, paddingBottom: Spacing.s6 },
  title: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(20), color: Colors.ink, marginTop: Spacing.s4 },
  body: { fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink2, lineHeight: sf(21), marginTop: 8 },
  bodyNoTitle: { marginTop: Spacing.s4, fontSize: sf(15), color: Colors.ink, lineHeight: sf(23) },
  mediaWrap: { marginTop: Spacing.s4 },
  likeRow: { marginTop: Spacing.s4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: Colors.line, marginTop: Spacing.s5, marginBottom: Spacing.s4 },
  commentsLabel: {
    fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.ink3,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12,
  },
  toastWrap: { position: 'absolute', left: 0, right: 0, zIndex: 10, alignItems: 'center' },
  composerWrap: {
    borderTopWidth: 1, borderTopColor: Colors.line, backgroundColor: Colors.vellum,
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2,
  },
  replyBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 6, paddingHorizontal: 10, backgroundColor: Colors.paperDeep,
    borderRadius: Radius.r3, marginBottom: 6,
  },
  replyBannerText: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3 },
  replyBannerCancel: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3 },
  composerInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  composerInput: {
    flex: 1, maxHeight: 100, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.paperDeep, paddingHorizontal: 12, paddingVertical: 8,
    fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.35 },
  sendBtnPressed: { opacity: 0.75, transform: [{ scale: 0.94 }] },
});
