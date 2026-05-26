import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StepDots } from '@/components/ui/StepDots';
import { Button } from '@/components/ui/Button';
import { Heart } from '@/components/deco/Heart';
import { WashiTape } from '@/components/deco/WashiTape';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const PROMPTS: { ja: string; label: string }[] = [
  { ja: '雨', label: 'rainy day' },
  { ja: '夜', label: 'late call' },
  { ja: '朝', label: 'morning after' },
  { ja: '初', label: 'first meeting' },
];

export default function OnbScenario() {
  const insets = useSafeAreaInsets();
  const [scene, setScene] = useState('');

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.dotsRow}>
        <StepDots step={4} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>step four · the first scene</Text>
        <Text style={styles.heading}>The first time{'\n'}you saw them.</Text>
        <Text style={styles.sub}>
          Just a few sentences. You can come back. Or pick from a prompt.
        </Text>

        {/* Writing surface */}
        <View style={styles.surface}>
          <View style={styles.surfaceTape}>
            <WashiTape width={56} height={14} pattern="heart" color={Colors.sakuraDeep} rotate={-6} />
          </View>

          <Text style={styles.sceneLabel}>scene 01</Text>

          <TextInput
            value={scene}
            onChangeText={setScene}
            placeholder="the first time you saw them…"
            placeholderTextColor={Colors.ink3}
            multiline
            textAlignVertical="top"
            style={styles.sceneInput}
          />
        </View>

        {/* Prompt chips */}
        <View style={styles.promptSection}>
          <Text style={styles.promptLabel}>or pick a prompt</Text>
          <View style={styles.promptRow}>
            {PROMPTS.map((p) => (
              <Pressable key={p.ja} style={styles.promptChip}>
                <Text style={styles.promptJa}>{p.ja}</Text>
                <Text style={styles.promptLabel2}>{p.label}</Text>
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
          onPress={() => router.replace('/(tabs)')}
          icon={<Heart size={14} color={Colors.vellum} />}
          iconPosition="right"
        >
          finish · keep them close
        </Button>
        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.skipPressable}>
          <Text style={styles.skip}>save & finish later</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  dotsRow: {
    paddingHorizontal: Spacing.s6,
    paddingTop: Spacing.s4,
    paddingBottom: Spacing.s1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.s6,
    paddingTop: Spacing.s6,
    paddingBottom: Spacing.s4,
  },
  eyebrow: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: Colors.lavenderDeep,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heading: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 30,
    lineHeight: 33,
    letterSpacing: -0.3,
    color: Colors.ink,
    marginTop: Spacing.s2,
  },
  sub: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.meta,
    color: Colors.ink2,
    lineHeight: 20,
    marginTop: Spacing.s2,
  },
  surface: {
    marginTop: Spacing.s4,
    padding: Spacing.s4,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r4,
    minHeight: 220,
    position: 'relative',
  },
  surfaceTape: {
    position: 'absolute',
    top: -8,
    left: 16,
  },
  sceneLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.ink3,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: Spacing.s2,
  },
  sceneInput: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.h6,
    lineHeight: 27,
    color: Colors.ink,
    marginTop: Spacing.s2,
    minHeight: 140,
    padding: 0,
  },
  promptSection: {
    marginTop: Spacing.s4,
  },
  promptLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.ink3,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  promptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: Colors.paperDeep,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.pill,
  },
  promptJa: {
    fontFamily: FontFamily.jaSemiBold,
    fontSize: 11,
    color: Colors.sakuraDeep,
    fontWeight: '600',
  },
  promptLabel2: {
    fontSize: 11,
    fontFamily: FontFamily.ui,
    color: Colors.ink2,
  },
  actions: {
    paddingHorizontal: Spacing.s6,
    paddingBottom: Spacing.s3,
    gap: Spacing.s2,
  },
  skipPressable: {
    alignItems: 'center',
  },
  skip: {
    fontFamily: FontFamily.ui,
    fontSize: FontSize.meta,
    color: Colors.ink3,
    textDecorationLine: 'underline',
  },
});
