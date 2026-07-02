import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bullets, StickerHeartPatch } from '@/components/deco';
import { Ribbon } from '@/components/deco/Ribbon';
import { WashiTape } from '@/components/deco/WashiTape';
import { CalloutBubble } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { StepDots } from '@/components/ui/StepDots';
import { Colors, FontFamily, FontSize, Radius, Spacing ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { getOnbState, resetOnb } from '@/store/onboarding';
import { addShip, REL_GRADS } from '@/store/ships';
import { newId } from '@/db/client';

const VISUAL_TEMPLATES = [
  { key: 'get-to-know', label: 'All About Us', desc: 'popular · fill out their info', color: Colors.sakuraDeep, bg: Colors.sakuraSoft, tape: 'floral' },
  { key: 'kawaii-ui', label: 'Kawaii UI', desc: 'stats card · aesthetics', color: Colors.lavenderDeep, bg: Colors.lavenderSoft, tape: 'dot' },
  { key: 'heart-frame', label: 'Heart Frame', desc: 'romantic · twin portraits', color: Colors.peachDeep, bg: Colors.peachSoft, tape: 'heart' },
  { key: 'aesthetic', label: 'Aesthetic', desc: 'mood board · palette · photos', color: Colors.butterDeep, bg: Colors.butterSoft, tape: 'star' },
  { key: 'flip-phone', label: 'Flip Phone', desc: 'Y2K windows · chat · music', color: Colors.sakuraDeep, bg: Colors.sakura, tape: 'floral' },
  { key: 'talking-about', label: 'Talking About', desc: 'dual portrait · sliders · tropes', color: Colors.sageDeep, bg: Colors.sageSoft, tape: 'dot' },
  { key: 'bond-banner', label: 'Bond Banner', desc: 'heart shield · personality bars', color: Colors.plum, bg: Colors.lavenderSoft, tape: 'heart' },
] as const;

const POLY_VISUAL = [
  { key: 'poly-chart', label: 'Poly Ship Chart', desc: 'the whole polycule · roster · map', color: Colors.plum, bg: Colors.lavenderSoft, tape: 'heart' },
  { key: 'poly-quick', label: 'In 5 Minutes', desc: 'quick · roles · meters · facts', color: Colors.lavenderDeep, bg: Colors.lavenderSoft, tape: 'dot' },
  { key: 'poly-dynamics', label: 'Polycule Dynamics', desc: 'charts · differences · who\'s the one', color: Colors.sageDeep, bg: Colors.sageSoft, tape: 'check' },
] as const;

const TAPE_BY_REL: Record<string, { color: string; pattern: 'stripe' | 'dot' | 'heart' | 'check' }> = {
  romantic: { color: 'rgba(255,255,255,0.9)', pattern: 'heart' },
  platonic: { color: 'rgba(255,255,255,0.8)', pattern: 'dot' },
  familial: { color: 'rgba(255,255,255,0.8)', pattern: 'stripe' },
};

export default function OnbRules() {
  const insets = useSafeAreaInsets();
  const { scrollFill, column } = useIPad();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isNew = mode === 'new';
  const isPolyFlow = getOnbState().kind === 'poly';

  // Preselect the template the user lingered on in the showcase carousel, if it fits this flow.
  const [templateKey, setTemplateKey] = useState<string>(() => {
    const fromShowcase = getOnbState().templateKey;
    const options = isPolyFlow ? POLY_VISUAL : VISUAL_TEMPLATES;
    if (options.some((t) => t.key === fromShowcase)) return fromShowcase;
    return isPolyFlow ? 'poly-chart' : 'get-to-know';
  });

  function finish() {
    const state = getOnbState();

    if (state.kind === 'poly') {
      const name = (state.shipName || 'untitled').trim();
      const shipId = addShip({
        name,
        shipName: name,
        myName: state.userName || '',
        relType: 'romantic',
        gradStart: state.gradStart || REL_GRADS.romantic[0],
        gradEnd: state.gradEnd || REL_GRADS.romantic[1],
        tapePattern: 'heart',
        tapeColor: 'rgba(255,255,255,0.9)',
        coverUri: state.coverUri,
        templateKey,
        kind: 'poly',
        members: [{ id: newId(), name: state.userName || 'me ♡', isMe: true }],
      });
      resetOnb();
      router.replace(`/template/${templateKey}?shipId=${shipId}` as any);
      return;
    }

    const relType = state.relType || 'romantic';
    const shareType = state.shareType || 'mirror';
    const relGrad = REL_GRADS[relType] ?? REL_GRADS.romantic;
    const tape = TAPE_BY_REL[relType] ?? TAPE_BY_REL.romantic;
    const shipId = addShip({
      name: state.foName || 'untitled',
      shipName: state.shipName || state.foName || 'untitled',
      myName: state.userName || '',
      fandom: state.fandom,
      relType,
      shareType,
      gradStart: state.gradStart || relGrad[0],
      gradEnd: state.gradEnd || relGrad[1],
      tapePattern: tape.pattern,
      tapeColor: tape.color,
      coverUri: state.coverUri,
      templateKey,
    });

    if (isNew) {
      resetOnb();
      router.replace('/(tabs)');
      return;
    }

    router.replace({ pathname: '/onboarding/ready', params: { shipId } });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      {isNew ? (
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>choose a style</Text>
          <View style={{ width: 32 }} />
        </View>
      ) : (
        <View style={styles.dotsRow}>
          <StepDots step={3} total={4} />
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, scrollFill]} showsVerticalScrollIndicator={false}>
        <View style={[column, { position: 'relative' }]}>
          <View style={styles.decoTR} pointerEvents="none">
            <Ribbon size={18} color={Colors.sakuraDeep} />
          </View>
          <View style={styles.decoBL} pointerEvents="none">
            <StickerHeartPatch size={48} />
          </View>
        {!isNew && <Text style={styles.eyebrow}>step four · style</Text>}
        <Text style={[styles.heading, isNew && styles.headingNew]}>
          A style that feels{"\n"}like your world.
        </Text>

        <View style={styles.section}>
          <Field label="VISUAL THEME">
            <View style={styles.templateGrid}>
              {(isPolyFlow ? POLY_VISUAL : VISUAL_TEMPLATES).map((t) => (
                <Pressable
                  key={t.key}
                  style={[styles.templateCard, { backgroundColor: t.bg }, templateKey === t.key && { borderColor: t.color, borderWidth: 2 }]}
                  onPress={() => setTemplateKey(t.key)}
                >
                  <View style={styles.templateTape}>
                    <WashiTape width={40} height={10} pattern={t.tape} color={t.color} rotate={-5} />
                  </View>
                  <Text style={[styles.templateLabel, { color: t.color }]}>{t.label}</Text>
                  <Text style={styles.templateDesc}>{t.desc}</Text>
                  {templateKey === t.key && (
                    <View style={[styles.templateCheck, { backgroundColor: t.color }]}>
                      <Text style={styles.templateCheckText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </Field>
        </View>

        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <CalloutBubble tone="lavender">
            private by default — nothing leaves your phone.
          </CalloutBubble>
        </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, column]}>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={finish}
          icon={<Bullets.Heart size={14} color={Colors.vellum} />}
          iconPosition="right"
        >
          {isNew ? 'launch the ship' : 'save them somewhere soft'}
        </Button>
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
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.paperDeep, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.line },
  backBtnText: { fontSize: sf(24), color: Colors.ink2 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s5, paddingBottom: Spacing.s4 },
  eyebrow: {
    fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.plum,
    letterSpacing: 1.6, textTransform: 'uppercase',
  },
  heading: {
    fontFamily: FontFamily.displayItalic, fontSize: sf(26), lineHeight: 28,
    letterSpacing: -0.3, color: Colors.ink, marginTop: Spacing.s2,
  },
  headingNew: { marginTop: 0 },
  section: { marginTop: Spacing.s4 },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: Spacing.s2 },
  templateCard: {
    width: '48%', minHeight: 90, borderRadius: Radius.r3, padding: Spacing.s3,
    borderWidth: 1.4, borderColor: Colors.line, position: 'relative', overflow: 'hidden',
  },
  templateTape: { position: 'absolute', top: -3, left: 10 },
  templateLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), marginTop: 4 },
  templateDesc: { fontFamily: FontFamily.ui, fontSize: sf(10), color: Colors.ink3, marginTop: 2, lineHeight: 12 },
  templateCheck: {
    position: 'absolute', bottom: 6, right: 6, width: 14, height: 14,
    borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center',
  },
  templateCheckText: { color: Colors.vellum, fontSize: sf(8), fontWeight: 'bold' },
  privacyNote: {
    flexDirection: 'row', gap: Spacing.s3, padding: Spacing.s4,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    marginTop: 20,
  },
  privacyIcon: {
    width: 28, height: 28, borderRadius: Radius.pill,
    backgroundColor: Colors.lavenderSoft, alignItems: 'center', justifyContent: 'center',
  },
  privacyText: { flex: 1, gap: 2 },
  privacyTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink },
  privacyBody: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3, lineHeight: 15 },
  actions: { paddingHorizontal: Spacing.s6, paddingBottom: Spacing.s3 },
  decoTR: { position: 'absolute', top: 0, right: 0 },
  decoBL: { position: 'absolute', bottom: 120, right: 30 },
});
