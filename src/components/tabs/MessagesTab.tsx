import { useEffect, useRef, useState } from 'react';
import {
  Keyboard, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useIPad } from '@/hooks/use-ipad';

import { CozyModal } from '@/components/ui/CozyModal';
import { IconSend } from '@/components/ui/Icon';
import { Colors, FontFamily, Radius, Spacing ,sf } from '@/constants/theme';
import { addMessage, addThread, deleteMessage, useMessages, useThreads } from '@/store/messages';
import { getMembers, isPoly, memberColor, membersLabel, shipMe, useShip } from '@/store/ships';
import { MemberPicker } from '@/components/nav/MemberPicker';
import { StickerEnvelope } from '@/components/deco';

export function MessagesTab({ shipId, shipName, sender: externalSender, onSenderChange, onBack }: {
  shipId: string;
  shipName: string;
  sender?: string;
  onSenderChange?: (s: string) => void;
  onBack?: () => void;
}) {
  const threads = useThreads(shipId);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (threads.length === 0) {
      addThread(shipId, 'Chat');
    } else {
      setInitialized(true);
    }
  }, [threads, shipId]);

  if (!initialized || threads.length === 0) {
    return (
      <View style={s.loadingBox}>
        <Text style={s.loadingText}>connecting...</Text>
      </View>
    );
  }

  const thread = threads[0];

  return (
    <View style={s.tab}>
      <ThreadView
        threadId={thread.id}
        shipName={shipName}
        shipId={shipId}
        externalSender={externalSender}
        onSenderChange={onSenderChange}
        onBack={onBack}
      />
    </View>
  );
}

