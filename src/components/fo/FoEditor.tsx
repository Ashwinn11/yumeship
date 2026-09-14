import * as ImagePicker from 'expo-image-picker';
import { Pressable, StyleSheet, Text } from 'react-native';

import { BlinkieWallEditor } from '@/components/profile/BlinkieWallEditor';
import { ProfileEditor, type EditField, type EditSectionDef } from '@/components/profile/ProfileEditor';
import { ProfileFlagsEditor } from '@/components/profile/ProfileFlagsEditor';
import { ProfileLinksEditor } from '@/components/profile/ProfileLinksEditor';
import { ProfileSongsEditor } from '@/components/profile/ProfileSongsEditor';
import { DateField } from '@/components/ui/DateField';
import { Colors, FontFamily, Radius, REL_ORDER, RelationshipColors, RelationshipLabels, SHARING_ORDER, SharingColors, SharingLabels, Spacing, sf } from '@/constants/theme';
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
  'name' | 'pronouns' | 'fandom' | 'relStatus' | 'shareStatus' | 'tagline' | 'about' | 'color'
  | 'sinceDate' | 'photoUri' | 'songs' | 'gallery' | 'flags' | 'links' | 'blinkies'
>;

export const ABOUT_MAX = 1000;

export function FoEditor({
  value,
  onChange,
  onClose,
  onDone,
  onDelete,
  mode = 'edit',
  notice,
  premium,
}: {
  value: FoDraft;
  onChange: (patch: Partial<FoDraft>) => void;
  onClose: () => void;
  /** creation commits explicitly; editing saves as it goes */
  onDone?: () => void;
  onDelete?: () => void;
  mode?: 'edit' | 'create';
  notice?: string;
  /** gates the blinkie wall's premium-only badges, same convention as CardThemeSheet */
  premium: boolean;
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
    // avatar tint, not a relationship attribute — lives with the rest of the identity fields
    { kind: 'swatches', key: 'color', label: 'their colour', options: FO_COLORS, clears: 'photoUri' },
  ];

  const sections: EditSectionDef[] = [
    {
      id: 'about',
      label: 'about',
      summary: (v) => v.about || 'not set',
      fields: [{
        kind: 'text', key: 'about', label: 'about', placeholder: 'the longer version — backstory, why them, anything else',
        multiline: true, maxLength: ABOUT_MAX,
      }],
    },
    {
      id: 'blinkies',
      label: 'blinkie wall',
      summary: (v) => (v.blinkies.length ? `${v.blinkies.length} equipped` : 'none yet'),
      fields: [{
        kind: 'node', render: () => (
          <BlinkieWallEditor selected={value.blinkies} onChange={(blinkies) => onChange({ blinkies })} premium={premium} />
        ),
      }],
    },
    {
      id: 'flags',
      label: 'flags',
      summary: (v) => (v.flags.length ? `${v.flags.length} flag${v.flags.length === 1 ? '' : 's'}` : 'none yet'),
      fields: [{
        kind: 'node', label: 'flags', render: () => (
          <ProfileFlagsEditor flags={value.flags} onChange={(flags) => onChange({ flags })} />
        ),
      }],
    },
    {
      id: 'relationship',
      label: 'relationship',
      summary: (v) => `${v.relStatus} · sharing ${v.shareStatus}`,
      fields: [
        { kind: 'chips', key: 'relStatus', label: 'relation', options: REL, allowCustom: true, customPlaceholder: 'e.g. engaged, married, it\'s complicated…' },
        { kind: 'chips', key: 'shareStatus', label: 'sharing', options: SHARE, allowCustom: true, customPlaceholder: 'e.g. mirror sharing, DTKH…' },
        {
          kind: 'node', label: 'together since', render: () => (
            <DateField
              value={value.sinceDate}
              onChange={(v) => onChange({ sinceDate: v })}
              editing
              placeholder="e.g. 2024-03-15"
              style={styles.sinceInput}
              textStyle={{ fontFamily: FontFamily.ui, fontSize: sf(14), color: value.sinceDate ? Colors.ink : Colors.ink3 }}
            />
          ),
        },
      ],
    },
    {
      id: 'songs',
      label: 'theme songs',
      summary: (v) => (v.songs.length ? `${v.songs.length} song${v.songs.length === 1 ? '' : 's'}` : 'none yet'),
      fields: [{
        kind: 'node', label: 'songs', render: () => (
          <ProfileSongsEditor songs={value.songs} onChange={(songs) => onChange({ songs })} />
        ),
      }],
    },
    {
      id: 'gallery',
      label: 'gallery',
      summary: (v) => (v.gallery.length ? `${v.gallery.length} photos` : 'none yet'),
      fields: [{ kind: 'gallery', key: 'gallery' }],
    },
    {
      id: 'links',
      label: 'links',
      summary: (v) => (v.links.length ? `${v.links.length} link${v.links.length === 1 ? '' : 's'}` : 'none yet'),
      fields: [{
        kind: 'node', label: 'links', render: () => (
          <ProfileLinksEditor links={value.links} onChange={(links) => onChange({ links })} />
        ),
      }],
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
  sinceInput: {
    height: 40, justifyContent: 'center', alignSelf: 'stretch',
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    paddingVertical: 8, paddingHorizontal: 12, backgroundColor: Colors.vellum,
  },
});
