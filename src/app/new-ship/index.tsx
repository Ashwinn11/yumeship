import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mark } from '@/components/ui/Mark';
import { Button } from '@/components/ui/Button';
import { WashiTape } from '@/components/deco/WashiTape';
import { Sparkle } from '@/components/deco/Sparkle';
import { Heart } from '@/components/deco/Heart';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';

// design/template-pages.jsx — 9 template styles
export type TemplateKey =
  | 'get-to-know'
  | 'kawaii-ui'
  | 'heart-frame'
  | 'aesthetic'
  | 'this-or-that'
  | 'boundaries'
  | 'love-letter'
  | 'storyline'
  | 'headcanons';

type TemplateCard = {
  key: TemplateKey;
  title: string;
  by: string;
  tint: string;
  tapeColor: string;
  tapePattern: 'stripe' | 'dot' | 'heart' | 'check' | 'solid';
  accent: string;
  description: string;
};

const TEMPLATES: TemplateCard[] = [
  {
    key: 'get-to-know',
    title: 'Get to Know Them',
    by: '@reversiblekisses',
    tint: Colors.sakuraSoft,
    tapeColor: Colors.sakuraDeep,
    tapePattern: 'heart',
    accent: Colors.sakuraDeep,
    description: 'Personality, habits, favorite things. The essentials.',
  },
  {
    key: 'kawaii-ui',
    title: 'Kawaii UI',
    by: '@cherrypopstamp',
    tint: Colors.lavenderSoft,
    tapeColor: Colors.lavenderDeep,
    tapePattern: 'dot',
    accent: Colors.lavenderDeep,
    description: 'Stats, sliders, toggles. Like a character select screen.',
  },
  {
    key: 'heart-frame',
    title: 'Heart Frame',
    by: '@bunny.thoughts',
    tint: Colors.sakuraSoft,
    tapeColor: Colors.sakura,
    tapePattern: 'stripe',
    accent: Colors.sakuraInk,
    description: 'A portrait page. Soft, framed, made to be kept.',
  },
  {
    key: 'aesthetic',
    title: 'Aesthetic Board',
    by: '@cloudbloom.kr',
    tint: Colors.butterSoft,
    tapeColor: Colors.butterDeep,
    tapePattern: 'check',
    accent: Colors.butterDeep,
    description: 'Moodboard grid: colors, textures, vibes.',
  },
  {
    key: 'this-or-that',
    title: 'This or That',
    by: '@softfangs',
    tint: Colors.sageSoft,
    tapeColor: Colors.sageDeep,
    tapePattern: 'dot',
    accent: Colors.sageDeep,
    description: 'Binary choices that reveal everything about them.',
  },
  {
    key: 'boundaries',
    title: 'Boundaries',
    by: '@petalpressed',
    tint: Colors.peachSoft,
    tapeColor: Colors.peachDeep,
    tapePattern: 'stripe',
    accent: Colors.peachDeep,
    description: 'Sharing rules, doubles, comfort notes. Your terms.',
  },
  {
    key: 'love-letter',
    title: 'Love Letter',
    by: '@inkdrop.diary',
    tint: Colors.sakuraSoft,
    tapeColor: Colors.plum,
    tapePattern: 'heart',
    accent: Colors.plum,
    description: 'A letter to them. The one you never send.',
  },
  {
    key: 'storyline',
    title: 'Storyline',
    by: '@plumstamps',
    tint: Colors.lavenderSoft,
    tapeColor: Colors.lavender,
    tapePattern: 'check',
    accent: Colors.lavenderDeep,
    description: 'Timeline of moments. How you got here.',
  },
  {
    key: 'headcanons',
    title: 'Headcanons',
    by: '@daydreamr',
    tint: Colors.butterSoft,
    tapeColor: Colors.butter,
    tapePattern: 'dot',
    accent: Colors.butterDeep,
    description: 'Numbered headcanons, categorized. Build the lore.',
  },
];

export default function NewShipTemplates() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<TemplateKey | null>(null);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s2, paddingBottom: insets.bottom + Spacing.s2 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Mark size={22} />
          <Text style={styles.headerTitle}>new ship</Text>
        </View>

        <View style={{ width: 32 }} />
      </View>

      <View style={styles.intro}>
        <Text style={styles.heading}>Pick a template.</Text>
        <Text style={styles.sub}>This becomes the first card in their profile.</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {TEMPLATES.map((t) => {
          const isSelected = selected === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setSelected(t.key)}
              style={[
                styles.card,
                { backgroundColor: t.tint, borderColor: isSelected ? t.accent : Colors.line },
                isSelected && styles.cardSelected,
              ]}
            >
              {/* Washi tape accent */}
              <View style={styles.cardTape}>
                <WashiTape
                  width={52}
                  height={12}
                  pattern={t.tapePattern}
                  color={t.tapeColor}
                  rotate={-4}
                />
              </View>

              {/* Selection sparkle */}
              {isSelected && (
                <View style={styles.cardSparkle}>
                  <Sparkle size={12} color={t.accent} />
                </View>
              )}

              {/* Card body */}
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: t.accent }]}>{t.title}</Text>
                <Text style={[styles.cardBy, { color: t.accent + 'aa' }]}>{t.by}</Text>
                <Text style={styles.cardDesc}>{t.description}</Text>
              </View>

              {/* Selected check */}
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: t.accent }]}>
                  <Heart size={10} color={Colors.vellum} />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={selected === null}
          onPress={() =>
            router.replace((`/template/${selected}`) as any)
          }
        >
          {selected
            ? `use · ${TEMPLATES.find((t) => t.key === selected)?.title}`
            : 'choose a template'}
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
    paddingVertical: Spacing.s2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    color: Colors.ink2,
    fontFamily: FontFamily.ui,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.h6,
    color: Colors.ink,
  },
  intro: {
    paddingHorizontal: Spacing.s5,
    paddingBottom: Spacing.s2,
  },
  heading: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 28,
    lineHeight: 30,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  sub: {
    fontFamily: FontFamily.displayItalic,
    fontSize: FontSize.meta,
    color: Colors.ink2,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.s3,
    gap: 10,
  },
  card: {
    width: '47%',
    borderRadius: Radius.r4,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    paddingTop: Spacing.s4,
    ...Shadow.s1,
  },
  cardSelected: {
    ...Shadow.s2,
  },
  cardTape: {
    position: 'absolute',
    top: -4,
    left: 8,
  },
  cardSparkle: {
    position: 'absolute',
    top: 6,
    right: 8,
  },
  cardBody: {
    padding: Spacing.s3,
    gap: 3,
  },
  cardTitle: {
    fontFamily: FontFamily.markerBold,
    fontSize: 13,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  cardBy: {
    fontFamily: FontFamily.script,
    fontSize: 11,
    marginTop: 1,
  },
  cardDesc: {
    fontFamily: FontFamily.ui,
    fontSize: 10,
    color: Colors.ink2,
    lineHeight: 15,
    marginTop: 4,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...Shadow.s1,
  },
  cta: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s2,
  },
});
