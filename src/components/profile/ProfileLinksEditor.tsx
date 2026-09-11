import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { newId } from '@/db/client';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { LINKS_MAX, LINK_LABEL_MAX, type ProfileLink } from './cardTheme';

/** Links shown as chips, each tappable to edit and removable in place — same
 *  add/edit/remove shape as ProfileFlagsEditor, just a label + a url instead
 *  of a flag swatch + words. */
export function ProfileLinksEditor({
  links,
  onChange,
}: {
  links: ProfileLink[];
  onChange: (links: ProfileLink[]) => void;
}) {
  const [draft, setDraft] = useState<ProfileLink | null>(null);
  const isNew = !!draft && !links.some((l) => l.id === draft.id);

  function openNew() {
    setDraft({ id: newId(), label: '', url: '' });
  }

  function edit(l: ProfileLink) {
    setDraft(l);
  }

  function cancel() {
    setDraft(null);
  }

  function save() {
    if (!draft) return;
    if (!draft.url.trim()) {
      // nothing was actually entered — don't leave an empty chip behind
      setDraft(null);
      return;
    }
    onChange(isNew ? [...links, draft].slice(0, LINKS_MAX) : links.map((l) => (l.id === draft.id ? draft : l)));
    cancel();
  }

  function remove(id: string) {
    onChange(links.filter((l) => l.id !== id));
    cancel();
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.chipRow}>
        {links.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => (draft?.id === l.id ? cancel() : edit(l))}
            style={[styles.chip, draft?.id === l.id && styles.chipActive]}
          >
            <Text style={styles.chipText} numberOfLines={1}>{l.label || l.url}</Text>
          </Pressable>
        ))}
        {links.length < LINKS_MAX && (
          <Pressable onPress={() => (draft && isNew ? cancel() : openNew())} style={styles.addChip}>
            <Text style={styles.addChipText}>{draft && isNew ? 'cancel' : '+ link'}</Text>
          </Pressable>
        )}
      </View>

      {draft && (
        <View style={styles.editorCol}>
          <TextInput
            value={draft.label}
            onChangeText={(v) => setDraft({ ...draft, label: v })}
            placeholder="label, e.g. Instagram"
            placeholderTextColor={Colors.ink3}
            maxLength={LINK_LABEL_MAX}
            style={styles.textInput}
            autoFocus={isNew}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          <View style={styles.editorRow}>
            <TextInput
              value={draft.url}
              onChangeText={(v) => setDraft({ ...draft, url: v })}
              placeholder="https://…"
              placeholderTextColor={Colors.ink3}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              style={[styles.textInput, styles.urlInput]}
            />
            <Pressable onPress={save} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>{isNew ? 'add' : 'done'}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {draft && !isNew && (
        <Pressable onPress={() => remove(draft.id)} hitSlop={6}>
          <Text style={styles.removeText}>remove this link</Text>
        </Pressable>
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
  urlInput: { flex: 1 },
  doneBtn: {
    height: 38, paddingHorizontal: Spacing.s4,
    borderRadius: Radius.pill, backgroundColor: Colors.sakuraDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  doneBtnText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12.5), color: '#fff' },

  removeText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ember, alignSelf: 'center' },
});
