import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { persistImage } from '@/lib/localMedia';
import { GalleryPicker } from '@/components/profile/GalleryPicker';
import { SexualityPicker } from '@/components/profile/SexualityPicker';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EditSection, styles as editSection } from '@/components/ui/EditSection';
import { Field } from '@/components/ui/Field';
import { IconTrashSolid } from '@/components/ui/Icon';
import { Row } from '@/components/ui/Row';
import { UnderInput } from '@/components/ui/UnderInput';
import { Colors, FontFamily, RelationshipColors, SharingColors, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { Fo, GalleryPhoto } from '@/store/fo';

const PRONOUNS = ['she/her', 'he/him', 'they/them', '+'];
const REL_OPTIONS: { key: Fo['relStatus']; label: string }[] = [
  { key: 'romantic', label: 'romantic' },
  { key: 'platonic', label: 'platonic' },
  { key: 'familial', label: 'familial' },
];
const SHARE_OPTIONS: { key: Fo['shareStatus']; label: string }[] = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
  { key: 'selective', label: 'Selective' },
];

export type FoFormValue = {
  name: string;
  pronouns: string;
  fandom: string;
  relStatus: Fo['relStatus'];
  shareStatus: Fo['shareStatus'];
  bio: string;
  height: string;
  weight: string;
  photoUri: string;
  song: string;
  songLink: string;
  gallery: GalleryPhoto[];
  statusLabel: string;
};

type Props = {
  value: FoFormValue;
  onChange: (v: FoFormValue) => void;
  onSave: () => void;
  saveLabel?: string;
  /** shown as a destructive row below Save — omit to hide (e.g. during creation) */
  onDelete?: () => void;
};

