import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityResponseCard } from '@/components/community/ActivityResponseCard';
import { MediaComposer, mediaFromAssets } from '@/components/community/MediaComposer';
import { PostAuthorHeader } from '@/components/community/PostAuthorHeader';
import { PostDetailSkeleton } from '@/components/community/PostDetailSkeleton';
import { DismissKeyboardView } from '@/components/ui/DismissKeyboardView';
import { IconPhoto, IconSend } from '@/components/ui/Icon';
import { useIPad } from '@/hooks/use-ipad';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { createPost, MAX_IMAGES, useActivityDetail, type CommunityPost, type LocalPickedMedia } from '@/store/community';
import { getGlobalSetting } from '@/store/onboarding';
import { InlineToast, useInlineToast } from '@/components/ui/InlineToast';

export default function ActivityDetailScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activity, responses, loading, toggleResponseLikeOptimistic, insertResponse } = useActivityDetail(id);
  const { message: toastMsg, nonce: toastNonce, show: showToast } = useInlineToast();

  // replying lives on this screen — it's a response to the activity right
  // above it, not a different kind of thing that deserves its own page
  const [replyBody, setReplyBody] = useState('');
  const [replyMedia, setReplyMedia] = useState<LocalPickedMedia[]>([]);
  const [sending, setSending] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const canSend = !sending && (replyBody.trim().length > 0 || replyMedia.length > 0);

  async function pickReplyImages() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, MAX_IMAGES - replyMedia.length),
      quality: 0.9,
    });
    if (res.canceled) return;
    setReplyMedia((prev) => mediaFromAssets(res.assets, prev));
  }

  async function sendReply() {
    if (!canSend || !activity) return;
    const body = replyBody;
    const media = replyMedia;
    // clear straight away so the composer feels instant — held aside and put
    // back only if the post actually fails to send
    setReplyBody('');
    setReplyMedia([]);
    setSending(true);
    try {
      const identifyFoId = getGlobalSetting('user_identify_fo_id');
      const post = await createPost({ body, media, foProfileId: identifyFoId || undefined, activityId: activity.id });
      insertResponse(post);
    } catch {
      setReplyBody(body);
      setReplyMedia(media);
      showToast("couldn't post — try again");
    } finally {
      setSending(false);
    }
  }

  const renderResponse = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <ActivityResponseCard
        post={item}
        onToggleLike={() => toggleResponseLikeOptimistic(item.id, () => showToast("couldn't update like — try again"))}
      />
    ),
    [toggleResponseLikeOptimistic, showToast],
  );

  if (loading || !activity) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={[styles.header, column]}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn} accessibilityLabel="Back">
            <Text style={styles.headerBtnText}>‹</Text>
          </Pressable>
        </View>
        <View style={[styles.content, column]}>
          <PostDetailSkeleton />
        </View>
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
          <Text style={styles.headerTitle}>activity</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        style={styles.list}
        data={responses}
        keyExtractor={(p) => p.id}
        renderItem={renderResponse}
        contentContainerStyle={[styles.content, column]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => Keyboard.dismiss()}
        ListHeaderComponent={
          <DismissKeyboardView>
            <PostAuthorHeader author={activity.author} fo={activity.fo} createdAt={activity.createdAt} size="lg" />
            {!!activity.body && <Text style={styles.body}>{activity.body}</Text>}

            <View style={styles.divider} />
            <Text style={styles.responsesLabel}>responses · {responses.length}</Text>
          </DismissKeyboardView>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>no responses yet</Text>
            <Text style={styles.emptySub}>be the first to post ♡</Text>
          </View>
        }
      />

      <View
        style={[
          styles.composerWrap,
          column,
          { paddingBottom: (keyboardOpen ? 0 : insets.bottom) + Spacing.s2 },
        ]}
      >
        {replyMedia.length > 0 && (
          <View style={styles.composerMedia}>
            <MediaComposer media={replyMedia} onChange={setReplyMedia} />
          </View>
        )}
        <View style={styles.composerInputRow}>
          <Pressable style={styles.photoBtn} onPress={pickReplyImages} hitSlop={6} accessibilityLabel="Add photos">
            <IconPhoto size={17} color={Colors.sakuraDeep} />
          </Pressable>
          <TextInput
            value={replyBody}
            onChangeText={setReplyBody}
            placeholder="reply to this activity…"
            placeholderTextColor={Colors.ink3}
            style={styles.composerInput}
            multiline
          />
          <Pressable
            onPress={sendReply}
            disabled={!canSend}
            hitSlop={6}
            accessibilityLabel="Send reply"
            style={({ pressed }) => [
              styles.sendBtn,
              !canSend && styles.sendBtnDisabled,
              pressed && canSend && styles.sendBtnPressed,
            ]}
          >
            {sending ? <ActivityIndicator size="small" color="#fff" /> : <IconSend size={15} color="#fff" />}
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
  list: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s3, paddingBottom: Spacing.s6 },
  body: { fontFamily: FontFamily.ui, fontSize: sf(15), color: Colors.ink, lineHeight: sf(23), marginTop: Spacing.s4 },
  divider: { height: 1, backgroundColor: Colors.line, marginTop: Spacing.s6, marginBottom: Spacing.s4 },
  responsesLabel: {
    fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.ink3,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12,
  },
  separator: { height: 12 },
  toastWrap: { position: 'absolute', left: 0, right: 0, zIndex: 10, alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: Colors.ink },
  emptySub: { fontFamily: FontFamily.ui, fontSize: sf(12.5), color: Colors.ink3, marginTop: 6 },
  composerWrap: {
    borderTopWidth: 1, borderTopColor: Colors.line, backgroundColor: Colors.vellum,
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2,
  },
  composerMedia: { marginBottom: 8 },
  composerInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  photoBtn: {
    width: 36, height: 36, borderRadius: Radius.pill, marginBottom: 1,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.paperDeep,
  },
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
