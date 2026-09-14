import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Heart } from '@/components/deco/Heart';
import { ProfileEditor, type EditField, type EditSectionDef } from '@/components/profile/ProfileEditor';
import { ProfileFlagsEditor } from '@/components/profile/ProfileFlagsEditor';
import { ProfileLinksEditor } from '@/components/profile/ProfileLinksEditor';
import { Toggle } from '@/components/ui/Toggle';
import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import { persistImage } from '@/lib/localMedia';
import { readMe, saveMe, type Me } from '@/store/me';
import { useFos } from '@/store/fo';
import { logSyncFailure, pushOwnProfile, syncIdentifyFoPublish } from '@/store/community';

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

  // one control, one job: pairing is a choice among "none" + every f/o, so
  // it's a single list with "none" as one of its rows, not a toggle plus a
  // separate list fighting to represent the same state
  function choosePaired(id: string) {
    if (!id) {
      // unpairing only clears *your* identify_fo_id — it says nothing about
      // whether the f/o's own profile stays published. Unpublishing them here
      // used to sever every already-posted post's f/o tag (the embed is gated
      // by the f/o's own is_public) and pull them off their own profile page,
      // for a toggle that was only ever about your card, not their history.
      patch({ identifyFoId: '' });
      pushOwnProfile().catch(logSyncFailure('unpair F/O'));
      return;
    }
    patch({ identifyFoId: id });
    // publish them, then re-push the profile so its identify_fo_id can point
    // at a row that now exists — the reverse order would drop the pairing
    (async () => { await syncIdentifyFoPublish(id); await pushOwnProfile(); })()
      .catch(logSyncFailure('pair F/O'));
  }

  // the toggle only makes sense with exactly one f/o — a genuine binary
  // choice. With more than one, choosePaired's list is the only control.
  function togglePaired(v: boolean) {
    choosePaired(v ? fos[0]?.id ?? '' : '');
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
      id: 'flags',
      label: 'flags',
      summary: (v) => (v.flags.length ? `${v.flags.length} flag${v.flags.length === 1 ? '' : 's'}` : 'none yet'),
      fields: [{
        kind: 'node', label: 'flags', render: () => (
          <ProfileFlagsEditor flags={me.flags} onChange={(flags) => patch({ flags })} />
        ),
      }],
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
    {
      id: 'links',
      label: 'links',
      summary: (v) => (v.links.length ? `${v.links.length} link${v.links.length === 1 ? '' : 's'}` : 'none yet'),
      fields: [{
        kind: 'node', label: 'links', render: () => (
          <ProfileLinksEditor links={me.links} onChange={(links) => patch({ links })} />
        ),
      }],
    },
    ...(fos.length > 0 ? ([{
      id: 'paired',
      label: 'with your f/o',
      summary: (v) => (v.identifyFoId ? (pairedName || 'on') : 'off'),
      fields: [{
        kind: 'node' as const,
        label: 'show you and your f/o together, with a heart between, on your card',
        render: () => (
          fos.length <= 1 ? (
            // a genuine binary choice with nothing to pick between — a toggle
            // is the honest control here
            <View style={styles.pairedRow}>
              <Toggle value={!!me.identifyFoId} onValueChange={togglePaired} />
              {!!pairedName && <Text style={styles.pairedName}>with {pairedName}</Text>}
            </View>
          ) : (
            // more than one f/o: a horizontal tray of avatars, same idiom as
            // the "your f/os" strip on the profile screen itself — scrolls to
            // any count with no height games, and the selected one gets a
            // heart badge instead of a generic checkmark, since a heart
            // between you and them is literally what this feature draws
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foPickerRow}>
              <Pressable style={styles.foPickerItem} onPress={() => choosePaired('')}>
                <View style={[styles.foPickerAvatarWrap, !me.identifyFoId && styles.foPickerAvatarWrapSelected]}>
                  <View style={styles.foPickerAvatarNone}>
                    <Text style={styles.foPickerNoneGlyph}>—</Text>
                  </View>
                  {!me.identifyFoId && (
                    <View style={styles.foPickerHeartBadge}>
                      <Heart size={11} color={Colors.sakuraDeep} />
                    </View>
                  )}
                </View>
                <Text style={[styles.foPickerLabel, !me.identifyFoId && styles.foPickerLabelSelected]} numberOfLines={1}>
                  none
                </Text>
              </Pressable>
              {fos.map((fo) => {
                const selected = fo.id === me.identifyFoId;
                return (
                  <Pressable key={fo.id} style={styles.foPickerItem} onPress={() => choosePaired(fo.id)}>
                    <View style={[styles.foPickerAvatarWrap, selected && styles.foPickerAvatarWrapSelected]}>
                      <View style={[styles.foPickerAvatar, { backgroundColor: Colors.lavender }]}>
                        {fo.photoUri ? (
                          <Image source={{ uri: fo.photoUri }} style={styles.foPickerAvatarImg} contentFit="cover" />
                        ) : (
                          <Text style={styles.foPickerInitial}>{fo.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
                        )}
                      </View>
                      {selected && (
                        <View style={styles.foPickerHeartBadge}>
                          <Heart size={11} color={Colors.sakuraDeep} />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.foPickerLabel, selected && styles.foPickerLabelSelected]} numberOfLines={1}>
                      {fo.name || 'untitled'}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )
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

const AVATAR_TRAY_SIZE = 56;

const styles = StyleSheet.create({
  pairedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pairedName: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink2 },

  // the whole control when there's more than one f/o — a horizontal tray,
  // same idiom as the "your f/os" strip elsewhere, not a settings list
  foPickerRow: { flexDirection: 'row', gap: 14, paddingVertical: 2 },
  foPickerItem: { width: 68, alignItems: 'center', gap: 6 },
  // the ring is always laid out, transparent until selected — a border/padding
  // that only appears on selection would grow the avatar and shove its
  // neighbours over every time the choice changes
  foPickerAvatarWrap: {
    borderWidth: 2, borderColor: 'transparent', borderRadius: (AVATAR_TRAY_SIZE + 6) / 2, padding: 1,
  },
  foPickerAvatarWrapSelected: { borderColor: Colors.sakuraDeep },
  foPickerAvatar: {
    width: AVATAR_TRAY_SIZE, height: AVATAR_TRAY_SIZE, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  foPickerAvatarNone: {
    width: AVATAR_TRAY_SIZE, height: AVATAR_TRAY_SIZE, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.paperDeep, borderWidth: 1.4, borderColor: Colors.line, borderStyle: 'dashed',
  },
  foPickerNoneGlyph: { fontSize: sf(18), color: Colors.ink3, fontFamily: FontFamily.ui },
  foPickerAvatarImg: { width: AVATAR_TRAY_SIZE, height: AVATAR_TRAY_SIZE, borderRadius: Radius.pill },
  foPickerInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(20), color: '#fff' },
  // sits over the avatar's own corner rather than floating beside it — the
  // same "one badge marks the chosen one" language the pin badge uses elsewhere
  foPickerHeartBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: Radius.pill,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.sakuraDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  foPickerLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink3, maxWidth: 68 },
  foPickerLabelSelected: { color: Colors.sakuraDeep, fontFamily: FontFamily.uiSemiBold },
});
