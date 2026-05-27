import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heart, Sparkle, StickerHeartPatch, StickerWaxSeal } from '@/components/deco';
import { Button } from '@/components/ui/Button';
import { CalloutBubble } from '@/components/ui/Callouts';
import { StepDots } from '@/components/ui/StepDots';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { setOnbField } from '@/store/onboarding';

const PAINS = [
  'i have ideas, but starting feels hard',
  'i overthink the exact words',
  'i want it to sound like them',
  'my headcanons get scattered everywhere',
  'i want somewhere private for this',
  'i want the ship to feel more real',
] as const;

export default function OnbPain() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>(['i have ideas, but starting feels hard']);

  const canContinue = selected.length > 0;
  const helper = useMemo(() => {
    if (selected.includes('i want somewhere private for this')) return 'private by default. this is your little corner.';
    if (selected.includes('i want it to sound like them')) return 'we will start with the feeling first, then the words.';
    return 'nothing has to be perfect before it can be saved.';
  }, [selected]);

  function togglePain(pain: string) {
    setSelected((current) => (
      current.includes(pain)
        ? current.filter((p) => p !== pain)
        : [...current, pain]
    ));
  }

  function continueFlow() {
    setOnbField('painPoints', selected);
    router.push('/onboarding/persona');
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.decoTR} pointerEvents="none">
        <StickerWaxSeal size={52} />
      </View>
      <View style={styles.decoBL} pointerEvents="none">
        <StickerHeartPatch size={44} />
      </View>

      <View style={styles.dotsRow}>
        <StepDots step={1} total={5} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>the stuck part</Text>
        <Text style={styles.heading}>What gets in{'\n'}the way?</Text>
        <Text style={styles.subcopy}>
          pick anything that feels a little too familiar.
        </Text>

        <View style={styles.list}>
          {PAINS.map((pain) => {
            const isActive = selected.includes(pain);
            return (
              <Pressable
                key={pain}
                onPress={() => togglePain(pain)}
                style={[styles.row, isActive && styles.rowActive]}
              >
                <View style={[styles.check, isActive && styles.checkActive]}>
                  {isActive && <Heart size={9} color={Colors.vellum} />}
                </View>
                <Text style={[styles.rowText, isActive && styles.rowTextActive]}>{pain}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.bubbleWrap}>
          <CalloutBubble tone="pink">{helper}</CalloutBubble>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={!canContinue}
          onPress={continueFlow}
          icon={<Sparkle size={13} color={Colors.vellum} />}
          iconPosition="right"
        >
          continue · make it yours
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  dotsRow: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s4, paddingBottom: Spacing.s1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6, paddingBottom: Spacing.s4 },
  eyebrow: {
    fontFamily: FontFamily.marker,
    fontSize: 10,
    color: Colors.plum,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heading: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 31,
    lineHeight: 33,
    color: Colors.ink,
    marginTop: Spacing.s2,
  },
  subcopy: { fontFamily: FontFamily.script, fontSize: 18, lineHeight: 22, color: Colors.ink2, marginTop: Spacing.s3 },
  list: { gap: Spacing.s3, marginTop: Spacing.s5 },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s3,
    paddingHorizontal: Spacing.s4,
    paddingVertical: Spacing.s3,
    backgroundColor: Colors.vellum,
    borderWidth: 1.3,
    borderColor: Colors.line,
    borderRadius: Radius.r3,
    ...Shadow.s1,
  },
  rowActive: { backgroundColor: Colors.sakuraSoft, borderColor: Colors.sakuraDeep },
  check: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    borderWidth: 1.4,
    borderColor: Colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.vellum,
  },
  checkActive: { backgroundColor: Colors.sakuraDeep, borderColor: Colors.sakuraDeep },
  rowText: { flex: 1, fontFamily: FontFamily.uiMedium, fontSize: FontSize.meta, lineHeight: 18, color: Colors.ink2 },
  rowTextActive: { color: Colors.sakuraInk },
  bubbleWrap: { marginTop: Spacing.s6, alignItems: 'center' },
  actions: { paddingHorizontal: Spacing.s6, paddingBottom: Spacing.s3 },
  decoTR: { position: 'absolute', top: 106, right: 22 },
  decoBL: { position: 'absolute', bottom: 134, left: 22 },
});
