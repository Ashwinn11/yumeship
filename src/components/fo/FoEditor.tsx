import * as ImagePicker from 'expo-image-picker';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ProfileEditor, type EditField, type EditSectionDef } from '@/components/profile/ProfileEditor';
import { Colors, FontFamily, REL_ORDER, RelationshipColors, RelationshipLabels, SHARING_ORDER, SharingColors, SharingLabels, Spacing, sf } from '@/constants/theme';
import { persistImage } from '@/lib/localMedia';
import type { Fo } from '@/store/fo';

// The F/O side of the same editor the "me" profile uses — identical experience,
// different fields. An F/O has a source, a relationship and a sharing stance;
// a person has a handle and a pairing. Everything else they share.

const PRONOUNS = ['she/her', 'he/him', 'they/them'].map((p) => ({ value: p, label: p }));
const FO_COLORS = [Colors.sakura, Colors.lavender, Colors.sage, Colors.peach, Colors.butter, Colors.plum];
const REL = REL_ORDER.map((v) => ({ value: v, label: RelationshipLabels[v], color: RelationshipColors[v] }));
const SHARE = SHARING_ORDER.map((v) => ({ value: v, label: SharingLabels[v], color: SharingColors[v] }));

export type FoDraft = Pick<
  Fo,
  'name' | 'pronouns' | 'fandom' | 'relStatus' | 'shareStatus' | 'bio' | 'tagline' | 'color'
  | 'height' | 'weight' | 'age' | 'birthday' | 'photoUri' | 'song' | 'songLink' | 'gallery' | 'flags'
>;

export function FoEditor({
  value,
  onChange,
  onClose,
  onDone,
  onDelete,
  mode = 'edit',
  notice,
}: {
  value: FoDraft;
  onChange: (patch: Partial<FoDraft>) => void;
  onClose: () => void;
  /** creation commits explicitly; editing saves as it goes */
  onDone?: () => void;
  onDelete?: () => void;
  mode?: 'edit' | 'create';
  notice?: string;
}) {
  const creating = mode === 'create';
  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true, aspect: [1, 1], quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) onChange({ photoUri: await persistImage(res.assets[0].uri) });
  }

  const headerFields: EditField[] = [
    { kind: 'text', key: 'name', label: 'their name', placeholder: 'e.g. Kuroo Tetsurou' },
    { kind: 'chips', key: 'pronouns', label: 'pronouns', options: PRONOUNS },
    { kind: 'text', key: 'fandom', label: 'source', placeholder: 'e.g. Haikyuu!! · canon' },
    {
      kind: 'text', key: 'tagline', label: 'bio', placeholder: 'my beloved ♡',
      multiline: true, maxLength: 80, hint: 'the line or two under their name on their card',
    },
  ];

  const sections: EditSectionDef[] = [
    {
      id: 'relationship',
      label: 'relationship',
      summary: (v) => `${v.relStatus} · sharing ${v.shareStatus}`,
      fields: [
        { kind: 'chips', key: 'relStatus', label: 'relation', options: REL },
        { kind: 'chips', key: 'shareStatus', label: 'sharing', options: SHARE },
        { kind: 'swatches', key: 'color', label: 'their colour', options: FO_COLORS, clears: 'photoUri' },
      ],
    },
    {
      id: 'about',
      label: 'about them',
      summary: (v) => v.bio || 'not set',
      fields: [{ kind: 'text', key: 'bio', label: 'about them', placeholder: 'a few soft lines about them…', multiline: true }],
    },
    {
      id: 'details',
      label: 'details',
      summary: (v) => [v.age, v.birthday, v.height, v.weight].filter(Boolean).join(' · ') || 'not set',
      fields: [
        { kind: 'text', key: 'age', label: 'age', placeholder: 'e.g. 19' },
        { kind: 'text', key: 'birthday', label: 'birthday', placeholder: 'e.g. March 3' },
        { kind: 'text', key: 'height', label: 'height', placeholder: 'optional' },
        { kind: 'text', key: 'weight', label: 'weight', placeholder: 'optional' },
      ],
    },
    {
      id: 'song',
      label: 'theme song',
      summary: (v) => v.song || 'not set',
      fields: [
        { kind: 'text', key: 'song', label: 'song', placeholder: 'the song that feels like them' },
        { kind: 'text', key: 'songLink', label: 'link', placeholder: 'https://…', autoCapitalize: 'none', autoCorrect: false, keyboardType: 'url' },
      ],
    },
    {
      id: 'gallery',
      label: 'gallery',
      summary: (v) => (v.gallery.length ? `${v.gallery.length} photos` : 'none yet'),
      fields: [{ kind: 'gallery', key: 'gallery' }],
    },
  ];

  return (
    <ProfileEditor
      title={creating ? 'new f/o' : 'edit f/o'}
      doneLabel={creating ? 'add them ♡' : 'done'}
      onDone={onDone}
      notice={notice}
      value={value}
      onChange={(p) => onChange(p as Partial<FoDraft>)}
      sections={sections}
      headerFields={headerFields}
      flagsKey="flags"
      avatar={{
        uri: value.photoUri,
        fallbackColor: value.color || Colors.sakura,
        initial: value.name.trim().charAt(0).toUpperCase(),
        onPick: pickPhoto,
        action: 'change photo',
      }}
      onClose={onClose}
      footer={onDelete ? (
        <Pressable onPress={onDelete} style={styles.deleteRow}>
          <Text style={styles.deleteText}>delete this f/o</Text>
        </Pressable>
      ) : undefined}
    />
  );
}

const styles = StyleSheet.create({
  deleteRow: { alignItems: 'center', paddingVertical: Spacing.s4 },
  deleteText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.ember },
});
