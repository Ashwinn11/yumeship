import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { GroupChatBubble } from '@/components/community/GroupChatBubble';
import { JoinGroupButton } from '@/components/community/JoinGroupButton';
import { mediaFromAssets } from '@/components/community/MediaComposer';
import { MentionAutocomplete } from '@/components/community/MentionAutocomplete';
import { MessageActionSheet } from '@/components/community/MessageActionSheet';
import { ReportSheet } from '@/components/community/ReportSheet';
import { InlineToast, useInlineToast } from '@/components/ui/InlineToast';
import { IconPhoto } from '@/components/ui/Icon';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { useAuthUser } from '@/store/auth';
import type { LocalPickedMedia } from '@/store/community';
import { fetchGroup, useGroupChat, type CommunityGroup, type GroupMessage } from '@/store/groups';

const keyExtractor = (m: GroupMessage) => m.id;

export default function GroupChatScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useAuthUser();

  const [group, setGroup] = useState<CommunityGroup | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingGroup(true);
    fetchGroup(id).then((g) => {
      if (!cancelled) {
        setGroup(g);
        setLoadingGroup(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const { messages, loading, loadMore, send } = useGroupChat(id);
  const messagesById = useMemo(() => new Map(messages.map((m) => [m.id, m])), [messages]);
  const invertedData = useMemo(() => [...messages].reverse(), [messages]);

  const [draft, setDraft] = useState('');
  const [draftSelection, setDraftSelection] = useState(0);
  const [replyTo, setReplyTo] = useState<GroupMessage | null>(null);
  const [image, setImage] = useState<LocalPickedMedia | null>(null);
  const [sending, setSending] = useState(false);
  const [actionTarget, setActionTarget] = useState<GroupMessage | null>(null);
  const [reportTarget, setReportTarget] = useState<GroupMessage | null>(null);
  const { message: toastMsg, nonce: toastNonce, show: showToast } = useInlineToast();

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (res.canceled) return;
    const picked = mediaFromAssets(res.assets)[0];
    if (picked) setImage(picked);
  }

  async function handleSend() {
    if (sending || (!draft.trim() && !image)) return;
    setSending(true);
    const body = draft;
    const replyToId = replyTo?.id;
    const img = image;
    setDraft('');
    setReplyTo(null);
    setImage(null);
    try {
      await send({ body, replyToId, image: img ?? undefined });
    } catch {
      // put it back so nothing typed or attached is lost
      setDraft(body);
      if (replyToId) setReplyTo(messagesById.get(replyToId) ?? null);
      setImage(img);
    } finally {
      setSending(false);
    }
  }

  const renderMessage = useCallback(
    ({ item, index }: { item: GroupMessage; index: number }) => {
      // invertedData is newest-first, so index+1 is the chronologically
      // previous message — same sender there means this bubble is mid-run
      // and shouldn't repeat the avatar/name (WhatsApp/iMessage convention)
      const prev = invertedData[index + 1];
      const showIdentity = !prev || prev.sender.id !== item.sender.id;
      return (
        <GroupChatBubble
          message={item}
          isMe={item.sender.id === me?.id}
          messagesById={messagesById}
          onLongPress={() => setActionTarget(item)}
          showIdentity={showIdentity}
        />
      );
    },
    [me?.id, messagesById, invertedData],
  );

  if (loadingGroup) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator color={Colors.sakuraDeep} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.screen}>
        <Pressable onPress={() => router.back()} style={[styles.headerBtn, { marginTop: insets.top + Spacing.s2, marginLeft: Spacing.s5 }]}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.notFound}>this group isn't available</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.s1 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <Pressable
          style={styles.headerCenter}
          onPress={() => router.push(`/social/groups/${group.id}/info` as any)}
          accessibilityLabel="Group info"
        >
          <View style={styles.headerAvatar}>
            {group.avatarUrl ? (
              <Image source={{ uri: group.avatarUrl }} style={styles.headerAvatarImg} contentFit="cover" {...AVATAR_IMAGE} />
            ) : (
              <Text style={styles.headerAvatarInitial}>{group.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
            )}
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle} numberOfLines={1}>{group.name}</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {group.fandom ? `#${group.fandom} · ` : ''}{group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
          <Text style={styles.headerChevron}>›</Text>
        </Pressable>
      </View>

      <FlatList
        data={invertedData}
        keyExtractor={keyExtractor}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={ChatSeparator}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={Colors.sakuraDeep} style={styles.emptySpinner} />
          ) : (
            <Text style={styles.empty}>say hello ♡</Text>
          )
        }
      />

      {group.isMember ? (
        <View style={[styles.composerWrap, { paddingBottom: insets.bottom + Spacing.s2 }]}>
          {!!replyTo && (
            <View style={styles.replyBanner}>
              <View style={styles.replyBannerText}>
                <Text style={styles.replyBannerSender} numberOfLines={1}>
                  replying to {replyTo.sender.name || replyTo.sender.username}
                </Text>
                <Text style={styles.replyBannerBody} numberOfLines={1}>
                  {replyTo.body || (replyTo.media.length > 0 ? 'photo' : '')}
                </Text>
              </View>
              <Pressable onPress={() => setReplyTo(null)} hitSlop={8} accessibilityLabel="Cancel reply">
                <Text style={styles.bannerCancel}>✕</Text>
              </Pressable>
            </View>
          )}
          {!!image && (
            <View style={styles.imagePreviewRow}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} contentFit="cover" />
              <Pressable style={styles.imagePreviewRemove} onPress={() => setImage(null)} hitSlop={8} accessibilityLabel="Remove photo">
                <Text style={styles.bannerCancel}>✕</Text>
              </Pressable>
            </View>
          )}
          <MentionAutocomplete
            value={draft}
            selection={draftSelection}
            onPick={({ text, cursor }) => {
              setDraft(text);
              setDraftSelection(cursor);
            }}
          />
          <View style={styles.composerRow}>
            <Pressable style={styles.imagePickBtn} onPress={pickImage} hitSlop={6} disabled={!!image} accessibilityLabel="Add photo">
              <IconPhoto size={17} color={image ? Colors.ink3 : Colors.sakuraDeep} />
            </Pressable>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSelectionChange={(e) => setDraftSelection(e.nativeEvent.selection.start)}
              placeholder="message the group…"
              placeholderTextColor={Colors.ink3}
              style={styles.input}
              multiline
            />
            <Pressable
              onPress={handleSend}
              disabled={sending || (!draft.trim() && !image)}
              accessibilityLabel="Send message"
              style={({ pressed }) => [
                styles.sendBtn,
                (sending || (!draft.trim() && !image)) && styles.sendBtnDisabled,
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
      ) : (
        <View style={[styles.joinWrap, { paddingBottom: insets.bottom + Spacing.s4 }]}>
          <Text style={styles.joinHint}>join to see and send messages</Text>
          <JoinGroupButton
            groupId={group.id}
            initialMember={false}
            onChange={(m) => setGroup((g) => (g ? { ...g, isMember: m } : g))}
          />
        </View>
      )}

      <View style={[styles.toastWrap, { top: insets.top + Spacing.s2 }]} pointerEvents="none">
        <InlineToast message={toastMsg} nonce={toastNonce} />
      </View>

      <MessageActionSheet
        visible={!!actionTarget}
        onClose={() => setActionTarget(null)}
        actions={[
          { label: 'Reply', onPress: () => actionTarget && setReplyTo(actionTarget) },
          ...(actionTarget && actionTarget.sender.id !== me?.id
            ? [{ label: 'Report', onPress: () => setReportTarget(actionTarget), destructive: true }]
            : []),
        ]}
      />
      <ReportSheet
        visible={!!reportTarget}
        targetType="group_message"
        targetId={reportTarget?.id ?? ''}
        onClose={() => setReportTarget(null)}
        onSubmitted={() => { setReportTarget(null); showToast('report sent — thank you'); }}
        onFailure={() => showToast("couldn't send report — try again")}
      />
    </KeyboardAvoidingView>
  );
}

