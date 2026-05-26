import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field } from '@/components/ui/Field';
import { UnderInput } from '@/components/ui/UnderInput';
import { Button } from '@/components/ui/Button';
import { PickerOption } from '@/components/ui/PickerOption';
import { GradientCover } from '@/components/ui/GradientCover';
import { WashiTape } from '@/components/deco/WashiTape';
import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco/Sparkle';
import { IconPlus } from '@/components/ui/Icon';
import { type TemplateKey } from './index';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

type RelType = 'romantic' | 'platonic' | 'familial';

// Template → cover gradient map
const TEMPLATE_GRADS: Record<TemplateKey, [string, string]> = {
  'get-to-know':  ['#f3b6c4', '#d77a8d'],
  'kawaii-ui':    ['#c7b5e3', '#8b6fc4'],
  'heart-frame':  ['#fadde5', '#d77a8d'],
  'aesthetic':    ['#f0d189', '#b8902a'],
  'this-or-that': ['#b4c8a5', '#6e8762'],
  'boundaries':   ['#f4b89a', '#b76b48'],
  'love-letter':  ['#fadde5', '#6e3a5a'],
  'storyline':    ['#ece4f7', '#8b6fc4'],
  'headcanons':   ['#fbecc4', '#b8902a'],
};

const TEMPLATE_TAPE: Record<TemplateKey, { color: string; pattern: 'stripe' | 'dot' | 'heart' | 'check' | 'solid' }> = {
  'get-to-know':  { color: 'rgba(255,255,255,0.9)', pattern: 'heart' },
  'kawaii-ui':    { color: 'rgba(255,255,255,0.8)', pattern: 'dot' },
  'heart-frame':  { color: 'rgba(255,255,255,0.9)', pattern: 'heart' },
  'aesthetic':    { color: 'rgba(255,255,255,0.8)', pattern: 'check' },
  'this-or-that': { color: 'rgba(255,255,255,0.8)', pattern: 'dot' },
  'boundaries':   { color: 'rgba(255,255,255,0.8)', pattern: 'stripe' },
  'love-letter':  { color: 'rgba(255,255,255,0.9)', pattern: 'heart' },
  'storyline':    { color: 'rgba(255,255,255,0.8)', pattern: 'check' },
  'headcanons':   { color: 'rgba(255,255,255,0.8)', pattern: 'dot' },
};

export default function NewShipSetup() {
  const insets = useSafeAreaInsets();
  const { template } = useLocalSearchParams<{ template: TemplateKey }>();

  const [name, setName] = useState('');
  const [fandom, setFandom] = useState('');
  const [nickname, setNickname] = useState('');
  const [relType, setRelType] = useState<RelType>('romantic');

  const grad = TEMPLATE_GRADS[template] ?? ['#f3b6c4', '#d77a8d'];
  const tape = TEMPLATE_TAPE[template] ?? { color: 'rgba(255,255,255,0.9)', pattern: 'heart' as const };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s2, paddingBottom: insets.bottom + Spacing.s2 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>who's the one?</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover preview — styled with chosen template's gradient */}
        <GradientCover gradStart={grad[0]} gradEnd={grad[1]} style={styles.cover}>
          <View style={styles.coverTape}>
            <WashiTape width={80} height={16} pattern={tape.pattern} color={tape.color} rotate={-5} />
          </View>
          {name.trim().length > 0 ? (
            <>
              <Text style={styles.coverInitial}>{name.trim()[0]?.toUpperCase()}</Text>
              <View style={styles.coverSparkle}>
                <Sparkle size={14} color={Colors.butter} />
              </View>
            </>
          ) : (
            <View style={styles.coverPlaceholder}>
              <IconPlus size={26} color="rgba(255,255,255,0.9)" />
            </View>
          )}
          {name.trim().length > 0 && (
            <View style={styles.coverNameBadge}>
              <Text style={styles.coverNameText}>{name.trim()}</Text>
            </View>
          )}
        </GradientCover>

        {/* Fields */}
        <View style={styles.card}>
          <Field label="Their name">
            <UnderInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Kafka"
            />
          </Field>

          <View style={styles.spacer} />

          <Field label="From (fandom / series)">
            <UnderInput
              value={fandom}
              onChangeText={setFandom}
              placeholder="e.g. Honkai Star Rail"
            />
          </Field>

          <View style={styles.spacer} />

          <Field label="What you call them, privately">
            <UnderInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="a nickname, a feeling, anything"
            />
          </Field>
        </View>

        {/* Relationship type */}
        <View style={styles.typeSection}>
          <Field label="Relationship type">
            <View style={styles.pickerRow}>
              <PickerOption
                ja="恋"
                name="romantic"
                tint={Colors.sakuraDeep}
                tintBg={Colors.sakuraSoft}
                active={relType === 'romantic'}
                onPress={() => setRelType('romantic')}
              />
              <PickerOption
                ja="友"
                name="platonic"
                tint={Colors.sageDeep}
                tintBg={Colors.sageSoft}
                active={relType === 'platonic'}
                onPress={() => setRelType('platonic')}
              />
              <PickerOption
                ja="家"
                name="familial"
                tint={Colors.peachDeep}
                tintBg={Colors.peachSoft}
                active={relType === 'familial'}
                onPress={() => setRelType('familial')}
              />
            </View>
          </Field>
        </View>

        {/* Template reminder */}
        <View style={styles.templateNote}>
          <View style={styles.templateNoteHeart}>
            <Heart size={10} color={Colors.sakuraDeep} />
          </View>
          <Text style={styles.templateNoteText}>
            Your first card will use the{' '}
            <Text style={styles.templateNoteBold}>{template?.replace(/-/g, ' ')}</Text>
            {' '}template.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={name.trim().length === 0}
          onPress={() => router.replace((`/template/${template}`) as any)}
          icon={<Heart size={14} color={Colors.vellum} />}
          iconPosition="right"
        >
          {name.trim().length > 0 ? `add ${name.trim()} · keep them close` : 'fill in their name first'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5,
    paddingVertical: Spacing.s1,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 22,
    color: Colors.ink2,
    fontFamily: FontFamily.ui,
  },
  headerTitle: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.h6,
    color: Colors.ink,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s4,
    gap: 16,
  },
  cover: {
    borderRadius: Radius.r4,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.s2,
  },
  coverTape: {
    position: 'absolute',
    top: 10,
    left: 12,
  },
  coverInitial: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 80,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 84,
  },
  coverSparkle: {
    position: 'absolute',
    top: 22,
    right: 40,
  },
  coverPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverNameBadge: {
    position: 'absolute',
    bottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  coverNameText: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.meta,
    color: Colors.vellum,
  },
  card: {
    padding: Spacing.s5,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r4,
    ...Shadow.s1,
  },
  spacer: {
    height: 14,
  },
  typeSection: {
    gap: 0,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  templateNote: {
    padding: Spacing.s3,
    paddingHorizontal: Spacing.s4,
    backgroundColor: Colors.sakuraSoft,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.sakura,
    borderRadius: Radius.r3,
    position: 'relative',
  },
  templateNoteHeart: {
    position: 'absolute',
    top: -6,
    left: 12,
  },
  templateNoteText: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.caption,
    color: Colors.sakuraInk,
    lineHeight: 18,
  },
  templateNoteBold: {
    fontFamily: FontFamily.displayItalic,
    fontWeight: '600',
    color: Colors.sakuraDeep,
  },
  cta: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
  },
});
