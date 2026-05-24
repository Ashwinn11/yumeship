import React, { useState } from 'react';
import { View, Text, TextInput, Pressable,
  ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, shadows } from '@/tokens/theme';
import { Heart, Sparkle } from '@/deco';
import { Icons } from '@/components';

const TEMPLATE_FIELDS: Record<string, { label: string; placeholder: string; multi?: boolean }[]> = {
  intro: [
    { label: 'Their name',       placeholder: 'what do they call themselves?' },
    { label: 'Fandom',           placeholder: 'what universe do they come from?' },
    { label: 'First impression', placeholder: 'how did you feel when you saw them?' },
    { label: 'Why I love them',  placeholder: 'three things, at minimum', multi: true },
    { label: 'One thing only I know', placeholder: 'a headcanon, a detail, a gut feeling', multi: true },
  ],
  infodump: [
    { label: 'Full name',        placeholder: '' },
    { label: 'Fandom / canon',   placeholder: '' },
    { label: 'Personality',      placeholder: 'what makes them them?', multi: true },
    { label: 'Appearance',       placeholder: 'what do they look like up close?', multi: true },
    { label: 'Voice / mannerisms', placeholder: '' },
    { label: 'Their quirks',     placeholder: 'the small things', multi: true },
    { label: 'Favorites',        placeholder: 'food, music, colors, comfort things', multi: true },
    { label: 'Headcanon 1',      placeholder: '' },
    { label: 'Headcanon 2',      placeholder: '' },
  ],
  preference: [
    { label: 'Coffee or tea?',           placeholder: '' },
    { label: 'Morning or night?',        placeholder: '' },
    { label: 'Listener or talker?',      placeholder: '' },
    { label: 'Soft or intense?',         placeholder: '' },
    { label: 'Stay in or go out?',       placeholder: '' },
    { label: 'Plans or spontaneous?',    placeholder: '' },
    { label: 'Sweet or savory?',         placeholder: '' },
    { label: 'Text first or wait?',      placeholder: '' },
    { label: 'Big spoon or little spoon?', placeholder: '' },
    { label: 'Last one — your pair',     placeholder: 'make up your own', multi: true },
  ],
  headcanons: [
    { label: 'Personality (3–5)',  placeholder: 'one per line', multi: true },
    { label: 'Habits (3–5)',       placeholder: 'one per line', multi: true },
    { label: 'Favorites (3–5)',    placeholder: 'one per line', multi: true },
    { label: 'How we met',         placeholder: 'the scene', multi: true },
    { label: 'Random (3–5)',       placeholder: 'one per line', multi: true },
  ],
  qa: [
    { label: 'How did you find them?', placeholder: '' },
    { label: 'First impression',  placeholder: '' },
    { label: 'Relationship type', placeholder: 'romantic / platonic / etc.' },
    { label: 'Trope you two are', placeholder: '' },
    { label: 'Their love language', placeholder: '' },
    { label: 'Your love language with them', placeholder: '' },
    { label: 'A song for you two', placeholder: '' },
    { label: "One thing they'd say to you", placeholder: '' },
    { label: "One thing you'd say to them", placeholder: '', multi: true },
    { label: 'Why them?',         placeholder: 'the real answer', multi: true },
  ],
  letter: [
    { label: 'Opening line',      placeholder: 'dear —' },
    { label: 'A memory I return to', placeholder: '', multi: true },
    { label: 'What you mean to me', placeholder: '', multi: true },
    { label: 'Thing 1 I love about you', placeholder: '' },
    { label: 'Thing 2 I love about you', placeholder: '' },
    { label: 'Thing 3 I love about you', placeholder: '' },
    { label: 'Closing',           placeholder: 'with love —' },
  ],
  gratitude: Array.from({ length: 30 }, (_, i) => ({
    label: `Day ${i + 1}`,
    placeholder: 'one thing, big or small',
  })),
  milestone: [
    { label: 'The occasion',      placeholder: 'what are you celebrating?' },
    { label: 'How long',          placeholder: '' },
    { label: 'Best memory',       placeholder: '', multi: true },
    { label: "What I've learned", placeholder: '', multi: true },
    { label: 'A promise',         placeholder: '', multi: true },
    { label: 'Next chapter',      placeholder: 'what comes after', multi: true },
  ],
  polycule: [
    { label: 'Polycule name',     placeholder: 'what do you call yourselves?' },
    { label: 'Members',           placeholder: 'names + fandoms', multi: true },
    { label: 'Group dynamic',     placeholder: 'the energy between you all', multi: true },
    { label: 'A defining moment', placeholder: '', multi: true },
  ],
};

const TEMPLATE_META: Record<string, { title: string; tint: string; ja: string; quote: string }> = {
  intro:      { title: 'Meet My F/O',    tint: colors.sakuraDeep,   ja: '紹介', quote: 'Introduce them.' },
  infodump:   { title: 'F/O Infodump',   tint: colors.lavenderDeep, ja: '詳細', quote: 'Every detail matters.' },
  preference: { title: 'This or That',   tint: colors.butterDeep,   ja: '選択', quote: 'Reveal who they are.' },
  headcanons: { title: 'Headcanons List', tint: colors.peachDeep,   ja: '妄想', quote: 'Your imagination, organized.' },
  qa:         { title: 'Selfship Q&A',   tint: colors.sageDeep,     ja: '問答', quote: 'The questions that matter.' },
  letter:     { title: "Valentine's",    tint: colors.sakuraDeep,   ja: '愛',   quote: 'Write the love letter.' },
  gratitude:  { title: 'F/Ovember',      tint: colors.butterDeep,   ja: '感謝', quote: '30 days, 30 gratitudes.' },
  milestone:  { title: 'Milestone',      tint: colors.peachDeep,    ja: '節目', quote: 'Celebrate every chapter.' },
  polycule:   { title: 'Polycule Intro', tint: colors.plum,         ja: '群',   quote: 'The whole constellation.' },
};

