import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';

type Message = {
  id: string;
  content: string;
  isFromUser: boolean;
  timestamp: string;
};

const MOCK_MESSAGES: Message[] = [
  { id: '1', content: 'you up?', isFromUser: false, timestamp: 'TUESDAY · 11:42PM' },
  { id: '2', content: "i'm thinking about that ramen place again", isFromUser: false, timestamp: '' },
  { id: '3', content: "obviously. it's me you're texting.", isFromUser: true, timestamp: '' },
  { id: '4', content: "tomorrow. i'll meet you after work.", isFromUser: true, timestamp: '' },
  { id: '5', content: 'okay. wear the green coat.', isFromUser: false, timestamp: '' },
];

function Bubble({ message }: { message: Message }) {
  const isMe = message.isFromUser;
  return (
    <View style={[styles.bubbleWrap, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
      {message.timestamp ? (
        <Text style={styles.timestamp}>{message.timestamp}</Text>
      ) : null}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.bubbleText, { color: isMe ? colors.vellum : colors.ink }]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function Messages() {
  const [text, setText] = useState('');
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  const send = () => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), content: text.trim(), isFromUser: isUserTurn, timestamp: '' },
    ]);
    setText('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
          <View>
            <Text style={styles.headerName}>Kafka</Text>
            <Text style={styles.headerMeta}>good morning texts · 28</Text>
          </View>
        </View>
        <Text style={styles.lockIcon}>🔒</Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <Bubble message={item} />}
      />

      {/* Composer */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.composer}>
          {/* Toggle */}
          <View style={styles.toggleRow}>
            <Pressable onPress={() => setIsUserTurn(false)}>
              <View style={[styles.sideChip, !isUserTurn && styles.sideChipActive]}>
                <Text style={[styles.sideChipText, { color: !isUserTurn ? colors.vellum : colors.ink2 }]}>me</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setIsUserTurn(true)}>
              <View style={[styles.sideChip, isUserTurn && styles.sideChipActive]}>
                <Text style={[styles.sideChipText, { color: isUserTurn ? colors.vellum : colors.ink2 }]}>them ♡</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={isUserTurn ? 'write what they\'d say…' : 'write your reply…'}
              placeholderTextColor={colors.ink3}
              style={styles.input}
            />
            <Pressable onPress={send} style={styles.sendBtn}>
              <Text style={styles.sendIcon}>➤</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paperDeep },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.s4, paddingVertical: spacing.s3,
    borderBottomWidth: 1, borderBottomColor: colors.line,
    backgroundColor: colors.paper,
  },
  backBtn: { fontSize: 18, color: colors.ink2 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  avatar: {
    width: 30, height: 30, borderRadius: radii.pill,
    backgroundColor: colors.sakura,
    borderWidth: 1.5, borderColor: colors.sakuraDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'InstrumentSerif_Italic', fontSize: 14, color: colors.vellum },
  headerName: { fontFamily: 'InstrumentSerif_Italic', fontSize: 16, color: colors.ink },
  headerMeta: { fontFamily: 'JetBrainsMono', fontSize: 8, color: colors.ink3, letterSpacing: 0.8 },
  lockIcon: { fontSize: 14 },

  list: { padding: spacing.s3 + 2, gap: spacing.s2 },

  bubbleWrap: { maxWidth: '80%' },
  bubbleRight: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleLeft: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  timestamp: {
    fontFamily: 'JetBrainsMono', fontSize: 9,
    color: colors.ink3, letterSpacing: 1, textAlign: 'center',
    alignSelf: 'center', marginBottom: spacing.s1, marginHorizontal: 'auto' as any,
  },
  bubble: {
    paddingHorizontal: spacing.s3, paddingVertical: spacing.s2 + 2,
    borderRadius: radii.r4,
  },
  bubbleMe: {
    backgroundColor: colors.sakuraDeep,
    borderBottomRightRadius: radii.r1,
  },
  bubbleThem: {
    backgroundColor: colors.paperDeep,
    borderBottomLeftRadius: radii.r1,
    borderWidth: 1, borderColor: colors.line,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },

  composer: {
    backgroundColor: colors.paper,
    borderTopWidth: 1, borderTopColor: colors.line,
    paddingHorizontal: spacing.s3, paddingTop: spacing.s2, paddingBottom: spacing.s2 + 4,
    gap: spacing.s2,
  },
  toggleRow: { flexDirection: 'row', gap: spacing.s1, justifyContent: 'center' },
  sideChip: {
    paddingHorizontal: 12, paddingVertical: 3,
    borderRadius: radii.pill, backgroundColor: colors.paperDeep,
  },
  sideChipActive: { backgroundColor: colors.sakuraDeep },
  sideChipText: { fontSize: 10, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  input: {
    flex: 1, paddingHorizontal: spacing.s3 + 2, paddingVertical: spacing.s2 + 1,
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.pill,
    fontSize: 12, fontFamily: 'InstrumentSerif_Italic',
    color: colors.ink, fontStyle: 'italic',
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: radii.pill,
    backgroundColor: colors.sakuraDeep,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  sendIcon: { color: colors.vellum, fontSize: 12 },
});
