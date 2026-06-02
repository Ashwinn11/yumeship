import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Cloud } from '@/components/deco/Cloud';
import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco/Sparkle';
import { StickerSakuraBranch } from '@/components/deco';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Row } from '@/components/ui/Row';
import { StepDots } from '@/components/ui/StepDots';
import { UnderInput } from '@/components/ui/UnderInput';
import { CalloutBubble } from '@/components/ui';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { setOnbField } from '@/store/onboarding';

const PRONOUNS = ['she/her', 'he/him', 'they/them', '+'];
const COLOR_OPTIONS = [
  Colors.sakura,
  Colors.lavender,
  Colors.sage,
  Colors.peach,
  Colors.butter,
  Colors.plum,
];

export default function OnbPersona() {
  const insets = useSafeAreaInsets();
  const { scrollFill, column } = useIPad();
  const [name, setName] = useState('');
  const [pronoun, setPronoun] = useState('she/her');

  const handleNameChange = (v: string) => { setName(v); setOnbField('userName', v); };
  const handlePronounChange = (p: string) => { setPronoun(p); setOnbField('pronouns', p); };
  const [colorIdx, setColorIdx] = useState(0);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.dotsRow}>
        <StepDots step={2} total={5} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, scrollFill]} showsVerticalScrollIndicator={false}>
        <View style={[column, { position: 'relative' }]}>
          <View style={styles.decoTR} pointerEvents="none">
            <StickerSakuraBranch size={60} />
          </View>
          <View style={styles.decoBL} pointerEvents="none">
            <Sparkle size={18} color={Colors.lavenderDeep} />
          </View>
        <Text style={styles.eyebrow}>step three · you</Text>
        <Text style={styles.heading}>Who are you,{'\n'}in their world?</Text>

        {/* Persona card */}
        <View style={styles.card}>
          <Field label="Your name (or theirs for you)">
            <UnderInput value={name} onChangeText={handleNameChange} />
          </Field>

          <View style={styles.fieldSpacer} />

          <Field label="Pronouns">
            <Row gap={6} wrap>
              {PRONOUNS.map((p) => (
                <Chip
                  key={p}
                  color={pronoun === p ? Colors.sakuraDeep : Colors.ink2}
                  bg={pronoun === p ? Colors.sakuraSoft : Colors.paperDeep}
                  active={pronoun === p}
                  onPress={() => handlePronounChange(p)}
                >
                  {p}
                </Chip>
              ))}
            </Row>
          </Field>

          <View style={styles.fieldSpacer} />

          <Field label="A color that feels like you">
            <Row gap={8}>
              {COLOR_OPTIONS.map((c, i) => (
                <Pressable
                  key={i}
                  onPress={() => setColorIdx(i)}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: c,
                      borderWidth: colorIdx === i ? 2 : 1.5,
                      borderColor: colorIdx === i ? Colors.ink : Colors.line,
                    },
                  ]}
                >
                  {colorIdx === i && (
                    <View style={styles.swatchSparkle}>
                      <Sparkle size={9} color={Colors.sakuraDeep} />
                    </View>
                  )}
                </Pressable>
              ))}
            </Row>
          </Field>
        </View>

        {/* Reassurance note */}
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <CalloutBubble tone="pink">
            a self-insert is{'\n'}you in their story.{'\n'}no wrong way.
          </CalloutBubble>
        </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, column]}>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={name.trim().length === 0}
          onPress={() => router.push('/onboarding/fo')}
        >
          {!name.trim() ? 'enter your name first' : 'continue · meet them'}
        </Button>
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
    fontFamily: FontFamily.marker,
    fontSize: 10,
    color: Colors.sakuraDeep,
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
  card: {
    marginTop: Spacing.s5,
    padding: Spacing.s5,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r4,
    ...Shadow.s1,
  },
  fieldSpacer: {
    height: 14,
  },
  colorSwatch: {
    width: 26,
    height: 26,
    borderRadius: Radius.pill,
    position: 'relative',
  },
  swatchSparkle: {
    position: 'absolute',
    top: -6,
    left: -6,
  },
  note: {
    marginTop: Spacing.s4,
    padding: Spacing.s3,
    paddingHorizontal: Spacing.s4,
    backgroundColor: Colors.sakuraSoft,
    borderWidth: 1,
    borderColor: Colors.sakura,
    borderRadius: Radius.r3,
    position: 'relative',
  },
  noteHeart: {
    position: 'absolute',
    top: -6,
    left: 12,
  },
  noteText: {
    fontFamily: FontFamily.script,
    fontSize: FontSize.h6,
    color: Colors.sakuraInk,
    lineHeight: 18,
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
  decoTR: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  decoBL: {
    position: 'absolute',
    bottom: 140,
    left: 24,
  },
});
