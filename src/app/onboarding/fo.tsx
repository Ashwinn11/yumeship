import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WashiTape } from '@/components/deco/WashiTape';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { GradientCover } from '@/components/ui/GradientCover';
import { IconPlus } from '@/components/ui/Icon';
import { StepDots } from '@/components/ui/StepDots';
import { UnderInput } from '@/components/ui/UnderInput';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { setOnbField } from '@/store/onboarding';

export default function OnbFO() {
  const insets = useSafeAreaInsets();
  const [foName, setFoName] = useState('');
  const [fandom, setFandom] = useState('');

  const handleFoName = (v: string) => { setFoName(v); setOnbField('foName', v); };
  const handleFandom = (v: string) => { setFandom(v); setOnbField('fandom', v); };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.dotsRow}>
        <StepDots step={2} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>step two · them</Text>
        <Text style={styles.heading}>Who's the one?</Text>
        <Text style={styles.sub}>
          The first F/O. You can add more later — even a whole polycule if you want.
        </Text>

        {/* Cover placeholder */}
        <GradientCover
          gradStart="#f3b6c4"
          gradEnd="#6b3d5b"
          style={styles.coverArea}
        >
          <View style={styles.coverTape}>
            <WashiTape width={80} height={16} pattern="heart" color="rgba(255,255,255,0.9)" rotate={-5} />
          </View>
          <View style={styles.coverAvatar}>
            <IconPlus size={28} color="rgba(255,255,255,0.9)" />
          </View>
        </GradientCover>

        {/* Fields */}
        <View style={styles.card}>
          <Field label="Their name">
            <UnderInput value={foName} onChangeText={handleFoName} />
          </Field>

          <View style={styles.fieldSpacer} />

          <Field label="From (fandom / source)">
            <UnderInput value={fandom} onChangeText={handleFandom} />
          </Field>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={() => router.push('/onboarding/rules')}
        >
          continue · the rules
        </Button>
        <Pressable onPress={() => router.push('/onboarding/rules')} style={styles.skipPressable}>
          <Text style={styles.skip}>add later</Text>
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
    fontFamily: FontFamily.marker,
    fontSize: 10,
    color: Colors.plum,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heading: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 32,
    lineHeight: 34,
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
  coverArea: {
    marginTop: Spacing.s5,
    borderRadius: Radius.r4,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.s2,
  },
  coverTape: {
    position: 'absolute',
    top: 12,
    left: 14,
  },
  coverAvatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginTop: Spacing.s4,
    padding: Spacing.s4,
    paddingHorizontal: Spacing.s4,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r4,
  },
  fieldSpacer: {
    height: 14,
  },
  nicknameBox: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r2,
    backgroundColor: Colors.paperSoft,
  },
  nicknameText: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.body,
    color: Colors.sakuraInk,
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
