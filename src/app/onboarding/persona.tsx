import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sparkle } from '@/components/deco/Sparkle';
import { StickerSakuraBranch } from '@/components/deco';
import { GalleryPicker } from '@/components/profile/GalleryPicker';
import { SexualityPicker } from '@/components/profile/SexualityPicker';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EditSection, styles as editSection } from '@/components/ui/EditSection';
import { Field } from '@/components/ui/Field';
import { Mark } from '@/components/ui/Mark';
import { Row } from '@/components/ui/Row';
import { StepDots } from '@/components/ui/StepDots';
import { Toggle } from '@/components/ui/Toggle';
import { UnderInput } from '@/components/ui/UnderInput';
import { CalloutBubble } from '@/components/ui';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing ,sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { persistImage } from '@/lib/localMedia';
import { getGlobalSetting, saveGlobalSetting, setOnbField } from '@/store/onboarding';
import { parseGallery, useFos, type GalleryPhoto } from '@/store/fo';
import { logSyncFailure, pushOwnProfile, syncIdentifyFoPublish, unpublishFoProfile } from '@/store/community';

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
  const [bio, setBio] = useState(() => getGlobalSetting('user_bio'));
  const [height, setHeight] = useState(() => getGlobalSetting('user_height'));
  const [weight, setWeight] = useState(() => getGlobalSetting('user_weight'));
  const [song, setSong] = useState(() => getGlobalSetting('user_song'));
  const [songLink, setSongLink] = useState(() => getGlobalSetting('user_song_link'));
  const [gallery, setGallery] = useState<GalleryPhoto[]>(() => parseGallery(getGlobalSetting('user_gallery')));
  const [sexuality, setSexuality] = useState(() => getGlobalSetting('user_status_label'));
  const [identifyFoId, setIdentifyFoId] = useState(() => getGlobalSetting('user_identify_fo_id'));
  const [showFoPicker, setShowFoPicker] = useState(false);
  const fos = useFos();

  const handleNameChange = (v: string) => { setName(v); setOnbField('userName', v); };
  const handleBioChange = (v: string) => { setBio(v); saveGlobalSetting('user_bio', v); };
  const handleHeightChange = (v: string) => { setHeight(v); saveGlobalSetting('user_height', v); };
  const handleWeightChange = (v: string) => { setWeight(v); saveGlobalSetting('user_weight', v); };
  const handleSongChange = (v: string) => { setSong(v); saveGlobalSetting('user_song', v); };
  const handleSongLinkChange = (v: string) => { setSongLink(v); saveGlobalSetting('user_song_link', v); };
  const handleGalleryChange = (g: GalleryPhoto[]) => { setGallery(g); saveGlobalSetting('user_gallery', JSON.stringify(g)); };
  const handleSexualityChange = (v: string) => { setSexuality(v); saveGlobalSetting('user_status_label', v); };
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

  function selectIdentifyFo(id: string) {
    setIdentifyFoId(id);
    saveGlobalSetting('user_identify_fo_id', id);
    setShowFoPicker(false);
    // publish them, then re-push the profile so its identify_fo_id can point at
    // a row that now exists — the reverse order would drop the pairing
    (async () => {
      await syncIdentifyFoPublish(id);
      await pushOwnProfile();
    })().catch(logSyncFailure('pair F/O'));
  }

  function handleIdentifyToggle(v: boolean) {
    if (!v) {
      const prevId = identifyFoId;
      setIdentifyFoId('');
      saveGlobalSetting('user_identify_fo_id', '');
      // clear the profile's pointer before deleting the row it references
      (async () => {
        await pushOwnProfile();
        if (prevId) await unpublishFoProfile(prevId);
      })().catch(logSyncFailure('unpair F/O'));
      return;
    }
    if (fos.length === 1) {
      selectIdentifyFo(fos[0].id);
      return;
    }
    setShowFoPicker(true);
  }

  async function pickAvatar() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      const stored = await persistImage(res.assets[0].uri);
      setAvatar(stored);
      saveGlobalSetting('user_avatar', stored);
      pushOwnProfile().catch(logSyncFailure('push own profile')); // no-op while signed out
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: Spacing.s1 }]}>
      {isEdit ? (
        <View style={[styles.header, column]}>
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
          <StepDots step={1} total={4} />
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, scrollFill]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        <View style={[column, { position: 'relative' }]}>
          <View style={styles.decoTR} pointerEvents="none">
            <StickerSakuraBranch size={60} />
          </View>
          <View style={styles.decoBL} pointerEvents="none">
            <Sparkle size={18} color={Colors.lavenderDeep} />
          </View>
        {!isEdit && <Text style={styles.eyebrow}>step two · you</Text>}
        <Text style={styles.heading}>{isEdit ? 'Your profile.' : <>Who are you,{'\n'}in their world?</>}</Text>

        {/* Persona card */}
        <View style={styles.card}>
          {/* Avatar preview — tappable photo upload */}
          <View style={styles.avatarRow}>
            <Pressable onPress={pickAvatar} style={[styles.avatar, { backgroundColor: COLOR_OPTIONS[colorIdx] }]}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.avatarInitial}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
              )}
              <View style={styles.avatarBadge}>
                <Text style={styles.avatarBadgeText}>+</Text>
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>tap to add a photo of you — or pick a color below instead</Text>
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

        {isEdit && (
          <View style={editSection.sectionsWrap}>
            <EditSection label="about you">
              <TextInput
                value={bio}
                onChangeText={handleBioChange}
                placeholder="a few soft lines about you…"
                placeholderTextColor={Colors.ink3}
                multiline
                style={styles.bioInput}
              />
            </EditSection>

            <EditSection label="details">
              <Row gap={14}>
                <Field label="Height (optional)" style={{ flex: 1 }}>
                  <UnderInput value={height} onChangeText={handleHeightChange} placeholder="e.g. 165 cm" />
                </Field>
                <Field label="Weight (optional)" style={{ flex: 1 }}>
                  <UnderInput value={weight} onChangeText={handleWeightChange} placeholder="optional" />
                </Field>
              </Row>
            </EditSection>

            <EditSection label="theme song">
              <Field label="Song title">
                <UnderInput value={song} onChangeText={handleSongChange} placeholder="the song that feels like you" />
              </Field>
              <View style={editSection.innerSpacer} />
              <Field label="Song link (optional)" hint="Spotify, YouTube, Apple Music…">
                <UnderInput
                  value={songLink}
                  onChangeText={handleSongLinkChange}
                  placeholder="https://…"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </Field>
            </EditSection>

            <EditSection label="sexuality">
              <SexualityPicker value={sexuality} onChange={handleSexualityChange} />
            </EditSection>

            <EditSection label="gallery">
              <GalleryPicker photos={gallery} onChange={handleGalleryChange} />
            </EditSection>

            {fos.length > 0 && (
              <EditSection label="profile identify">
                <Text style={editSection.sectionHint}>
                  show you + your F/O's avatar together, with a heart between, on your profile card
                </Text>
                <View style={editSection.innerSpacer} />
                <Row gap={10}>
                  <Toggle value={!!identifyFoId} onValueChange={handleIdentifyToggle} />
                  {!!identifyFoId && fos.length > 1 && (
                    <Pressable onPress={() => setShowFoPicker(true)}>
                      <Text style={styles.identifyChangeText}>
                        with {fos.find((f) => f.id === identifyFoId)?.name || '…'} ›
                      </Text>
                    </Pressable>
                  )}
                </Row>
              </EditSection>
            )}
          </View>
        )}

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
          onPress={isEdit ? () => { pushOwnProfile().catch(logSyncFailure('push own profile')); router.back(); } : () => router.push('/onboarding/fo')}
        >
          {!name.trim() ? 'enter your name first' : (isEdit ? 'save changes' : 'continue · meet them')}
        </Button>
      </View>

      <Modal visible={showFoPicker} transparent animationType="fade" onRequestClose={() => setShowFoPicker(false)}>
        <Pressable style={styles.pickOverlay} onPress={() => setShowFoPicker(false)} />
        <View style={styles.pickSheetWrap} pointerEvents="box-none">
          <View style={[styles.pickSheet, column]}>
            <Text style={styles.pickTitle}>pair with which F/O?</Text>
            {fos.map((fo) => (
              <Pressable key={fo.id} style={styles.pickRow} onPress={() => selectIdentifyFo(fo.id)}>
                <View style={[styles.pickAvatar, { backgroundColor: Colors.lavender }]}>
                  {fo.photoUri ? (
                    <Image source={{ uri: fo.photoUri }} style={styles.pickAvatarImg} contentFit="cover" />
                  ) : (
                    <Text style={styles.pickAvatarInitial}>{fo.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
                  )}
                </View>
                <Text style={styles.pickRowName}>{fo.name || 'untitled'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
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
  },
  heading: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(30),
    lineHeight: sf(33),
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
  avatarHint: { flex: 1, fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3, lineHeight: sf(15) },
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
  imageSwatchPlus: { fontSize: sf(15), color: Colors.ink3, fontFamily: FontFamily.ui, lineHeight: sf(18) },
  imageHint: { fontFamily: FontFamily.ui, fontSize: sf(9), color: Colors.ink3, marginTop: 8 },
  bioInput: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.paperDeep,
    padding: Spacing.s3, minHeight: 76, textAlignVertical: 'top',
    fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink, lineHeight: sf(19),
  },
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
  identifyChangeText: {
    fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.sakuraDeep,
  },
  pickOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pickSheetWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', padding: Spacing.s6,
  },
  pickSheet: {
    width: '100%', maxWidth: 360,
    backgroundColor: Colors.paper, borderRadius: Radius.r4,
    padding: Spacing.s5, gap: 4,
    ...Shadow.s2,
  },
  pickTitle: {
    fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: Colors.ink,
    textAlign: 'center', marginBottom: Spacing.s3,
  },
  pickRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: Spacing.s3, paddingHorizontal: Spacing.s2,
    borderRadius: Radius.r3,
  },
  pickAvatar: {
    width: 40, height: 40, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  pickAvatarImg: { width: 40, height: 40, borderRadius: Radius.pill },
  pickAvatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: '#fff' },
  pickRowName: { fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.ink },
});