export default function TemplateFiller() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const fields = TEMPLATE_FIELDS[type] ?? TEMPLATE_FIELDS.intro;
  const meta   = TEMPLATE_META[type] ?? TEMPLATE_META.intro;

  const [values, setValues] = useState<Record<number, string>>({});
  const filled = Object.keys(values).filter((k) => values[Number(k)]).length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerKind, { color: meta.tint }]}>{type}</Text>
          <Text style={styles.headerTitle}>{meta.title}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress bar */}
        <View style={styles.progressRow}>
          {fields.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: i < filled ? meta.tint : colors.paperDeep },
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          {filled} of {fields.length} — {filled === fields.length ? 'complete ♡' : 'keep going'}
        </Text>

        {/* Card surface */}
        <View style={[styles.card, { borderColor: meta.tint + '40' }]}>
          {/* Watermark */}
          <Text style={[styles.watermark, { color: meta.tint }]}>{meta.ja}</Text>

          {/* Title row */}
          <View style={styles.cardHeader}>
            <Heart size={14} color={meta.tint} />
            <Text style={[styles.cardKind, { color: meta.tint }]}>{type}</Text>
          </View>
          <Text style={styles.cardHeading}>{meta.quote}</Text>

          {/* Fields */}
          <View style={styles.fields}>
            {fields.map((f, i) => (
              <View key={i} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  value={values[i] ?? ''}
                  onChangeText={(t) => setValues((v) => ({ ...v, [i]: t }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.ink3}
                  multiline={f.multi}
                  style={[styles.fieldInput, f.multi && styles.fieldMulti]}
                  textAlignVertical={f.multi ? 'top' : 'center'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteHeart}>
            <Heart size={12} color={meta.tint} />
          </View>
          <Text style={[styles.noteText, { color: meta.tint }]}>
            "Take your time. The blank ones leave room for them to surprise you."
          </Text>
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View style={styles.footer}>
        <Pressable style={[styles.primaryBtn, { backgroundColor: meta.tint }]}>
          <Text style={styles.primaryBtnText}>save card to photos</Text>
        </Pressable>
        <Pressable style={styles.ghostBtn}>
          <Text style={styles.ghostBtnText}>save draft</Text>
        </Pressable>
      </View>
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
  back: { width: 36, alignItems: 'flex-start' },
  backText: { fontSize: 22, color: colors.ink2, lineHeight: 26 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerKind: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '600',
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 18, lineHeight: 20, color: colors.ink,
  },
  headerSpacer: { width: 36 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.s4, paddingTop: spacing.s3, paddingBottom: spacing.s6 },

  progressRow: { flexDirection: 'row', gap: 3, flexWrap: 'wrap', marginBottom: spacing.s1 },
  progressDot: { flex: 1, minWidth: 4, maxWidth: 24, height: 4, borderRadius: radii.pill },
  progressText: {
    fontFamily: 'JetBrainsMono',
    fontSize: 10, color: colors.ink3, letterSpacing: 1, marginBottom: spacing.s3,
  },

  card: {
    backgroundColor: colors.vellum,
    borderWidth: 1,
    borderRadius: radii.r4,
    padding: spacing.s5,
    position: 'relative', overflow: 'hidden',
    marginBottom: spacing.s3,
    ...shadows.sm,
  },
  watermark: {
    position: 'absolute', right: -8, top: -14,
    fontSize: 96, lineHeight: 96,
    fontFamily: 'KleeOne', fontWeight: '600',
    opacity: 0.07,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2, marginBottom: spacing.s2 },
  cardKind: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '600',
  },
  cardHeading: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 24, lineHeight: 26, letterSpacing: -0.2, color: colors.ink,
    marginBottom: spacing.s4,
  },

  fields: { gap: spacing.s4 },
  fieldRow: { gap: spacing.s1 },
  fieldLabel: {
    fontFamily: 'JetBrainsMono',
    fontSize: 9, color: colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase',
  },
  fieldInput: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 18, color: colors.ink,
    borderBottomWidth: 1, borderBottomColor: colors.lineStrong,
    paddingVertical: spacing.s1,
    backgroundColor: 'transparent',
  },
  fieldMulti: { minHeight: 64, lineHeight: 26 },

  noteCard: {
    padding: spacing.s3,
    backgroundColor: colors.paperDeep,
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line,
    borderRadius: radii.r3,
    position: 'relative',
    marginBottom: spacing.s4,
  },
  noteHeart: { position: 'absolute', top: -7, left: 12 },
  noteText: {
    fontFamily: 'InstrumentSerif_Italic',
    fontSize: 12, lineHeight: 18,
    marginTop: spacing.s1,
  },

  footer: {
    paddingHorizontal: spacing.s4, paddingBottom: spacing.s5,
    gap: spacing.s2, backgroundColor: colors.paper,
  },
  primaryBtn: {
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.md,
  },
  primaryBtnText: { color: colors.vellum, fontSize: 15, fontWeight: '600' },
  ghostBtn: { alignItems: 'center', paddingVertical: spacing.s2 },
  ghostBtnText: { color: colors.ink3, fontSize: 13, textDecorationLine: 'underline' },
});
