import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import {
  ActivityIndicator,
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

import { CommentThread } from '@/components/community/CommentThread';
import { LikeButton } from '@/components/community/LikeButton';
import { PostAuthorHeader } from '@/components/community/PostAuthorHeader';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { addComment, useCommunityPost } from '@/store/community';

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { post, comments, loading, toggleLikeOptimistic } = useCommunityPost(id);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [sending, setSending] = useState(false);

  const isVideo = !!post && post.media.length === 1 && post.media[0].type === 'video';
  const videoUrl = isVideo && post ? (post.media[0] as Extract<typeof post.media[number], { type: 'video' }>).url : null;
  const player = useVideoPlayer(videoUrl ?? null);

  async function send() {
    if (!draft.trim() || !post) return;
    setSending(true);
    try {
      await addComment(post.id, draft, replyTo?.id);
      setDraft('');
      setReplyTo(null);
    } finally {
      setSending(false);
    }
  }

  if (loading || !post) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>‹</Text>
          </Pressable>
        </View>
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.sakuraDeep} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.s1 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={20} />
          <Text style={styles.headerTitle}>post</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PostAuthorHeader author={post.author} fo={post.fo} createdAt={post.createdAt} size="lg" />

        <Text style={styles.title}>{post.title}</Text>
        {!!post.body && <Text style={styles.body}>{post.body}</Text>}

        {isVideo ? (
          <View style={styles.videoWrap}>
            <VideoView player={player} style={styles.videoView} contentFit="contain" nativeControls />
          </View>
        ) : post.media.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
            {post.media.map((m, i) => (
              <Image
                key={i}
                source={{ uri: m.type === 'image' ? m.url : '' }}
                style={styles.mediaImage}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.likeRow}>
          <LikeButton liked={post.likedByMe} count={post.likeCount} onToggle={toggleLikeOptimistic} size={19} />
        </View>

        <View style={styles.divider} />

        <Text style={styles.commentsLabel}>comments · {comments.length}</Text>
        <CommentThread comments={comments} onReply={(pid, name) => setReplyTo({ id: pid, name })} />
      </ScrollView>

      <View style={[styles.composerWrap, { paddingBottom: insets.bottom + Spacing.s2 }]}>
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
            style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
          >
            <Text style={styles.sendBtnText}>send</Text>
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s3, paddingBottom: Spacing.s6 },
  title: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(20), color: Colors.ink, marginTop: Spacing.s4 },
  body: { fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink2, lineHeight: sf(21), marginTop: 8 },
  videoWrap: { marginTop: Spacing.s4, width: '100%', aspectRatio: 4 / 3 },
  videoView: { width: '100%', height: '100%', borderRadius: Radius.r3, backgroundColor: Colors.paperDeep },
  mediaScroll: { marginTop: Spacing.s4 },
  mediaImage: { width: 240, height: 240, borderRadius: Radius.r3, marginRight: 8, backgroundColor: Colors.paperDeep },
  likeRow: { marginTop: Spacing.s4 },
  divider: { height: 1, backgroundColor: Colors.line, marginTop: Spacing.s5, marginBottom: Spacing.s4 },
  commentsLabel: {
    fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.ink3,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12,
  },
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
  sendBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.pill, backgroundColor: Colors.sakuraDeep },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: '#fff' },
});