export function FoForm({ value, onChange, onSave, saveLabel = 'save them', onDelete }: Props) {
  function set<K extends keyof FoFormValue>(key: K, v: FoFormValue[K]) {
    onChange({ ...value, [key]: v });
  }

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      // copy out of the picker's cache directory before storing the reference
      set('photoUri', await persistImage(res.assets[0].uri));
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onScrollBeginDrag={() => Keyboard.dismiss()}
    >
      {/* Identity card — mirrors the "me" edit-profile identity block */}
      <View style={styles.identityCard}>
        <View style={styles.avatarRow}>
          <Pressable onPress={pickPhoto} style={[styles.avatar, { backgroundColor: Colors.sakura }]}>
            {value.photoUri ? (
              <Image source={{ uri: value.photoUri }} style={styles.avatarImg} contentFit="cover" />
            ) : (
              <Text style={styles.avatarInitial}>{value.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
            )}
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>+</Text>
            </View>
          </Pressable>
          <View style={styles.avatarHintCol}>
            <Text style={styles.avatarHintTitle}>their portrait</Text>
            <Text style={styles.avatarHint}>tap to add a photo — it shows on their profile card</Text>
          </View>
        </View>

        <View style={styles.fieldSpacer} />

        <Field label="Their name">
          <UnderInput value={value.name} onChangeText={(v) => set('name', v)} placeholder="e.g. Kuroo Tetsurou" />
        </Field>

        <View style={styles.fieldSpacer} />

        <Field label="Pronouns">
          <Row gap={6} wrap>
            {PRONOUNS.map((p) => (
              <Chip
                key={p}
                color={value.pronouns === p ? Colors.sakuraDeep : Colors.ink2}
                bg={value.pronouns === p ? Colors.sakuraSoft : Colors.paperDeep}
                active={value.pronouns === p}
                onPress={() => set('pronouns', p)}
              >
                {p}
              </Chip>
            ))}
          </Row>
        </Field>

        <View style={styles.fieldSpacer} />

        <Field label="Source (fandom, canon, or original)">
          <UnderInput value={value.fandom} onChangeText={(v) => set('fandom', v)} placeholder="e.g. Haikyuu!! · canon" />
        </Field>

        <View style={styles.fieldSpacer} />

        <Field label="Relation status">
          <Row gap={6} wrap>
            {REL_OPTIONS.map((r) => {
              const active = value.relStatus === r.key;
              const color = RelationshipColors[r.key];
              return (
                <Chip
                  key={r.key}
                  color={active ? color : Colors.ink2}
                  bg={active ? `${color}22` : Colors.paperDeep}
                  active={active}
                  onPress={() => set('relStatus', r.key)}
                >
                  {r.label}
                </Chip>
              );
            })}
          </Row>
        </Field>

        <View style={styles.fieldSpacer} />

        <Field label="Sharing status" hint="how open you are to others engaging with them">
          <Row gap={6} wrap>
            {SHARE_OPTIONS.map((s) => {
              const active = value.shareStatus === s.key;
              const color = SharingColors[s.key];
              return (
                <Chip
                  key={s.key}
                  color={active ? color : Colors.ink2}
                  bg={active ? `${color}22` : Colors.paperDeep}
                  active={active}
                  onPress={() => set('shareStatus', s.key)}
                >
                  {s.label}
                </Chip>
              );
            })}
          </Row>
        </Field>
      </View>

      <View style={editSection.sectionsWrap}>
        <EditSection label="about them">
          <TextInput
            value={value.bio}
            onChangeText={(v) => set('bio', v)}
            placeholder="a few soft lines about them…"
            placeholderTextColor={Colors.ink3}
            multiline
            style={styles.bioInput}
          />
        </EditSection>

        <EditSection label="details">
          <Row gap={14}>
            <Field label="Height (optional)" style={{ flex: 1 }}>
              <UnderInput value={value.height} onChangeText={(v) => set('height', v)} placeholder="e.g. 185 cm" />
            </Field>
            <Field label="Weight (optional)" style={{ flex: 1 }}>
              <UnderInput value={value.weight} onChangeText={(v) => set('weight', v)} placeholder="optional" />
            </Field>
          </Row>
        </EditSection>

        <EditSection label="theme song">
          <Field label="Song title">
            <UnderInput value={value.song} onChangeText={(v) => set('song', v)} placeholder="the song that feels like them" />
          </Field>
          <View style={editSection.innerSpacer} />
          <Field label="Song link (optional)" hint="Spotify, YouTube, Apple Music…">
            <UnderInput
              value={value.songLink}
              onChangeText={(v) => set('songLink', v)}
              placeholder="https://…"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </Field>
        </EditSection>

        <EditSection label="sexuality">
          <SexualityPicker value={value.statusLabel} onChange={(v) => set('statusLabel', v)} />
        </EditSection>

        <EditSection label="gallery">
          <GalleryPicker photos={value.gallery} onChange={(g) => set('gallery', g)} />
        </EditSection>
      </View>

      <View style={styles.fieldSpacer2} />

      <Button variant="primary" size="lg" full disabled={!value.name.trim()} onPress={onSave}>
        {value.name.trim() ? saveLabel : 'enter their name first'}
      </Button>

      {onDelete && (
        <Pressable onPress={onDelete} style={styles.deleteRow}>
          <IconTrashSolid size={14} color={Colors.ember} />
          <Text style={styles.deleteText}>let them go</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s2, paddingBottom: Spacing.s6 },
  identityCard: {
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s5,
    ...Shadow.s1,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 84, height: 84, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  avatarImg: { width: 84, height: 84, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(34), color: '#fff' },
  avatarBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 24, height: 24, borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep, borderWidth: 2, borderColor: Colors.vellum,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBadgeText: { color: '#fff', fontSize: sf(13), fontFamily: FontFamily.ui, lineHeight: sf(15) },
  avatarHintCol: { flex: 1, gap: 2 },
  avatarHintTitle: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.4, textTransform: 'uppercase' },
  avatarHint: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3, lineHeight: 15 },
  fieldSpacer: { height: 16 },
  fieldSpacer2: { height: 26 },
  bioInput: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.paperDeep,
    padding: Spacing.s3, minHeight: 88, textAlignVertical: 'top',
    fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink, lineHeight: sf(19),
  },
  deleteRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: Spacing.s4, paddingVertical: Spacing.s3,
  },
  deleteText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.ember },
});
