import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heart, Sparkle, StickerSakuraBranch } from '@/components/deco';
import { TemplateThumb } from '@/components/templates/TemplateThumb';
import { Button } from '@/components/ui/Button';
import { MockPhone } from '@/components/ui/MockPhone';
import { StepDots } from '@/components/ui/StepDots';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { setOnbField } from '@/store/onboarding';
import { AKI_XML } from '@/components/deco/akiXml';

const SHOWCASE = [
  { key: 'poly-chart', title: 'Poly Ship Chart', desc: 'the whole polycule — roster, spectrums, bond map', color: Colors.lavenderDeep },
  { key: 'storyline', title: 'Storyline', desc: 'your story with them, chapter by chapter', color: Colors.plum },
  { key: 'scenarios', title: 'Scenarios', desc: 'write every what-if and soft little moment', color: Colors.sakuraDeep },
  { key: 'love-letter', title: 'Love Letter', desc: 'something soft, sealed and saved just for you', color: Colors.sakuraDeep },
  { key: 'polycule-bingo', title: 'Polycule Bingo', desc: 'tap the squares as they happen to your ship ♡', color: Colors.plum },
  { key: 'kawaii-ui', title: 'Kawaii UI', desc: 'a little stats card for the bond', color: Colors.lavenderDeep },
] as const;

