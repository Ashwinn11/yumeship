import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WashiTape } from '@/components/deco/WashiTape';
import { Heart } from '@/components/deco/Heart';
import { Button } from '@/components/ui/Button';
import { StepDots } from '@/components/ui/StepDots';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { getOnbState, resetOnb } from '@/store/onboarding';
import { addScenario } from '@/store/scenarios';
import { addShip, REL_GRADS } from '@/store/ships';

const PROMPTS = [
  { ja: '雨', label: 'rainy day' },
  { ja: '夜', label: 'late call' },
  { ja: '朝', label: 'morning after' },
  { ja: '初', label: 'first meeting' },
];

const TAPE_BY_REL: Record<string, { color: string; pattern: 'stripe' | 'dot' | 'heart' | 'check' }> = {
  romantic: { color: 'rgba(255,255,255,0.9)', pattern: 'heart' },
  platonic: { color: 'rgba(255,255,255,0.8)', pattern: 'dot' },
  familial: { color: 'rgba(255,255,255,0.8)', pattern: 'stripe' },
};

export default function OnbScene() {
  const insets = useSafeAreaInsets();
  const [sceneText, setSceneText] = useState('');
  const [title, setTitle] = useState('the first time');

  function finish() {
    const state = getOnbState();
    const relType = (state.relType || 'romantic') as 'romantic' | 'platonic' | 'familial';
    const grad = REL_GRADS[relType] ?? REL_GRADS.romantic;
    const tape = TAPE_BY_REL[relType] ?? TAPE_BY_REL.romantic;

    const shipId = addShip({
      name: state.foName || 'untitled',
      fandom: state.fandom,
      relType,
      shareType: state.shareType,
      nickname: state.nickname ?? '',
      gradStart: grad[0],
      gradEnd: grad[1],
      tapePattern: tape.pattern,
      tapeColor: tape.color,
    });

    if (sceneText.trim()) {
      addScenario(shipId, title, sceneText.trim());
    }

    resetOnb();
    router.replace({ pathname: '/(tabs)' });
  }

  function skipAndFinish() {
    const state = getOnbState();
    const relType = (state.relType || 'romantic') as 'romantic' | 'platonic' | 'familial';
    const grad = REL_GRADS[relType] ?? REL_GRADS.romantic;
    const tape = TAPE_BY_REL[relType] ?? TAPE_BY_REL.romantic;

    const shipId = addShip({
      name: state.foName || 'untitled',
      fandom: state.fandom,
      relType,
      shareType: state.shareType,
      gradStart: grad[0],
      gradEnd: grad[1],
      tapePattern: tape.pattern,
      tapeColor: tape.color,
    });
    resetOnb();
    router.replace({ pathname: '/ship/[id]', params: { id: shipId } });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.dotsRow}>
        <StepDots step={4} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>step four · the first scene</Text>
        <Text style={styles.heading}>The first time{'\n'}you saw them.</Text>
        <Text style={styles.sub}>Just a few sentences. You can come back. Or pick from a prompt.</Text>

        <View style={styles.sceneBox}>
          <View style={styles.sceneTape}>
            <WashiTape width={56} height={14} pattern="heart" color={Colors.sakuraDeep} rotate={-6} />
          </View>
          <Text style={styles.sceneLabel}>scene 01</Text>
          <TextInput
            value={sceneText}
            onChangeText={setSceneText}
            placeholder='"the first cutscene. she said my name—"'
            placeholderTextColor={Colors.ink3}
            multiline
            style={styles.sceneInput}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.promptSection}>
          <Text style={styles.promptLabel}>or pick a prompt</Text>
          <View style={styles.promptRow}>
            {PROMPTS.map((p) => (
              <Pressable
                key={p.ja}
                style={styles.promptChip}
                onPress={() => setTitle(p.label)}
              >
                <Text style={[styles.promptJa, title === p.label && styles.promptJaActive]}>{p.ja}</Text>
                <Text style={styles.promptText}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={finish}
          icon={<Heart size={14} color={Colors.vellum} />}
          iconPosition="right"
        >
          finish · keep them close
        </Button>
        <Pressable onPress={skipAndFinish} style={styles.skipPressable}>
          <Text style={styles.skip}>save & go to their profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  dotsRow: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s4, paddingBottom: Spacing.s1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6, paddingBottom: Spacing.s4 },
  eyebrow: {
    fontFamily: FontFamily.marker, fontSize: 10, color: Colors.lavenderDeep,
    letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: '600',
  },
  heading: { fontFamily: FontFamily.displayItalic, fontSize: 30, lineHeight: 33, letterSpacing: -0.3, color: Colors.ink, marginTop: Spacing.s2 },
  sub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink2, lineHeight: 20, marginTop: Spacing.s2 },
  sceneBox: {
    marginTop: Spacing.s4, padding: Spacing.s4, paddingTop: 24,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4, minHeight: 220, position: 'relative', ...Shadow.s1,
  },
  sceneTape: { position: 'absolute', top: -8, left: 16 },
  sceneLabel: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase' },
  sceneInput: {
    marginTop: 8, fontFamily: FontFamily.displayItalic, fontSize: 18,
    lineHeight: 27, color: Colors.ink, minHeight: 160,
  },
  promptSection: { marginTop: Spacing.s4 },
  promptLabel: { fontFamily: FontFamily.marker, fontSize: 9, color: Colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase' },
  promptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  promptChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 10,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.pill,
  },
  promptJa: { fontFamily: FontFamily.ja, fontSize: 11, color: Colors.sakuraDeep, fontWeight: '600' },
  promptJaActive: { color: Colors.plum },
  promptText: { fontFamily: FontFamily.ui, fontSize: 11, color: Colors.ink2 },
  actions: { paddingHorizontal: Spacing.s6, paddingBottom: Spacing.s3, gap: Spacing.s2 },
  skipPressable: { alignItems: 'center' },
  skip: { fontFamily: FontFamily.ui, fontSize: FontSize.meta, color: Colors.ink3, textDecorationLine: 'underline' },
});