// tighter gap within a same-sender run, normal gap where the sender changes
// — FlatList passes leading/trailing items to the separator automatically
const ChatSeparator = ({ leadingItem, trailingItem }: { leadingItem?: GroupMessage; trailingItem?: GroupMessage }) => (
  <View style={leadingItem && trailingItem && leadingItem.sender.id === trailingItem.sender.id ? styles.chatSeparatorTight : styles.chatSeparator} />
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  centeredScreen: { flex: 1, backgroundColor: Colors.paper, alignItems: 'center', justifyContent: 'center' },
  toastWrap: { position: 'absolute', left: 0, right: 0, zIndex: 10, alignItems: 'center' },
  emptySpinner: { marginTop: 60 },
  notFound: {
    fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink3, textAlign: 'center', marginTop: 60,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s3,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnText: { fontSize: sf(18), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: sf(20) },
  headerCenter: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 34, height: 34, borderRadius: Radius.pill,
    backgroundColor: Colors.sakura, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  headerAvatarImg: { width: 34, height: 34, borderRadius: Radius.pill },
  headerAvatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(15), color: '#fff' },
  headerTextCol: { flex: 1, minWidth: 0 },
  headerChevron: { fontFamily: FontFamily.ui, fontSize: sf(20), color: Colors.ink3, marginLeft: 2 },
  headerTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: Colors.ink },
  headerSub: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3, marginTop: 1 },

  listContent: { paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s4, flexGrow: 1 },
  chatSeparator: { height: 8 },
  chatSeparatorTight: { height: 2 },
  empty: {
    fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink3,
    textAlign: 'center', marginTop: 60, transform: [{ scaleY: -1 }],
  },

  composerWrap: {
    borderTopWidth: 1, borderTopColor: Colors.line,
    backgroundColor: Colors.paperDeep,
    paddingHorizontal: Spacing.s4, paddingTop: Spacing.s2,
  },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 6 },
  imagePickBtn: {
    width: 38, height: 38, borderRadius: Radius.pill,
    backgroundColor: Colors.vellum, borderWidth: 1.2, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 120, paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 20, fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink, lineHeight: sf(20),
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.45 },
  sendBtnPressed: { opacity: 0.8 },

  replyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r3, paddingVertical: 6, paddingHorizontal: 10,
  },
  replyBannerText: { flex: 1, minWidth: 0 },
  replyBannerSender: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(11.5), color: Colors.sakuraDeep },
  replyBannerBody: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3, marginTop: 1 },
  bannerCancel: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3 },

  imagePreviewRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6,
  },
  imagePreview: { width: 52, height: 52, borderRadius: 10 },
  imagePreviewRemove: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center',
  },

  joinWrap: { alignItems: 'center', gap: 10, paddingTop: Spacing.s3, borderTopWidth: 1, borderTopColor: Colors.line, backgroundColor: Colors.paperDeep },
  joinHint: { fontFamily: FontFamily.ui, fontSize: sf(12.5), color: Colors.ink3 },
});
