import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { WashiTape, Heart } from '@/deco';

const StepDots = ({ step }: { step: number }) => (
  <View style={styles.dots}>
    {[0, 1, 2, 3, 4].map((i) => (
      <View
        key={i}
        style={[
          styles.dot,
          {
            width: i === step ? 18 : 6,
            backgroundColor: i === step ? colors.sakuraDeep : i < step ? colors.sakura : colors.paperDeep,
          },
        ]}
      />
    ))}
  </View>
);

const PROMPTS = [
  { ja: '雨', label: 'rainy day' },
  { ja: '夜', label: 'late call' },
  { ja: '朝', label: 'morning after' },
  { ja: '初', label: 'first meeting' },
];

export default function Scenario() {
  const [scene, setScene] = useState('');

  const finish = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <StepDots step={4} />

        <View style={styles.header}>
          <Text style={styles.step}>♡ step four · the first scene</Text>
          <Text style={styles.heading}>The first time{'\n'}you saw them.</Text>
          <Text style={styles.sub}>
            Just a few sentences. You can come back. Or pick from a prompt.
          </Text>
        </View>

        {/* Writing surface */}
        <View style={styles.writingSurface}>
          <View style={styles.washiWrap}>
            <WashiTape width={56} height={14} pattern="heart" color={colors.sakuraDeep} rotate={-6} />
          </View>
          <Text style={styles.sceneLabel}>scene 01</Text>
          <TextInput
            value={scene}
            onChangeText={setScene}
            multiline
            placeholder={'the first cutscene. she said my name—'}
            placeholderTextColor={colors.ink3}
            style={styles.sceneInput}
            textAlignVertical="top"
          />
        </View>

        {/* Prompt chips */}
        <View style={styles.promptSection}>
          <Text style={styles.promptLabel}>or pick a prompt</Text>
          <View style={styles.promptRow}>
            {PROMPTS.map((p) => (
              <Pressable key={p.ja} onPress={() => setScene(p.label + '…')}>
                <View style={styles.promptChip}>
                  <Text style={styles.promptJa}>{p.ja}</Text>
                  <Text style={styles.promptChipText}>{p.label}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={finish} style={styles.primaryBtn}>
          <Heart size={14} color={colors.vellum} />
          <Text style={styles.primaryBtnText}>finish · keep them close</Text>
        </Pressable>
        <Pressable onPress={finish} style={styles.skipBtn}>
          <Text style={styles.skipText}>save &amp; finish later</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.s6, paddingTop: spacing.s4, paddingBottom: spacing.s3 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: spacing.s6 },
  dot: { height: 6, borderRadius: radii.pill },
  header: { marginBottom: spacing.s4 },
  step: {
    fontSize: 10, color: colors.lavenderDeep,
    letterSpacing: 1.6, fontFamily: 'JetBrainsMono', fontWeight: '600',
    textTransform: 'uppercase', marginBottom: spacing.s2,
  },
  heading: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 30, lineHeight: 32,
    letterSpacing: -0.3, color: colors.ink,
    marginBottom: spacing.s2,
  },
  sub: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 13, lineHeight: 20,
    color: colors.ink2,
  },
  writingSurface: {
    padding: spacing.s4,
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.r4,
    minHeight: 220,
    position: 'relative',
    marginBottom: spacing.s3,
    ...shadows.sm,
  },
  washiWrap: { position: 'absolute', top: -8, left: 16 },
  sceneLabel: {
    fontSize: 9, color: colors.ink3,
    letterSpacing: 1.4, fontFamily: 'JetBrainsMono',
    textTransform: 'uppercase', marginBottom: spacing.s2,
    marginTop: spacing.s1,
  },
  sceneInput: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 18, lineHeight: 27,
    color: colors.ink,
    minHeight: 160,
  },
  promptSection: {},
  promptLabel: {
    fontSize: 9, color: colors.ink3,
    letterSpacing: 1.2, fontFamily: 'JetBrainsMono',
    textTransform: 'uppercase', marginBottom: spacing.s2,
  },
  promptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2 },
  promptChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: colors.paperDeep,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.pill,
  },
  promptJa: { fontFamily: 'KleeOne', fontSize: 11, color: colors.sakuraDeep, fontWeight: '600' },
  promptChipText: { fontSize: 11, color: colors.ink2 },
  footer: {
    paddingHorizontal: spacing.s6, paddingBottom: spacing.s3,
    gap: spacing.s3, backgroundColor: colors.paper,
  },
  primaryBtn: {
    height: 48, backgroundColor: colors.sakuraDeep,
    borderRadius: radii.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.s2,
    ...shadows.md,
  },
  primaryBtnText: { color: colors.vellum, fontSize: 15, fontWeight: '600' },
  skipBtn: { alignItems: 'center' },
  skipText: { color: colors.ink3, fontSize: 13, textDecorationLine: 'underline' },
});
