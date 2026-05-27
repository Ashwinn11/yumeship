import { useEffect, useRef, useState } from 'react';
import {
  Keyboard, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CozyModal } from '@/components/ui/CozyModal';
import { IconSend } from '@/components/ui/Icon';
import { Colors, FontFamily, Radius, Spacing } from '@/constants/theme';
import { addMessage, addThread, deleteMessage, useMessages, useThreads } from '@/store/messages';

export function MessagesTab({ shipId, shipName, sender: externalSender, onSenderChange }: {
  shipId: string;
  shipName: string;
  sender?: 'me' | 'them';
  onSenderChange?: (s: 'me' | 'them') => void;
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
        externalSender={externalSender}
        onSenderChange={onSenderChange}
      />
    </View>
  );
}

function ThreadView({
  threadId, shipName, externalSender, onSenderChange,
}: {
  threadId: string;
  shipName: string;
  externalSender?: 'me' | 'them';
  onSenderChange?: (s: 'me' | 'them') => void;
}) {
  const insets = useSafeAreaInsets();
  const messages = useMessages(threadId);
  const [internalSender, setInternalSender] = useState<'me' | 'them'>('me');
  const sender = externalSender ?? internalSender;
  const setSender = onSenderChange ?? setInternalSender;
  const showToggle = !externalSender;
  const [draft, setDraft] = useState('');
  const [msgToDelete, setMsgToDelete] = useState<string | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardOpen(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    });
    const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardOpen(false));
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
      style={s.threadView}
      keyboardVerticalOffset={100}
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
      {showToggle && (
        <View style={s.threadHeader}>
          <Text style={s.threadViewTitle}>MESSAGES</Text>
          <View style={s.senderToggle}>
            <Pressable style={[s.senderBtn, sender === 'me' && s.senderBtnActive]} onPress={() => setSender('me')}>
              <Text style={[s.senderBtnText, sender === 'me' && s.senderBtnTextActive]}>me</Text>
            </Pressable>
            <Pressable style={[s.senderBtn, sender === 'them' && s.senderBtnActive]} onPress={() => setSender('them')}>
              <Text style={[s.senderBtnText, sender === 'them' && s.senderBtnTextActive]}>{shipName} ♡</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={s.bubbleScroll}
        contentContainerStyle={s.bubbleContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <Text style={s.noMessages}>imagined texts — never sent, always read ♡</Text>
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
                  <Text key={`time-${m.id}`} style={s.dayLabel}>
                    {weekday}, {time}
                  </Text>
                );
              }
              lastTime = m.createdAt;
              list.push(
                <Pressable
                  key={m.id}
                  style={[s.bubbleRow, m.sender === 'me' ? s.bubbleRowMe : s.bubbleRowThem]}
                  onLongPress={() => setMsgToDelete(m.id)}
                >
                  <View style={[s.bubble, m.sender === 'me' ? s.bubbleMe : s.bubbleThem]}>
                    <Text style={[s.bubbleText, m.sender === 'me' ? s.bubbleTextMe : s.bubbleTextThem]}>
                      {m.body}
                    </Text>
                  </View>
                </Pressable>
              );
            });
            return list;
          })()
        )}
      </ScrollView>

      <View style={[s.inputRow, { paddingBottom: keyboardOpen ? Spacing.s3 : Math.max(insets.bottom, Spacing.s3) }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={sender === 'me' ? 'write to them...' : `${shipName} says...`}
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
  loadingText: { fontFamily: FontFamily.ui, color: Colors.ink3, fontSize: 14 },

  // Thread view
  threadView: { flex: 1 },
  threadHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, marginBottom: 12,
  },
  threadViewTitle: { fontFamily: FontFamily.marker, fontSize: 10, color: Colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase' },
  senderToggle: { flexDirection: 'row', backgroundColor: Colors.paperDeep, borderRadius: Radius.pill, padding: 3, borderWidth: 1, borderColor: Colors.line },
  senderBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.pill },
  senderBtnActive: { backgroundColor: Colors.sakuraDeep },
  senderBtnText: { fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink2 },
  senderBtnTextActive: { color: Colors.vellum },

  bubbleScroll: { flex: 1 },
  bubbleContent: { paddingHorizontal: 16, paddingVertical: 18, gap: 12 },
  noMessages: { textAlign: 'center', fontFamily: FontFamily.ui, fontSize: 12, color: Colors.ink3, paddingTop: 40, paddingHorizontal: 20 },

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
  bubbleText: { fontFamily: FontFamily.ui, fontSize: 13, lineHeight: 18 },
  bubbleTextMe: { color: Colors.vellum },
  bubbleTextThem: { color: Colors.ink },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s3,
    borderTopWidth: 1, borderTopColor: Colors.line,
    backgroundColor: Colors.paperDeep,
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 120, paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 20, fontFamily: FontFamily.ui, fontSize: 14, color: Colors.ink,
    lineHeight: 20,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnText: { fontSize: 16, color: Colors.vellum },
  dayLabel: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.ink3,
    fontFamily: FontFamily.marker,
    letterSpacing: 0.6,
    marginVertical: 8,
  },
});
