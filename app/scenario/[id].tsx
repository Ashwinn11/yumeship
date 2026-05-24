import React, { useState } from 'react';
import { View, Text, TextInput, Pressable,
  ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { WashiTape, Heart, Sparkle } from '@/deco';

const PROMPTS = [
  { ja: '雨', label: 'rainy day' },
  { ja: '夜', label: 'late night call' },
  { ja: '朝', label: 'morning after' },
  { ja: '初', label: 'first meeting' },
  { ja: '待', label: 'waiting for you' },
  { ja: '別', label: 'before goodbye' },
];

export default function ScenarioEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>scenario</Text>
        <Pressable style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>save</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title field */}
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="untitled scene"
          placeholderTextColor={colors.ink3}
          style={styles.titleInput}
        />

        {/* Writing surface */}
        <View style={styles.surface}>
          <View style={styles.tapeWrap}>
            <WashiTape width={72} height={16} pattern="stripe" color={colors.lavenderDeep} rotate={-5} />
          </View>
          <Text style={styles.sceneLabel}>scene · {id ?? '01'}</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            placeholder="the first line. she said my name—"
            placeholderTextColor={colors.ink3}
            style={styles.bodyInput}
            textAlignVertical="top"
          />
          <View style={styles.wordCount}>
            <Text style={styles.wordCountText}>
              {content.trim() ? content.trim().split(/\s+/).length : 0} words
            </Text>
          </View>
        </View>

        {/* Prompt chips */}
        <Text style={styles.promptLabel}>or pick a prompt</Text>
        <View style={styles.promptRow}>
          {PROMPTS.map((p) => (
            <Pressable key={p.ja} onPress={() => setContent(p.label + '…')}>
              <View style={styles.promptChip}>
                <Text style={styles.promptJa}>{p.ja}</Text>
                <Text style={styles.promptChipText}>{p.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteHeart}>
            <Heart size={10} color={colors.lavenderDeep} />
          </View>
          <Text style={styles.noteText}>
            "Every great love story starts with a first scene. This is yours."
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.s4, paddingVertical: spacing.s3,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  back: { width: 32 },
  backText: { fontSize: 22, color: colors.ink2, lineHeight: 26 },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 20, color: colors.ink,
  },
  saveBtn: {
    paddingHorizontal: spacing.s3, paddingVertical: spacing.s1,
    backgroundColor: colors.lavenderDeep,
    borderRadius: radii.pill,
  },
  saveBtnText: { color: colors.vellum, fontSize: 12, fontWeight: '600' },

  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.s5, paddingTop: spacing.s4, paddingBottom: spacing.s6 },

  titleInput: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 28, color: colors.ink,
    borderBottomWidth: 1, borderBottomColor: colors.lineStrong,
    paddingBottom: spacing.s2,
    marginBottom: spacing.s4,
  },

  surface: {
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.r4,
    padding: spacing.s4,
    minHeight: 260,
    position: 'relative',
    marginBottom: spacing.s4,
    ...shadows.sm,
  },
  tapeWrap: { position: 'absolute', top: -8, left: 16 },
  sceneLabel: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, color: colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase',
    marginTop: spacing.s2, marginBottom: spacing.s2,
  },
  bodyInput: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 18, lineHeight: 28, color: colors.ink,
    minHeight: 200,
  },
  wordCount: { alignItems: 'flex-end', marginTop: spacing.s2 },
  wordCountText: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, color: colors.ink3, letterSpacing: 0.8,
  },

  promptLabel: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, color: colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: spacing.s2,
  },
  promptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2, marginBottom: spacing.s4 },
  promptChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: colors.paperDeep,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.pill,
  },
  promptJa: { fontFamily: 'KleeOne', fontSize: 11, color: colors.lavenderDeep, fontWeight: '600' },
  promptChipText: { fontSize: 11, color: colors.ink2 },

  noteCard: {
    padding: spacing.s3,
    backgroundColor: colors.lavenderSoft,
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.lavenderDeep + '80',
    borderRadius: radii.r3,
    position: 'relative',
  },
  noteHeart: { position: 'absolute', top: -5, left: 12 },
  noteText: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 12, color: colors.lavenderDeep, lineHeight: 18,
    marginTop: spacing.s1,
  },
});