// Sample content served to each template's data context so previews look lived-in.
// Poly-chart member ids match its PREVIEW_MEMBERS roster (pv1 aki · pv2 rin · pv3 me).
const SAMPLE_DATA: Record<string, Record<string, string>> = {
  'poly-chart': {
    spec: JSON.stringify({
      age: { pv1: 0.85, pv2: 0.3, pv3: 0.5 },
      height: { pv1: 0.9, pv2: 0.25, pv3: 0.55 },
      aff: { pv1: 0.2, pv2: 0.95, pv3: 0.6 },
      play: { pv1: 0.15, pv2: 0.9, pv3: 0.7 },
      sleep: { pv1: 0.8, pv2: 0.4, pv3: 0.95 },
      dates: { pv1: 0.75, pv2: 0.35, pv3: 0.85 },
    }),
    grid: JSON.stringify({
      moral: { pv1: { x: 0.2, y: 0.25 }, pv2: { x: 0.75, y: 0.7 }, pv3: { x: 0.5, y: 0.45 } },
      temper: { pv1: { x: 0.3, y: 0.8 }, pv2: { x: 0.8, y: 0.3 }, pv3: { x: 0.55, y: 0.5 } },
    }),
    love: JSON.stringify({
      pv1: { acts: 0.9, quality: 0.6, physical: 0.35, verbal: 0.2, gifts: 0.5 },
      pv2: { acts: 0.3, quality: 0.7, physical: 0.9, verbal: 0.85, gifts: 0.4 },
      pv3: { acts: 0.5, quality: 0.95, physical: 0.6, verbal: 0.7, gifts: 0.3 },
    }),
    prefVals: JSON.stringify({
      date: { pv1: 'the aquarium', pv2: 'arcade night', pv3: 'staying in ♡' },
      blush: { pv1: 'forehead kisses', pv2: 'compliments', pv3: 'hand-holding' },
      ily: { pv1: 'rarely, means it', pv2: 'constantly', pv3: 'in little notes' },
    }),
    bonds: JSON.stringify({
      'pv1|pv2': { type: 'romantic', close: 'closest' },
      'pv2|pv3': { type: 'romantic', close: 'closest' },
      'pv1|pv3': { type: 'queerplatonic', close: 'less' },
    }),
    music: 'our song — the one from the rainy episode',
  },
  'storyline': {
    events: JSON.stringify([
      { d: 'JAN 14', t: 'the first meeting', body: 'i pressed play on episode one. i did not know yet.' },
      { d: 'FEB 02', t: 'oh. oh no.', body: 'the scene in the rain. that was the moment, honestly.' },
      { d: 'MAR 21', t: 'first letter written', body: 'i finally wrote down everything i keep thinking.' },
      { d: 'MAY 09', t: 'our little anniversary', body: 'one hundred days of this quiet, steady thing.' },
      { d: 'JUN 02', t: 'the vault begins', body: 'a home for every scene, every headcanon, every us.' },
    ]),
  },
  'love-letter': {
    dearName: 'kael',
    signName: 'me ♡',
    letterBody: 'it rained today and i thought of you — the way you would tilt the umbrella toward me and pretend you were not getting soaked. i keep every small imagined moment like this, pressed flat like flowers. stay close, even like this.',
    things: JSON.stringify([
      'your laugh in the quiet parts',
      'rainy days, shared umbrellas',
      'the way you say my name',
      'late-night talks that go nowhere',
      'every small imagined morning',
    ]),
  },
  'kawaii-ui': {
    name: 'kael',
    from: 'my favorite story',
    type: 'romantic',
    age: '24 (probably)',
    birthday: '2001-11-30',
    pronouns: 'he/him',
    'love language': 'quality time',
    mbti: 'INTJ',
    sharing: 'Selective',
    song: 'the rainy episode theme',
    trope0: 'grumpy × sunshine',
    trope1: 'slow burn',
    trope2: 'found family',
    anniv: '2026-03-24',
    portrait: AKI_XML,
  },
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
// Full-device mock sizing — frame is 1280×2642, screen inset 55 (see MockPhone).
// Fit 2 phones side by side on iPhone, 3 on iPad; capped by the vertical budget.
const VISIBLE = SCREEN_W >= 768 ? 3 : 2;
const H_PAD = Spacing.s6;
const PHONE_W = Math.round(Math.min(
  (SCREEN_W - 2 * H_PAD - (VISIBLE - 1) * Spacing.s4) / VISIBLE,
  (SCREEN_H * 0.44) / (2642 / 1280),
));
const SCREEN_INNER_W = PHONE_W - 2 * (55 / 1280) * PHONE_W;
const SCREEN_INNER_H = (2642 - 110) / 1280 * PHONE_W;
// keep template content below the status bar / Dynamic Island, with a little breathing room
const STATUS_H = SCREEN_INNER_W * (102 / 906);
const CONTENT_TOP = Math.round(STATUS_H * 1.5);
const CARD_GAP = Spacing.s4;
const SNAP = PHONE_W + CARD_GAP;

export default function OnbShowcase() {
  const insets = useSafeAreaInsets();
  const { column, isIPad } = useIPad();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP);
    setPage(Math.max(0, Math.min(SHOWCASE.length - 1, idx)));
  }

  function goTo(idx: number) {
    setPage(idx);
    scrollRef.current?.scrollTo({ x: idx * SNAP, animated: true });
  }

  function continueFlow() {
    setOnbField('templateKey', SHOWCASE[page].key);
    router.push('/onboarding/persona');
  }

  const active = SHOWCASE[page];

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.dotsRow}>
        <StepDots step={0} total={4} />
      </View>

      {/* center the header + carousel + caption block vertically on iPad, like the other steps */}
      <View style={[styles.main, isIPad && { justifyContent: 'center' }]}>
      <View style={[styles.header, column, { position: 'relative' }]}>
        <View style={styles.decoTR} pointerEvents="none">
          <StickerSakuraBranch size={54} />
        </View>
        <Text style={styles.eyebrow}>a peek inside</Text>
        <Text style={styles.heading}>Pages you can{'\n'}fill with them.</Text>
        <Text style={styles.subcopy}>
          swipe through — every ship gets pages like these.
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={styles.carousel}
        style={styles.carouselWrap}
      >
        {SHOWCASE.map((t, i) => (
          <Pressable key={t.key} onPress={() => goTo(i)} style={{ width: PHONE_W }}>
            <MockPhone width={PHONE_W} screenColor={Colors.paper} statusTint={Colors.ink}>
              <View style={{ paddingTop: CONTENT_TOP }}>
                <TemplateThumb templateKey={t.key} width={SCREEN_INNER_W} height={SCREEN_INNER_H - CONTENT_TOP} data={SAMPLE_DATA[t.key]} />
              </View>
            </MockPhone>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.caption, column]}>
        <Text style={[styles.captionTitle, { color: active.color }]}>{active.title}</Text>
        <Text style={styles.captionDesc}>{active.desc}</Text>
        <View style={styles.pageDots}>
          {SHOWCASE.map((t, i) => (
            <Pressable key={t.key} onPress={() => goTo(i)} hitSlop={8}>
              <View style={[styles.pageDot, i === page && { backgroundColor: active.color, width: 16 }]} />
            </Pressable>
          ))}
        </View>
      </View>
      </View>

      <View style={[styles.actions, column]}>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={continueFlow}
          icon={<Heart size={14} color={Colors.vellum} />}
          iconPosition="right"
        >
          continue · make it mine
        </Button>
        <View style={styles.privacyRow}>
          <Sparkle size={11} color={Colors.lavenderDeep} />
          <Text style={styles.privacy}>private by default — nothing leaves your phone.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  dotsRow: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s4, paddingBottom: Spacing.s1 },
  header: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s4 },
  eyebrow: {
    fontFamily: FontFamily.marker,
    fontSize: sf(10),
    color: Colors.sakuraDeep,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(31),
    lineHeight: sf(33),
    color: Colors.ink,
    marginTop: Spacing.s2,
  },
  subcopy: {
    fontFamily: FontFamily.script,
    fontSize: sf(18),
    lineHeight: sf(22),
    color: Colors.ink2,
    marginTop: Spacing.s3,
  },
  carouselWrap: { flexGrow: 0, marginTop: Spacing.s5 },
  carousel: { paddingHorizontal: H_PAD, gap: CARD_GAP, alignItems: 'center', flexGrow: 1, justifyContent: 'center' },
  main: { flex: 1 },
  caption: { alignItems: 'center', paddingHorizontal: Spacing.s6, marginTop: Spacing.s3 },
  captionTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: FontSize.body },
  captionDesc: { fontFamily: FontFamily.ui, fontSize: FontSize.caption, color: Colors.ink3, marginTop: 2, textAlign: 'center' },
  pageDots: { flexDirection: 'row', gap: 6, marginTop: Spacing.s3, alignItems: 'center' },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.lineStrong,
  },
  actions: { paddingHorizontal: Spacing.s6, paddingBottom: Spacing.s3, gap: Spacing.s2 },
  privacyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  privacy: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3 },
  decoTR: { position: 'absolute', top: 0, right: 0 },
});
