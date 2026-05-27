import { useEffect, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { addMessage, addThread, useMessages, useThreads } from '@/store/messages';

export function MessagesTab({ shipId, shipName }: { shipId: string; shipName: string }) {
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
      />
    </View>
  );
}

function ThreadView({
  threadId, shipName,
}: {
  threadId: string;
  shipName: string;
}) {
  const messages = useMessages(threadId);
  const [sender, setSender] = useState<'me' | 'them'>('me');
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

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
      keyboardVerticalOffset={120}
    >
      <View style={s.threadHeader}>
        <Text style={s.threadViewTitle}>MESSAGES</Text>
        <View style={s.senderToggle}>
          <Pressable
            style={[s.senderBtn, sender === 'me' && s.senderBtnActive]}
            onPress={() => setSender('me')}
          >
            <Text style={[s.senderBtnText, sender === 'me' && s.senderBtnTextActive]}>me</Text>
          </Pressable>
          <Pressable
            style={[s.senderBtn, sender === 'them' && s.senderBtnActive]}
            onPress={() => setSender('them')}
          >
            <Text style={[s.senderBtnText, sender === 'them' && s.senderBtnTextActive]}>{shipName} ♡</Text>
          </Pressable>
        </View>
      </View>

      <View style={s.chatContainer}>
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
                    onLongPress={() => Alert.alert('Delete?', m.body.slice(0, 60), [
                      { text: 'Delete', style: 'destructive', onPress: () => {
                        const { deleteMessage } = require('@/store/messages');
                        deleteMessage(m.id);
                      }},
                      { text: 'Cancel', style: 'cancel' },
                    ])}
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
      </View>

      <View style={s.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={sender === 'me' ? 'write to them...' : `${shipName} says...`}
          placeholderTextColor={Colors.ink3}
          style={s.input}
          multiline
        />
        <Pressable style={s.sendBtn} onPress={send}>
          <Text style={s.sendBtnText}>♡</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  tab: { flex: 1, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2, paddingBottom: Spacing.s6 },
  loadingBox: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: FontFamily.ui, color: Colors.ink3, fontSize: 14 },

  // Thread view
  threadView: { flex: 1, minHeight: 480 },
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

  chatContainer: {
    flex: 1,
    backgroundColor: Colors.paperDeep,
    borderRadius: Radius.r4,
    borderWidth: 1.2,
    borderColor: Colors.line,
    minHeight: 360,
    overflow: 'hidden',
  },
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
    paddingTop: Spacing.s3,
  },
  input: {
    flex: 1, maxHeight: 100, paddingVertical: 9, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: 20, fontFamily: FontFamily.ui, fontSize: 13, color: Colors.ink,
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
