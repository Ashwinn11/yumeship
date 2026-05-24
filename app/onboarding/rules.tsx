import React, { useState } from 'react';
import {
  View, Text, Pressable,
  ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Sparkle } from '@/deco';

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

const REL_TYPES = [
  { ja: '恋', name: 'romantic', tint: colors.sakuraDeep, bg: colors.sakuraSoft },
  { ja: '友', name: 'platonic', tint: colors.sageDeep, bg: colors.sageSoft },
  { ja: '家', name: 'familial', tint: colors.peachDeep, bg: colors.peachSoft },
];

const SHARE_TYPES = [
  { ja: '禁', name: 'sharing NG', tint: colors.ember, bg: '#fde0d4' },
  { ja: '可', name: 'welcome', tint: colors.sageDeep, bg: colors.sageSoft },
  { ja: '鏡', name: 'mirror', tint: colors.lavenderDeep, bg: colors.lavenderSoft },
];

function PickerOption({
  ja, name, tint, bg, active, onPress,
}: {
  ja: string; name: string; tint: string; bg: string;
  active: boolean; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <View style={[
        styles.pickerOpt,
        { backgroundColor: active ? bg : colors.vellum, borderColor: active ? tint : colors.line, borderWidth: active ? 1.5 : 1 },
      ]}>
        {active && (
          <View style={styles.pickerSparkle}>
            <Sparkle size={10} color={tint} />
          </View>
        )}
        <Text style={[styles.pickerJa, { color: tint }]}>{ja}</Text>
        <Text style={[styles.pickerName, { color: active ? tint : colors.ink2, fontWeight: active ? '600' : '500' }]}>
          {name}
        </Text>
      </View>
    </Pressable>
  );
}

export default function Rules() {
  const [relType, setRelType] = useState(0);
  const [shareType, setShareType] = useState(2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <StepDots step={3} />

        <View style={styles.header}>
          <Text style={styles.step}>✶ step three · the rules</Text>
          <Text style={styles.heading}>What kind of love,{'\n'}and who's invited?</Text>
        </View>

        {/* Relationship type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Relationship type</Text>
          <View style={styles.pickerRow}>
            {REL_TYPES.map((t, i) => (
              <PickerOption key={t.name} {...t} active={relType === i} onPress={() => setRelType(i)} />
            ))}
          </View>
        </View>

        {/* Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sharing — about doubles</Text>
          <View style={styles.pickerRow}>
            {SHARE_TYPES.map((t, i) => (
              <PickerOption key={t.name} {...t} active={shareType === i} onPress={() => setShareType(i)} />
            ))}
          </View>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <Text style={{ color: colors.lavenderDeep, fontSize: 14 }}>🔒</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.privacyTitle}>Private by default</Text>
            <Text style={styles.privacyBody}>
              Nothing leaves your phone. Notifications never reveal the app on your lock screen.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => router.push('/onboarding/scenario' as any)} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>continue · the first scene ›</Text>
        </Pressable>
        <Pressable style={styles.skipBtn}>
          <Text style={styles.skipText}>skip for now</Text>
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
    fontSize: 10, color: colors.sageDeep,
    letterSpacing: 1.6, fontFamily: 'JetBrainsMono', fontWeight: '600',
    textTransform: 'uppercase', marginBottom: spacing.s2,
  },
  heading: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 28, lineHeight: 30,
    letterSpacing: -0.3, color: colors.ink,
  },
  section: { marginBottom: spacing.s5 },
  sectionLabel: {
    fontSize: 9, color: colors.ink3, letterSpacing: 1.2,
    fontFamily: 'JetBrainsMono', textTransform: 'uppercase',
    marginBottom: spacing.s2,
  },
  pickerRow: { flexDirection: 'row', gap: spacing.s2 },
  pickerOpt: {
    paddingVertical: spacing.s2 + 2, paddingHorizontal: spacing.s1,
    borderRadius: radii.r3,
    alignItems: 'center', gap: spacing.s1,
    position: 'relative',
  },
  pickerSparkle: { position: 'absolute', top: -5, right: -3 },
  pickerJa: {
    fontFamily: 'KleeOne',
    fontSize: 18, fontWeight: '600',
  },
  pickerName: { fontSize: 10, letterSpacing: 0.2 },
  privacyCard: {
    flexDirection: 'row', gap: spacing.s3,
    padding: spacing.s3,
    backgroundColor: colors.vellum,
    borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.r3,
    alignItems: 'flex-start',
  },
  privacyIcon: {
    width: 28, height: 28, borderRadius: radii.r2,
    backgroundColor: colors.lavenderSoft,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  privacyTitle: {
    fontSize: 12, fontWeight: '600', color: colors.ink,
    marginBottom: 2,
  },
  privacyBody: { fontSize: 11, color: colors.ink2, lineHeight: 17 },
  footer: {
    paddingHorizontal: spacing.s6, paddingBottom: spacing.s3,
    gap: spacing.s3, backgroundColor: colors.paper,
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
