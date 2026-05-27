import { router, useLocalSearchParams } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heart } from '@/components/deco/Heart';
import { Pin } from '@/components/deco/Pin';
import { WashiTape } from '@/components/deco/WashiTape';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { IconLock } from '@/components/ui/Icon';
import { PickerOption } from '@/components/ui/PickerOption';
import { StepDots } from '@/components/ui/StepDots';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { requestPermission } from '@/store/notifications';
import { getGlobalSetting, getOnbState, resetOnb, saveGlobalSetting, setOnbField } from '@/store/onboarding';
import { addShip, REL_GRADS } from '@/store/ships';

const VISUAL_TEMPLATES = [
  { key: 'get-to-know', label: 'Get to Know', desc: 'popular · fill out their info', color: Colors.sakuraDeep, bg: Colors.sakuraSoft },
  { key: 'kawaii-ui', label: 'Kawaii UI', desc: 'stats card · aesthetics', color: Colors.lavenderDeep, bg: Colors.lavenderSoft },
  { key: 'heart-frame', label: 'Heart Frame', desc: 'romantic · twin portraits', color: Colors.peachDeep, bg: Colors.peachSoft },
  { key: 'love-letter', label: 'Love Letter', desc: 'write them a letter', color: Colors.sakuraInk, bg: Colors.sakuraSoft },
  { key: 'aesthetic', label: 'Aesthetic', desc: 'mood board · palette · photos', color: Colors.butterDeep, bg: Colors.butterSoft },
] as const;

const TAPE_BY_REL: Record<string, { color: string; pattern: 'stripe' | 'dot' | 'heart' | 'check' }> = {
  romantic: { color: 'rgba(255,255,255,0.9)', pattern: 'heart' },
  platonic: { color: 'rgba(255,255,255,0.8)', pattern: 'dot' },
  familial: { color: 'rgba(255,255,255,0.8)', pattern: 'stripe' },
};

type RelType = 'romantic' | 'platonic' | 'familial';
type ShareType = 'ng' | 'welcome' | 'mirror';