function ThreadView({
  threadId, shipName, shipId, externalSender, onSenderChange, onBack,
}: {
  threadId: string;
  shipName: string;
  shipId: string;
  externalSender?: string;
  onSenderChange?: (s: string) => void;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { isIPad } = useIPad();
  const ship = useShip(shipId);
  const poly = isPoly(ship);
  const members = getMembers(ship);
  const meId = shipMe(ship)?.id ?? 'me';
  const gradStart = ship?.gradStart ?? Colors.sakura;
  const gradEnd = ship?.gradEnd ?? Colors.sakuraDeep;
  // foName = the F/O character name, shipName = the ship title label
  const foName = ship?.name || shipName;
  const shipTitle = ship?.shipName || '';
  // For poly the chat is a group — the header shows the polycule, not one partner.
  const headerName = poly ? (shipTitle || foName) : foName;
  const headerSub = poly ? membersLabel(ship) : (shipTitle || 'imagined ♡');
  const messages = useMessages(threadId);
  const [internalSender, setInternalSender] = useState<string>(poly ? meId : 'me');
  const sender = externalSender ?? internalSender;
  const setSender = onSenderChange ?? setInternalSender;
  const showToggle = !externalSender;
  const [draft, setDraft] = useState('');
  const [msgToDelete, setMsgToDelete] = useState<string | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => {
      setKeyboardOpen(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    });
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  function send() {
    if (!draft.trim()) return;
    addMessage(threadId, sender, draft.trim());
    setDraft('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
    >
      <CozyModal
        visible={!!msgToDelete}
        title="delete this message?"
        confirmText="Delete"
        cancelText="keep it"
        isDestructive
        onConfirm={() => { if (msgToDelete) deleteMessage(msgToDelete); setMsgToDelete(null); }}
        onClose={() => setMsgToDelete(null)}
      />

      {/* ── Header ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingTop: 18,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: Colors.line,
          backgroundColor: Colors.paper,
          zIndex: 10,
          overflow: 'visible',
        }}
      >
        {/* Back chevron */}
        {onBack && (
          <Pressable onPress={onBack} hitSlop={8} style={{ marginRight: 2 }}>
            <Text style={{ fontSize: sf(28), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: 28 }}>‹</Text>
          </Pressable>
        )}

        {/* F/O Avatar Circle */}
        <LinearGradient
          colors={[gradStart, gradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: '#ffffff',
            shadowColor: 'rgba(110,58,90,0.18)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text style={{ color: '#fff', fontFamily: FontFamily.displayItalic, fontSize: sf(21) }}>
            {(headerName || '♡').charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>

        {/* Name + subtitle */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(19), color: Colors.ink, lineHeight: 21 }}>
            {headerName}
          </Text>
          <Text style={{ fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.sakuraInk, marginTop: 1 }}>
            {headerSub || 'imagined ♡'}
          </Text>
        </View>

        {/* Segmented sender control — single ships only (poly uses "speaking as" below) */}
        {!poly && (
        <View style={{
          flexDirection: 'row',
          backgroundColor: Colors.vellum,
          borderRadius: 99,
          borderWidth: 1.2,
          borderColor: Colors.line,
          padding: 3,
        }}>
          <Pressable
            onPress={() => setSender('me')}
            style={{
              paddingVertical: 5,
              paddingHorizontal: 14,
              borderRadius: 99,
              backgroundColor: sender === 'me' ? Colors.sakuraDeep : 'transparent',
            }}
          >
            <Text style={{
              fontFamily: FontFamily.uiMedium,
              fontSize: sf(12),
              color: sender === 'me' ? Colors.vellum : Colors.ink2,
            }}>
              me
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSender('them')}
            style={{
              paddingVertical: 5,
              paddingHorizontal: 14,
              borderRadius: 99,
              backgroundColor: sender === 'them' ? Colors.sakuraDeep : 'transparent',
            }}
          >
            <Text style={{
              fontFamily: FontFamily.uiMedium,
              fontSize: sf(12),
              color: sender === 'them' ? Colors.vellum : Colors.ink2,
            }}>
              {foName}
            </Text>
          </Pressable>
        </View>
        )}
      </View>

      {/* Message Container Area */}
      <View style={{ flex: 1, position: 'relative' }}>
        <ScrollView
          ref={scrollRef}
          style={s.bubbleScroll}
          contentContainerStyle={[s.bubbleContent, messages.length === 0 && { flexGrow: 1, justifyContent: 'center' }]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          {messages.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingHorizontal: 20, gap: 12 }}>
              <StickerEnvelope size={88} />
              <Text style={{ fontFamily: FontFamily.script, fontSize: sf(26), color: Colors.ink, textAlign: 'center', marginTop: 10 }}>
                your conversation starts here
              </Text>
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: Colors.sakuraDeep,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 99,
                  shadowColor: 'rgba(110, 58, 90, 0.12)',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 3,
                  elevation: 1,
                  marginTop: 10,
                }}
                onPress={() => inputRef.current?.focus()}
              >
                <IconSend size={11} color={Colors.vellum} />
                <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.vellum }}>write the first one</Text>
              </Pressable>
            </View>
          ) : (
            (() => {
              const list: React.ReactNode[] = [];
              let lastTime = 0;

              messages.forEach((m, idx) => {
                const showTime = idx === 0 || (m.createdAt - lastTime > 15 * 60 * 1000);
                if (showTime) {
                  const dateObj = new Date(m.createdAt);
                  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                  const time = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
                  list.push(
                    <View key={`time-${m.id}`} style={{ alignItems: 'center', marginVertical: 14 }}>
                      <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                        🌸 {weekday.toUpperCase()} · {time.toUpperCase()}
                      </Text>
                    </View>
                  );
                }
                lastTime = m.createdAt;
                const mine = poly ? (m.sender === meId || m.sender === 'me') : (m.sender === 'me');
                const sIdx = members.findIndex((x) => x.id === m.sender);
                const sColor = sIdx >= 0 ? memberColor(sIdx) : Colors.sakuraDeep;
                const sLabel = poly && !mine ? (members[sIdx]?.name || foName) : '';
                list.push(
                  <Pressable
                    key={m.id}
                    style={[s.bubbleRow, mine ? s.bubbleRowMe : s.bubbleRowThem]}
                    onLongPress={() => setMsgToDelete(m.id)}
                  >
                    <View style={{ maxWidth: '78%', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                      {sLabel ? <Text style={s.senderLabel}>{sLabel}</Text> : null}
                      <View style={[s.bubble, { maxWidth: '100%' }, mine ? s.bubbleMe : (poly ? { backgroundColor: sColor, borderBottomLeftRadius: 4 } : s.bubbleThem)]}>
                        <Text style={[s.bubbleText, (mine || poly) ? s.bubbleTextMe : s.bubbleTextThem]}>
                          {m.body}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              });
              return list;
            })()
          )}
        </ScrollView>
      </View>

      {poly && members.length > 0 && (
        <View style={s.speakingAs}>
          <Text style={s.speakingLabel}>speaking as</Text>
          <MemberPicker ship={ship} includeMe selectedId={sender} onSelect={(id) => setSender(id)} />
        </View>
      )}

      <View style={[s.inputRow, { paddingBottom: keyboardOpen ? Spacing.s3 : Math.max(insets.bottom, Spacing.s3) }]}>
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={setDraft}
          placeholder={poly
            ? (sender === meId ? 'write to the group…' : `${members.find((x) => x.id === sender)?.name || ''} says…`)
            : (sender === 'me' ? 'write to them...' : `${foName} says...`)}
          placeholderTextColor={Colors.ink3}
          style={s.input}
          multiline
          textAlignVertical="top"
          onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)}
        />
        <Pressable style={s.sendBtn} onPress={send}>
          <IconSend size={16} color={Colors.vellum} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  tab: { flex: 1, backgroundColor: Colors.paperDeep },
  loadingBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: FontFamily.ui, color: Colors.ink3, fontSize: sf(14) },

  // Thread view
  threadView: { flex: 1 },
  threadHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, marginBottom: 12,
  },
  threadViewTitle: { fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase' },
  senderToggle: { flexDirection: 'row', backgroundColor: Colors.paperDeep, borderRadius: Radius.pill, padding: 3, borderWidth: 1, borderColor: Colors.line },
  senderBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.pill },
  senderBtnActive: { backgroundColor: Colors.sakuraDeep },
  senderBtnText: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink2 },
  senderBtnTextActive: { color: Colors.vellum },

  bubbleScroll: { flex: 1 },
  bubbleContent: { paddingHorizontal: 16, paddingVertical: 18, gap: 12 },
  noMessages: { textAlign: 'center', fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3, paddingTop: 40, paddingHorizontal: 20 },

  bubbleRow: { flexDirection: 'row', width: '100%' },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubbleRowThem: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: Colors.sakuraDeep,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.vellum,
    borderWidth: 1.2,
    borderColor: Colors.line,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontFamily: FontFamily.ui, fontSize: sf(13), lineHeight: 18 },
  bubbleTextMe: { color: Colors.vellum },
  bubbleTextThem: { color: Colors.ink },
  senderLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(10), color: Colors.ink3, marginBottom: 2, marginLeft: 4 },

  speakingAs: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2,
    backgroundColor: Colors.paperDeep,
  },
  speakingLabel: { fontFamily: FontFamily.marker, fontSize: sf(9), letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.ink3 },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s3,
    borderTopWidth: 1, borderTopColor: Colors.line,
    backgroundColor: Colors.paperDeep,
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 120, paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 20, fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink,
    lineHeight: 20,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnText: { fontSize: sf(16), color: Colors.vellum },
  dayLabel: {
    textAlign: 'center',
    fontSize: sf(11),
    color: Colors.ink3,
    fontFamily: FontFamily.marker,
    letterSpacing: 0.6,
    marginVertical: 8,
  },
});
