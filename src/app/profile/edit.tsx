import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { ProfileEditor, type EditField, type EditSectionDef } from '@/components/profile/ProfileEditor';
import { Toggle } from '@/components/ui/Toggle';
import { Colors, FontFamily, sf } from '@/constants/theme';
import { persistImage } from '@/lib/localMedia';
import { readMe, saveMe, type Me } from '@/store/me';
import { useFos } from '@/store/fo';
import { logSyncFailure, pushOwnProfile, syncIdentifyFoPublish, unpublishFoProfile } from '@/store/community';

const PRONOUNS = ['she/her', 'he/him', 'they/them'].map((p) => ({ value: p, label: p }));
const COLORS = [Colors.sakura, Colors.lavender, Colors.sage, Colors.peach, Colors.butter, Colors.plum];

export default function EditProfileScreen() {
  const fos = useFos();
  const [me, setMe] = useState<Me>(readMe);

  /** Every edit lands immediately; "done" is dismissal, never a gate. */
  function patch(p: Partial<Me>) {
    setMe((prev) => ({ ...prev, ...p }));
    saveMe(p);
  }

  function close() {
    Keyboard.dismiss();
    pushOwnProfile().catch(logSyncFailure('push own profile'));
    router.back();
  }

  async function pickAvatar() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true, aspect: [1, 1], quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) patch({ avatar: await persistImage(res.assets[0].uri) });
  }

  function togglePaired(v: boolean) {
    if (!v) {
      const prev = me.identifyFoId;
      patch({ identifyFoId: '' });
      (async () => { await pushOwnProfile(); if (prev) await unpublishFoProfile(prev); })()
        .catch(logSyncFailure('unpair F/O'));
      return;
    }
    const first = fos[0];
    if (!first) return;
    patch({ identifyFoId: first.id });
    (async () => { await syncIdentifyFoPublish(first.id); await pushOwnProfile(); })()
      .catch(logSyncFailure('pair F/O'));
  }

  const pairedName = fos.find((f) => f.id === me.identifyFoId)?.name;

  // name, handle, pronouns and bio are the things people actually come here to
  // change — they sit open under the avatar rather than behind a row you tap.
  const headerFields: EditField[] = [
    { kind: 'text', key: 'name', label: 'name', placeholder: 'your name' },
    { kind: 'text', key: 'username', label: 'username', placeholder: 'handle', autoCapitalize: 'none', autoCorrect: false },
    { kind: 'chips', key: 'pronouns', label: 'pronouns', options: PRONOUNS },
    {
      kind: 'text', key: 'tagline', label: 'bio', placeholder: 'self ship journal ♡',
      multiline: true, maxLength: 80, hint: 'the line or two under your name on your card — symbols welcome',
    },
    { kind: 'swatches', key: 'color', label: 'colour', options: COLORS, clears: 'avatar' },
  ];

  const sections: EditSectionDef[] = [
    {
      id: 'about',
      label: 'about',
      summary: (v) => v.bio || 'not set',
      fields: [{
        kind: 'text', key: 'bio', label: 'about', placeholder: 'a few soft lines about you…',
        multiline: true, hint: 'the longer piece, in its own section under your card',
      }],
    },
    {
      id: 'details',
      label: 'details',
      summary: (v) => [v.height, v.weight].filter(Boolean).join(' · ') || 'not set',
      fields: [
        { kind: 'text', key: 'height', label: 'height', placeholder: 'e.g. 165 cm' },
        { kind: 'text', key: 'weight', label: 'weight', placeholder: 'optional' },
      ],
    },
    {
      id: 'song',
      label: 'theme song',
      summary: (v) => v.song || 'not set',
      fields: [
        { kind: 'text', key: 'song', label: 'song', placeholder: 'the song that feels like you' },
        { kind: 'text', key: 'songLink', label: 'link', placeholder: 'https://…', autoCapitalize: 'none', autoCorrect: false, keyboardType: 'url' },
      ],
    },
    {
      id: 'gallery',
      label: 'gallery',
      summary: (v) => (v.gallery.length ? `${v.gallery.length} photos` : 'none yet'),
      fields: [{ kind: 'gallery', key: 'gallery' }],
    },
    ...(fos.length > 0 ? ([{
      id: 'paired',
      label: 'with your f/o',
      summary: (v) => (v.identifyFoId ? (pairedName || 'on') : 'off'),
      fields: [{
        kind: 'node' as const,
        label: 'show you and your f/o together, with a heart between, on your card',
        render: () => (
          <View style={styles.pairedRow}>
            <Toggle value={!!me.identifyFoId} onValueChange={togglePaired} />
            {!!pairedName && <Text style={styles.pairedName}>with {pairedName}</Text>}
          </View>
        ),
      }],
    }] as EditSectionDef[]) : []),
  ];

  return (
    <ProfileEditor
      title="edit profile"
      value={me}
      onChange={(p) => patch(p as Partial<Me>)}
      sections={sections}
      headerFields={headerFields}
      flagsKey="flags"
      avatar={{
        uri: me.avatar,
        fallbackColor: me.color,
        initial: me.name.trim().charAt(0).toUpperCase(),
        onPick: pickAvatar,
        action: 'change photo',
      }}
      onClose={close}
    />
  );
}

const styles = StyleSheet.create({
  pairedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pairedName: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink2 },
});
