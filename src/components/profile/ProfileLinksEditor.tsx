import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { newId } from '@/db/client';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { LINKS_MAX, LINK_LABEL_MAX, type ProfileLink } from './cardTheme';

/** Links shown as chips, each tappable to edit in place. Matches the parent
 *  editor's own convention: every keystroke auto-saves, there's no separate
 *  "add"/"done" button to press, and tapping outside (or the chip again)
 *  never means "discard" — nothing here is ever left uncommitted to lose. */
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

  function close() {
    setDraft(null);
  }

  // a new link only joins the real list once it has a url worth keeping —
  // and drops back out if that url is cleared back to empty — so every
  // keystroke can write straight through with nothing left to "confirm"
  function updateDraft(patch: Partial<ProfileLink>) {
    if (!draft) return;
    const next = { ...draft, ...patch };
    setDraft(next);
    const hasUrl = !!next.url.trim();
    const existsInList = links.some((l) => l.id === next.id);
    if (!hasUrl) {
      if (existsInList) onChange(links.filter((l) => l.id !== next.id));
      return;
    }
    onChange(existsInList ? links.map((l) => (l.id === next.id ? next : l)) : [...links, next].slice(0, LINKS_MAX));
  }

  function remove() {
    if (!draft) return;
    onChange(links.filter((l) => l.id !== draft.id));
    close();
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.chipRow}>
        {links.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => (draft?.id === l.id ? close() : edit(l))}
            style={[styles.chip, draft?.id === l.id && styles.chipActive]}
          >
            <Text style={styles.chipText} numberOfLines={1}>{l.label || l.url}</Text>
          </Pressable>
        ))}
        {links.length < LINKS_MAX && (
          // same control the whole time — an empty, still-uncommitted draft
          // just closes back up on a second tap, but it never relabels
          // itself "cancel"; there's nothing to cancel, only to close
          <Pressable onPress={() => (draft && isNew ? close() : openNew())} style={styles.addChip}>
            <Text style={styles.addChipText}>+ link</Text>
          </Pressable>
        )}
      </View>

      {draft && (
        <View style={styles.editorCol}>
          <TextInput
            value={draft.label}
            onChangeText={(v) => updateDraft({ label: v })}
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
              onChangeText={(v) => updateDraft({ url: v })}
              placeholder="https://…"
              placeholderTextColor={Colors.ink3}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              style={[styles.textInput, styles.urlInput]}
            />
            {/* same small ✕-badge GalleryPicker already uses for its own
                remove action, not a third pattern for the same job */}
            {!isNew && (
              <Pressable onPress={remove} style={styles.removeBadge} hitSlop={6} accessibilityLabel="Remove this link">
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
  urlInput: { flex: 1 },
  removeBadge: {
    width: 38, height: 38, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  removeBadgeText: { color: Colors.ink3, fontSize: sf(11), fontFamily: FontFamily.ui },
});
