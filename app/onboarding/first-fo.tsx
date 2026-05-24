import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { WashiTape } from '@/deco';

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

export default function FirstFO() {
  const [name, setName] = useState('');
  const [fandom, setFandom] = useState('');
  const [nickname, setNickname] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <StepDots step={2} />

        <View style={styles.header}>
          <Text style={styles.step}>♡ step two · them</Text>
          <Text style={styles.heading}>Who's the one?</Text>
          <Text style={styles.sub}>
            The first F/O. You can add more later — even a whole polycule if you want.
          </Text>
        </View>

        {/* Cover area */}
        <View style={styles.cover}>
          <View style={styles.coverStripe} />
          <View style={styles.coverCircle}>
            <Text style={styles.coverPlus}>＋</Text>
          </View>
          <View style={styles.washiWrap}>
            <WashiTape width={80} height={16} pattern="heart" color={colors.vellum} rotate={-5} />
          </View>
        </View>

        {/* Fields */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Their name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Kafka"
              placeholderTextColor={colors.ink3}
              style={styles.underInput}
            />
          </View>

          <View style={[styles.fieldGroup, { marginTop: spacing.s3 }]}>
            <Text style={styles.fieldLabel}>From</Text>
            <TextInput
              value={fandom}
              onChangeText={setFandom}
              placeholder="Honkai Star Rail"
              placeholderTextColor={colors.ink3}
              style={styles.underInput}
            />
          </View>

          <View style={[styles.fieldGroup, { marginTop: spacing.s3 }]}>
            <Text style={styles.fieldLabel}>What you call them, when no one's listening</Text>
            <View style={styles.nicknameBox}>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder='"my whole problem"'
                placeholderTextColor={colors.sakuraInk}
                style={styles.nicknameInput}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => router.push('/onboarding/rules' as any)} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>continue · the rules ›</Text>
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
    fontSize: 10, color: colors.plum,
    letterSpacing: 1.6, fontFamily: 'JetBrainsMono', fontWeight: '600',
    textTransform: 'uppercase', marginBottom: spacing.s2,
  },
  heading: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 32, lineHeight: 34,
    letterSpacing: -0.3, color: colors.ink,
    marginBottom: spacing.s2,
  },
  sub: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 13, lineHeight: 20,
    color: colors.ink2,
  },
  cover: {
    height: 140,
    borderRadius: radii.r4,
    backgroundColor: colors.sakura,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.s3,
    ...shadows.md,
  },
  coverStripe: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
    backgroundColor: colors.plum,
  },
  coverCircle: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: [{ translateX: -36 }, { translateY: -36 }],
    width: 72, height: 72,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  coverPlus: {
    fontSize: 28, color: 'rgba(255,255,255,0.9)',
  },
  washiWrap: { position: 'absolute', top: 12, left: 14 },
  card: {
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.r4,
    padding: spacing.s4,
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
  nicknameBox: {
    padding: spacing.s2 + 2,
    borderRadius: radii.r2,
    borderWidth: 1, borderColor: colors.line,
    backgroundColor: colors.paperSoft,
  },
  nicknameInput: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 15,
    color: colors.sakuraInk,
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
