import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heart } from '@/components/deco/Heart';
import { WashiTape } from '@/components/deco/WashiTape';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { IconLock } from '@/components/ui/Icon';
import { PickerOption } from '@/components/ui/PickerOption';
import { Colors, FontFamily, FontSize, Radius, Spacing, Shadow } from '@/constants/theme';
import { getOnbState, resetOnb } from '@/store/onboarding';
import { addShip, REL_GRADS } from '@/store/ships';

type RelType = 'romantic' | 'platonic' | 'familial';
type ShareType = 'ng' | 'welcome' | 'mirror';

const TAPE_BY_REL: Record<RelType, { color: string; pattern: 'stripe' | 'dot' | 'heart' | 'check' }> = {
  romantic: { color: 'rgba(255,255,255,0.9)', pattern: 'heart' },
  platonic: { color: 'rgba(255,255,255,0.8)', pattern: 'dot' },
  familial: { color: 'rgba(255,255,255,0.8)', pattern: 'stripe' },
};

const VISUAL_TEMPLATES = [
  { key: 'get-to-know', label: 'Get to Know',  desc: 'popular · fill out their info',  color: Colors.sakuraDeep,   bg: Colors.sakuraSoft },
  { key: 'kawaii-ui',   label: 'Kawaii UI',    desc: 'stats card · aesthetics',         color: Colors.lavenderDeep, bg: Colors.lavenderSoft },
  { key: 'heart-frame', label: 'Heart Frame',  desc: 'romantic · twin portraits',       color: Colors.peachDeep,   bg: Colors.peachSoft },
  { key: 'love-letter', label: 'Love Letter',  desc: 'write them a letter',             color: Colors.sakuraInk,   bg: Colors.sakuraSoft },
  { key: 'aesthetic',   label: 'Aesthetic',    desc: 'mood board · palette · photos',   color: Colors.butterDeep,  bg: Colors.butterSoft },
] as const;

export default function NewShipSetup() {
  const insets = useSafeAreaInsets();
  const [relType, setRelType] = useState<RelType>('romantic');
  const [shareType, setShareType] = useState<ShareType>('mirror');
  const [templateKey, setTemplateKey] = useState<string>('get-to-know');

  function create() {
    const state = getOnbState();
    const grad = REL_GRADS[relType] ?? REL_GRADS.romantic;
    const tape = TAPE_BY_REL[relType];
    const id = addShip({
      name: state.foName || 'untitled',
      fandom: state.fandom,
      relType,
      shareType,
      nickname: state.nickname ?? '',
      gradStart: grad[0],
      gradEnd: grad[1],
      tapePattern: tape.pattern,
      tapeColor: tape.color,
      templateKey,
    });
    resetOnb();
    router.replace(`/template/${templateKey}?shipId=${id}` as any);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s2, paddingBottom: insets.bottom + Spacing.s2 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>the rules</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>What kind of love,{'\n'}and who's invited?</Text>

        <View style={styles.section}>
          <Field label="Relationship type">
            <View style={styles.pickerRow}>
              <PickerOption ja="恋" name="romantic" tint={Colors.sakuraDeep} tintBg={Colors.sakuraSoft} active={relType === 'romantic'} onPress={() => setRelType('romantic')} />
              <PickerOption ja="友" name="platonic" tint={Colors.sageDeep}   tintBg={Colors.sageSoft}   active={relType === 'platonic'} onPress={() => setRelType('platonic')} />
              <PickerOption ja="家" name="familial" tint={Colors.peachDeep}  tintBg={Colors.peachSoft}  active={relType === 'familial'} onPress={() => setRelType('familial')} />
            </View>
          </Field>
        </View>

        <View style={styles.section}>
          <Field label="Sharing — about doubles">
            <View style={styles.pickerRow}>
              <PickerOption ja="禁" name="sharing NG" tint={Colors.ember}        tintBg="#fde0d4"           active={shareType === 'ng'}      onPress={() => setShareType('ng')} />
              <PickerOption ja="可" name="welcome"    tint={Colors.sageDeep}     tintBg={Colors.sageSoft}   active={shareType === 'welcome'} onPress={() => setShareType('welcome')} />
              <PickerOption ja="鏡" name="mirror"     tint={Colors.lavenderDeep} tintBg={Colors.lavenderSoft} active={shareType === 'mirror'}  onPress={() => setShareType('mirror')} />
            </View>
          </Field>
        </View>

        {/* Template picker */}
        <View style={styles.section}>
          <Field label="Pick a card style">
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

      <View style={styles.cta}>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={create}
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 22, color: Colors.ink2, fontFamily: FontFamily.ui },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s5, paddingBottom: Spacing.s4 },
  heading: { fontFamily: FontFamily.displayItalic, fontSize: 28, lineHeight: 30, letterSpacing: -0.3, color: Colors.ink },
  section: { marginTop: Spacing.s5 },
  pickerRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
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
  cta: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s2 },
});
