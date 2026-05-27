import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sparkle } from '@/components/deco/Sparkle';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Mark } from '@/components/ui/Mark';
import { StepDots } from '@/components/ui/StepDots';
import { UnderInput } from '@/components/ui/UnderInput';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { resetOnb, setOnbField } from '@/store/onboarding';

export const COVER_PALETTES: { id: string; start: string; end: string }[] = [
  { id: 'sakura', start: '#f3b6c4', end: '#9b4f6e' },
  { id: 'plum', start: '#e0b0d8', end: '#6e2b5e' },
  { id: 'lavender', start: '#c9b8e8', end: '#6b4da3' },
  { id: 'sky', start: '#b8d4f0', end: '#3a6fa8' },
  { id: 'midnight', start: '#a0b0d0', end: '#1a2a4a' },
  { id: 'sage', start: '#b4cba5', end: '#4a7050' },
  { id: 'peach', start: '#f4c09a', end: '#c06840' },
  { id: 'gold', start: '#f0daa0', end: '#9b7c20' },
];

export default function OnbFO() {
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isNew = mode === 'new';

  const [foName, setFoName] = useState('');
  const [shipName, setShipName] = useState('');
  const [fandom, setFandom] = useState('');
  const [paletteId, setPaletteId] = useState('sakura');

  const handleFoName = (v: string) => { setFoName(v); setOnbField('foName', v); };
  const handleShipName = (v: string) => { setShipName(v); setOnbField('shipName', v); };
  const handleFandom = (v: string) => { setFandom(v); setOnbField('fandom', v); };

  function selectPalette(p: typeof COVER_PALETTES[0]) {
    setPaletteId(p.id);
    setOnbField('gradStart', p.start);
    setOnbField('gradEnd', p.end);
  }

  function goToRules() {
    router.push({ pathname: '/onboarding/rules', params: isNew ? { mode: 'new' } : {} });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      {isNew ? (
        <View style={styles.header}>
          <Pressable onPress={() => { resetOnb(); router.back(); }} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Mark size={22} />
            <Text style={styles.headerTitle}>new ship</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>
      ) : (
        <View style={styles.dotsRow}>
          <StepDots step={1} total={3} />
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!isNew && <Text style={styles.eyebrow}>step two · them</Text>}
        <Text style={[styles.heading, isNew && styles.headingNew]}>Who's the one?</Text>
        <Text style={styles.sub}>
          {isNew
            ? 'You can add more any time.'
            : 'The first F/O. You can add more later — even a whole polycule if you want.'}
        </Text>

        <View style={styles.card}>
          <Field label="Their name">
            <UnderInput value={foName} onChangeText={handleFoName} />
          </Field>

          <View style={styles.fieldSpacer} />

          <Field label="What do you call this pairing?">
            <UnderInput value={shipName} onChangeText={handleShipName} placeholder="e.g. Starlight" />
          </Field>

          <View style={styles.fieldSpacer} />

          <Field label="From">
            <UnderInput value={fandom} onChangeText={handleFandom} />
          </Field>

          <View style={styles.fieldSpacer} />

          <Field label="A color that feels like them">
            <View style={styles.paletteRow}>
              {COVER_PALETTES.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => selectPalette(p)}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: p.start,
                      borderWidth: paletteId === p.id ? 2 : 1.5,
                      borderColor: paletteId === p.id ? Colors.ink : Colors.line,
                    },
                  ]}
                >
                  {paletteId === p.id && (
                    <View style={styles.swatchSparkle}>
                      <Sparkle size={9} color={Colors.sakuraDeep} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </Field>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={foName.trim().length === 0 || shipName.trim().length === 0}
          onPress={goToRules}
        >
          {!foName.trim()
            ? 'enter their name first'
            : !shipName.trim()
              ? 'enter ship name first'
              : 'continue · the rules'}
        </Button>
        {!isNew && (
          <Pressable onPress={goToRules} style={styles.skipPressable}>
            <Text style={styles.skip}>add later</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  dotsRow: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s4, paddingBottom: Spacing.s1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 12, color: Colors.ink2, fontFamily: FontFamily.ui },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6, paddingBottom: Spacing.s4 },
  eyebrow: {
    fontFamily: FontFamily.marker, fontSize: 10, color: Colors.plum,
    letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: '600',
  },
  heading: {
    fontFamily: FontFamily.displayItalic, fontSize: 32, lineHeight: 34,
    letterSpacing: -0.3, color: Colors.ink, marginTop: Spacing.s2,
  },
  headingNew: { marginTop: 0 },
  sub: {
    fontFamily: FontFamily.script, fontSize: FontSize.h6,
    color: Colors.ink2, lineHeight: 20, marginTop: Spacing.s2,
  },
  card: {
    marginTop: Spacing.s4, padding: Spacing.s4,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r4,
  },
  fieldSpacer: { height: 14 },
  paletteRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  swatch: {
    width: 26, height: 26, borderRadius: Radius.pill,
    position: 'relative',
  },
  swatchSparkle: { position: 'absolute', top: -6, left: -6 },
  actions: { paddingHorizontal: Spacing.s6, paddingBottom: Spacing.s3, gap: Spacing.s2 },
  skipPressable: { alignItems: 'center' },
  skip: { fontFamily: FontFamily.ui, fontSize: FontSize.meta, color: Colors.ink3, textDecorationLine: 'underline' },
});
