import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sparkle } from '@/components/deco/Sparkle';
import { StickerSakuraBranch } from '@/components/deco';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Mark } from '@/components/ui/Mark';
import { Row } from '@/components/ui/Row';
import { StepDots } from '@/components/ui/StepDots';
import { UnderInput } from '@/components/ui/UnderInput';
import { CalloutBubble } from '@/components/ui';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { getGlobalSetting, saveGlobalSetting, setOnbField } from '@/store/onboarding';

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
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isEdit = mode === 'edit';

  const [name, setName] = useState(() => getGlobalSetting('user_name'));
  const [pronoun, setPronoun] = useState(() => getGlobalSetting('user_pronouns', 'she/her'));
  const [colorIdx, setColorIdx] = useState(() => {
    const i = (COLOR_OPTIONS as string[]).indexOf(getGlobalSetting('user_color'));
    return i >= 0 ? i : 0;
  });
  const [avatar, setAvatar] = useState(() => getGlobalSetting('user_avatar'));

  const handleNameChange = (v: string) => { setName(v); setOnbField('userName', v); };
  const handlePronounChange = (p: string) => {
    setPronoun(p);
    setOnbField('pronouns', p);
    saveGlobalSetting('user_pronouns', p);
  };
  const handleColor = (i: number) => {
    setColorIdx(i);
    saveGlobalSetting('user_color', COLOR_OPTIONS[i]);
    setAvatar('');
    saveGlobalSetting('user_avatar', '');
  };

  async function pickAvatar() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      setAvatar(res.assets[0].uri);
      saveGlobalSetting('user_avatar', res.assets[0].uri);
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      {isEdit ? (
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Mark size={22} />
            <Text style={styles.headerTitle}>edit profile</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>
      ) : (
        <View style={styles.dotsRow}>
          <StepDots step={2} total={5} />
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, scrollFill]} showsVerticalScrollIndicator={false}>
        <View style={[column, { position: 'relative' }]}>
          <View style={styles.decoTR} pointerEvents="none">
            <StickerSakuraBranch size={60} />
          </View>
          <View style={styles.decoBL} pointerEvents="none">
            <Sparkle size={18} color={Colors.lavenderDeep} />
          </View>
        {!isEdit && <Text style={styles.eyebrow}>step three · you</Text>}
        <Text style={styles.heading}>{isEdit ? 'Your profile.' : <>Who are you,{'\n'}in their world?</>}</Text>

        {/* Persona card */}
        <View style={styles.card}>
          {/* Avatar preview */}
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: COLOR_OPTIONS[colorIdx] }]}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.avatarInitial}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
              )}
            </View>
          </View>

          <View style={styles.fieldSpacer} />

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
                  onPress={() => handleColor(i)}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: c,
                      borderWidth: colorIdx === i && !avatar ? 2 : 1.5,
                      borderColor: colorIdx === i && !avatar ? Colors.ink : Colors.line,
                    },
                  ]}
                >
                  {colorIdx === i && !avatar && (
                    <View style={styles.swatchSparkle}>
                      <Sparkle size={9} color={Colors.sakuraDeep} />
                    </View>
                  )}
                </Pressable>
              ))}
              <Pressable
                onPress={pickAvatar}
                style={[
                  styles.colorSwatch,
                  styles.imageSwatch,
                  avatar ? { borderColor: Colors.ink, borderWidth: 2, borderStyle: 'solid' } : null,
                ]}
              >
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.imageSwatchThumb} contentFit="cover" />
                ) : (
                  <Text style={styles.imageSwatchPlus}>+</Text>
                )}
                {!!avatar && (
                  <View style={styles.swatchSparkle}>
                    <Sparkle size={9} color={Colors.sakuraDeep} />
                  </View>
                )}
              </Pressable>
            </Row>
          </Field>
          <Text style={styles.imageHint}>or tap + to use a photo of you</Text>
        </View>

        {/* Reassurance note */}
        {!isEdit && (
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <CalloutBubble tone="pink">
              a self-insert is{'\n'}you in their story.{'\n'}no wrong way.
            </CalloutBubble>
          </View>
        )}
        </View>
      </ScrollView>

      <View style={[styles.actions, column]}>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={name.trim().length === 0}
          onPress={isEdit ? () => router.back() : () => router.push('/onboarding/fo')}
        >
          {!name.trim() ? 'enter your name first' : (isEdit ? 'save changes' : 'continue · meet them')}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: sf(12), color: Colors.ink2, fontFamily: FontFamily.ui },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
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
    fontSize: sf(10),
    color: Colors.sakuraDeep,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heading: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(30),
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
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64, height: 64, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  avatarImg: { width: 64, height: 64, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(28), color: '#fff' },
  avatarBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 22, height: 22, borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep, borderWidth: 2, borderColor: Colors.vellum,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBadgeText: { color: '#fff', fontSize: sf(11), fontFamily: FontFamily.ui, lineHeight: sf(13) },
  avatarHint: { flex: 1, fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3, lineHeight: 15 },
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
  imageSwatch: {
    backgroundColor: Colors.paperDeep,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSwatchThumb: { width: 26, height: 26, borderRadius: Radius.pill },
  imageSwatchPlus: { fontSize: sf(15), color: Colors.ink3, fontFamily: FontFamily.ui, lineHeight: 18 },
  imageHint: { fontFamily: FontFamily.ui, fontSize: sf(9), color: Colors.ink3, marginTop: 8 },
  actions: {
    paddingHorizontal: Spacing.s6,
    paddingBottom: Spacing.s3,
    gap: Spacing.s2,
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
