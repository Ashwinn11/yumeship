import React, { useState } from 'react';
import { View, Text, TextInput, Pressable,
  ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Sparkle, Heart } from '@/deco';

const PRONOUNS = ['she/her', 'he/him', 'they/them', '+'];
const COLORS = [
  colors.sakura, colors.lavender, colors.sage,
  colors.peach, colors.butter, colors.plum,
];

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

export default function Persona() {
  const [name, setName] = useState('');
  const [pronouns, setPronouns] = useState(0);
  const [color, setColor] = useState(0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <StepDots step={1} />

        <View style={styles.header}>
          <Text style={styles.step}>✶ step one · you</Text>
          <Text style={styles.heading}>Who are you,{'\n'}in their world?</Text>
          <Text style={styles.sub}>
            A self-insert is you in their story. Or someone you've imagined for it. There's no wrong way.
          </Text>
        </View>

        {/* Persona card */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Your name (or theirs for you)</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Mae"
              placeholderTextColor={colors.ink3}
              style={styles.underInput}
            />
          </View>

          <View style={[styles.fieldGroup, { marginTop: spacing.s3 }]}>
            <Text style={styles.fieldLabel}>Pronouns</Text>
            <View style={styles.chipRow}>
              {PRONOUNS.map((p, i) => (
                <Pressable key={p} onPress={() => setPronouns(i)}>
                  <View style={[
                    styles.chip,
                    {
                      backgroundColor: i === pronouns ? colors.sakuraSoft : colors.paperDeep,
                      borderColor: i === pronouns ? colors.sakuraDeep : 'transparent',
                    },
                  ]}>
                    <Text style={[
                      styles.chipText,
                      { color: i === pronouns ? colors.sakuraDeep : colors.ink2, fontWeight: i === pronouns ? '600' : '500' },
                    ]}>
                      {p}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.fieldGroup, { marginTop: spacing.s3 }]}>
            <Text style={styles.fieldLabel}>A color that feels like you</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c, i) => (
                <Pressable key={c} onPress={() => setColor(i)}>
                  <View style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    i === color && styles.colorDotActive,
                  ]}>
                    {i === color && (
                      <View style={styles.colorSparkleWrap}>
                        <Sparkle size={9} color={colors.sakuraDeep} />
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Note card */}
        <View style={styles.noteCard}>
          <View style={styles.noteHeart}>
            <Heart size={10} color={colors.sakuraDeep} />
          </View>
          <Text style={styles.noteText}>
            "Even if you change your mind, you can change all of this later. Nothing is fixed."
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => router.push('/onboarding/first-fo' as any)} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>continue · meet them ›</Text>
        </Pressable>
        <Pressable style={styles.skipBtn}>
          <Text style={styles.skipText}>add later</Text>
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
  header: { marginBottom: spacing.s5 },
  step: {
    fontSize: 10, color: colors.sakuraDeep,
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
  card: {
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.r4,
    padding: spacing.s5,
    ...shadows.sm,
  },
  fieldGroup: { gap: spacing.s1 },
  fieldLabel: {
    fontSize: 9, color: colors.ink3,
    letterSpacing: 1.2, fontFamily: 'JetBrainsMono',
    textTransform: 'uppercase',
  },
  underInput: {
    borderBottomWidth: 1, borderBottomColor: colors.lineStrong,
    backgroundColor: 'transparent',
    paddingVertical: 6,
    fontSize: 18,
    fontFamily: 'InstrumentSerif_Italic',
    color: colors.ink,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.s1 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: radii.pill, borderWidth: 1,
  },
  chipText: { fontSize: 12 },
  colorRow: { flexDirection: 'row', gap: spacing.s2, marginTop: spacing.s1 },
  colorDot: {
    width: 26, height: 26, borderRadius: radii.pill,
    borderWidth: 1.5, borderColor: colors.line,
  },
  colorDotActive: { borderWidth: 2, borderColor: colors.ink },
  colorSparkleWrap: { position: 'absolute', top: -6, right: -6 },
  noteCard: {
    marginTop: spacing.s3,
    padding: spacing.s3,
    backgroundColor: colors.sakuraSoft,
    borderWidth: 1, borderColor: colors.sakura, borderStyle: 'dashed',
    borderRadius: radii.r3,
    position: 'relative',
  },
  noteHeart: { position: 'absolute', top: -5, left: 12 },
  noteText: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 12, color: colors.sakuraInk,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.s6,
    paddingBottom: spacing.s3,
    gap: spacing.s3,
    backgroundColor: colors.paper,
  },
  primaryBtn: {
    height: 48, backgroundColor: colors.sakuraDeep,
    borderRadius: radii.pill,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.md,
  },
  primaryBtnText: { color: colors.vellum, fontSize: 15, fontWeight: '600' },
  skipBtn: { alignItems: 'center' },
  skipText: { color: colors.ink3, fontSize: 13, textDecorationLine: 'underline' },
});