export default function OnbRules() {
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isNew = mode === 'new';

  const [relType, setRelType] = useState<RelType>('romantic');
  const [shareType, setShareType] = useState<ShareType>('mirror');
  const [templateKey, setTemplateKey] = useState<string>('get-to-know');

  const handleRelType = (v: RelType) => { setRelType(v); setOnbField('relType', v); };
  const handleShareType = (v: ShareType) => { setShareType(v); setOnbField('shareType', v); };

  async function finish() {
    const state = getOnbState();
    const relGrad = REL_GRADS[relType] ?? REL_GRADS.romantic;
    const tape = TAPE_BY_REL[relType] ?? TAPE_BY_REL.romantic;
    addShip({
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
      templateKey,
    });
    resetOnb();

    if (!isNew) {
      await requestPermission();

      if (getGlobalSetting('rating_prompted') !== 'true') {
        saveGlobalSetting('rating_prompted', 'true');
        if (await StoreReview.isAvailableAsync()) {
          await StoreReview.requestReview();
        }
      }
    }

    router.replace('/(tabs)');
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      {/* Background accents */}
      <View style={styles.decoTR} pointerEvents="none">
        <Pin size={18} color={Colors.sakuraDeep} />
      </View>
      <View style={styles.decoBL} pointerEvents="none">
        <Heart size={20} color={Colors.lavenderDeep} outline />
      </View>

      {isNew ? (
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>the rules</Text>
          <View style={{ width: 32 }} />
        </View>
      ) : (
        <View style={styles.dotsRow}>
          <StepDots step={2} total={3} />
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!isNew && <Text style={styles.eyebrow}>step three of three · the rules</Text>}
        <Text style={[styles.heading, isNew && styles.headingNew]}>What kind of love,{'\n'}and who's invited?</Text>

        <View style={styles.section}>
          <Field label="Relationship type">
            <View style={styles.pickerRow}>
              <PickerOption ja="恋" name="romantic" tint={Colors.sakuraDeep} tintBg={Colors.sakuraSoft} active={relType === 'romantic'} onPress={() => handleRelType('romantic')} />
              <PickerOption ja="友" name="platonic" tint={Colors.sageDeep} tintBg={Colors.sageSoft} active={relType === 'platonic'} onPress={() => handleRelType('platonic')} />
              <PickerOption ja="家" name="familial" tint={Colors.peachDeep} tintBg={Colors.peachSoft} active={relType === 'familial'} onPress={() => handleRelType('familial')} />
            </View>
          </Field>
        </View>

        <View style={styles.section}>
          <Field label="Sharing — about doubles">
            <View style={styles.pickerRow}>
              <PickerOption ja="禁" name="sharing NG" tint={Colors.ember} tintBg="#fde0d4" active={shareType === 'ng'} onPress={() => handleShareType('ng')} />
              <PickerOption ja="可" name="welcome" tint={Colors.sageDeep} tintBg={Colors.sageSoft} active={shareType === 'welcome'} onPress={() => handleShareType('welcome')} />
              <PickerOption ja="鏡" name="mirror" tint={Colors.lavenderDeep} tintBg={Colors.lavenderSoft} active={shareType === 'mirror'} onPress={() => handleShareType('mirror')} />
            </View>
          </Field>
        </View>

        <View style={styles.section}>
          <Field label="A style that feels like them">
            <View style={styles.templateGrid}>
              {VISUAL_TEMPLATES.map((t) => (
                <Pressable
                  key={t.key}
                  style={[styles.templateCard, { backgroundColor: t.bg }, templateKey === t.key && { borderColor: t.color, borderWidth: 2 }]}
                  onPress={() => setTemplateKey(t.key)}
                >
                  <View style={styles.templateTape}>
                    <WashiTape width={40} height={10} pattern="heart" color={t.color} rotate={-5} />
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

        <View style={styles.privacyNote}>
          <View style={styles.privacyIcon}>
            <IconLock size={14} color={Colors.lavenderDeep} />
          </View>
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>Private by default</Text>
            <Text style={styles.privacyBody}>
              Nothing leaves your phone. Notifications never reveal the app on your lock screen.
            </Text>
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
          keep them close
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
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 22, color: Colors.ink2, fontFamily: FontFamily.ui },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s5, paddingBottom: Spacing.s4 },
  eyebrow: {
    fontFamily: FontFamily.marker, fontSize: 10, color: Colors.sageDeep,
    letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: '600',
  },
  heading: {
    fontFamily: FontFamily.displayItalic, fontSize: 28, lineHeight: 30,
    letterSpacing: -0.3, color: Colors.ink, marginTop: Spacing.s2,
  },
  headingNew: { marginTop: 0 },
  section: { marginTop: Spacing.s4 },
  pickerRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  privacyNote: {
    marginTop: Spacing.s5, padding: Spacing.s3, paddingHorizontal: Spacing.s4,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r3, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  privacyIcon: {
    width: 28, height: 28, borderRadius: Radius.r2,
    backgroundColor: Colors.lavenderSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  privacyText: { flex: 1 },
  privacyTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: FontSize.caption, color: Colors.ink, marginBottom: 2 },
  privacyBody: { fontSize: 11, fontFamily: FontFamily.ui, color: Colors.ink2, lineHeight: 16 },
  actions: { paddingHorizontal: Spacing.s6, paddingBottom: Spacing.s3, gap: Spacing.s2 },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  templateCard: {
    width: '47%', padding: Spacing.s3, borderRadius: Radius.r3,
    borderWidth: 1, borderColor: Colors.line, minHeight: 80,
    justifyContent: 'flex-end', overflow: 'hidden', ...Shadow.s1,
  },
  templateTape: { position: 'absolute', top: -2, left: 6 },
  templateLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: 12, marginBottom: 2 },
  templateDesc: { fontFamily: FontFamily.ui, fontSize: 10, color: Colors.ink3, lineHeight: 14 },
  templateCheck: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  templateCheckText: { fontSize: 10, color: Colors.vellum, fontFamily: FontFamily.uiSemiBold },
  decoTR: {
    position: 'absolute',
    top: 100,
    right: 24,
  },
  decoBL: {
    position: 'absolute',
    bottom: 140,
    left: 24,
  },
});
