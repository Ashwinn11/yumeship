import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { newId } from '@/db/client';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { SONGS_MAX, SONG_TITLE_MAX, type ProfileSong } from './cardTheme';

/** Songs shown as chips, each tappable to edit in place — same shape as
 *  ProfileLinksEditor: every keystroke auto-saves, no separate "add"/"done"
 *  button, tapping outside (or the chip again) never means "discard". A song
 *  only needs a title to be worth keeping; the link is optional. */
export function ProfileSongsEditor({
  songs,
  onChange,
}: {
  songs: ProfileSong[];
  onChange: (songs: ProfileSong[]) => void;
}) {
  const [draft, setDraft] = useState<ProfileSong | null>(null);
  const isNew = !!draft && !songs.some((s) => s.id === draft.id);

  function openNew() {
    setDraft({ id: newId(), title: '', link: '' });
  }

  function edit(s: ProfileSong) {
    setDraft(s);
  }

  function close() {
    setDraft(null);
  }

  function updateDraft(patch: Partial<ProfileSong>) {
    if (!draft) return;
    const next = { ...draft, ...patch };
    setDraft(next);
    const hasTitle = !!next.title.trim();
    const existsInList = songs.some((s) => s.id === next.id);
    if (!hasTitle) {
      if (existsInList) onChange(songs.filter((s) => s.id !== next.id));
      return;
    }
    onChange(existsInList ? songs.map((s) => (s.id === next.id ? next : s)) : [...songs, next].slice(0, SONGS_MAX));
  }

  function remove() {
    if (!draft) return;
    onChange(songs.filter((s) => s.id !== draft.id));
    close();
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.chipRow}>
        {songs.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => (draft?.id === s.id ? close() : edit(s))}
            style={[styles.chip, draft?.id === s.id && styles.chipActive]}
          >
            <Text style={styles.chipText} numberOfLines={1}>{s.title}</Text>
          </Pressable>
        ))}
        {songs.length < SONGS_MAX && (
          <Pressable onPress={() => (draft && isNew ? close() : openNew())} style={styles.addChip}>
            <Text style={styles.addChipText}>+ song</Text>
          </Pressable>
        )}
      </View>

      {draft && (
        <View style={styles.editorCol}>
          <TextInput
            value={draft.title}
            onChangeText={(v) => updateDraft({ title: v })}
            placeholder="song title"
            placeholderTextColor={Colors.ink3}
            maxLength={SONG_TITLE_MAX}
            style={styles.textInput}
            autoFocus={isNew}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          <View style={styles.editorRow}>
            <TextInput
              value={draft.link}
              onChangeText={(v) => updateDraft({ link: v })}
              placeholder="https://… (optional)"
              placeholderTextColor={Colors.ink3}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              style={[styles.textInput, styles.linkInput]}
            />
            {!isNew && (
              <Pressable onPress={remove} style={styles.removeBadge} hitSlop={6} accessibilityLabel="Remove this song">
                <Text style={styles.removeBadgeText}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep,
    borderWidth: 1, borderColor: Colors.line,
    maxWidth: '100%',
  },
  chipActive: { borderColor: Colors.sakuraDeep, backgroundColor: Colors.sakuraSoft },
  chipText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink },
  addChip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1.4, borderColor: Colors.line, borderStyle: 'dashed',
  },
  addChipText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3 },

  editorCol: { gap: 8 },
  editorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textInput: {
    height: 38,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    backgroundColor: Colors.vellum,
    paddingHorizontal: Spacing.s3,
    fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink,
  },
  linkInput: { flex: 1 },
  removeBadge: {
    width: 38, height: 38, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  removeBadgeText: { color: Colors.ink3, fontSize: sf(11), fontFamily: FontFamily.ui },
});
