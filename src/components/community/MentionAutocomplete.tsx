import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import { searchUsernames, type UsernameMatch } from '@/store/community';

/**
 * The @token immediately before the cursor, if the caller is mid-mention —
 * e.g. typing "hey @ri" with the cursor right after "ri" returns "ri"; a
 * finished word (a space typed after it) or no "@" at all returns null.
 */
export function activeMentionToken(text: string, cursor: number): string | null {
  const uptoCursor = text.slice(0, Math.max(0, cursor));
  const at = uptoCursor.lastIndexOf('@');
  if (at === -1) return null;
  const token = uptoCursor.slice(at + 1);
  if (!/^[a-zA-Z0-9_]*$/.test(token)) return null;
  return token;
}

/** Splices `@username ` into `text` in place of the active token — see
 *  activeMentionToken. Callers apply the returned text and move on; the
 *  returned cursor is informational only (RN's TextInput moves its own
 *  cursor to the end of a programmatically-changed value, so nothing here
 *  tries to fight that). */
export function applyMention(text: string, cursor: number, username: string): { text: string; cursor: number } {
  const uptoCursor = text.slice(0, Math.max(0, cursor));
  const at = uptoCursor.lastIndexOf('@');
  if (at === -1) return { text, cursor };
  const inserted = `@${username} `;
  const next = text.slice(0, at) + inserted + text.slice(cursor);
  return { text: next, cursor: at + inserted.length };
}

type Props = {
  value: string;
  selection: number;
  onPick: (next: { text: string; cursor: number }) => void;
};

/**
 * @mention suggestion list for a composer's TextInput. Renders inline,
 * directly below wherever it's placed — nothing while no "@token" is active
 * or while the token has no matches, so it never reserves layout space it
 * isn't using.
 */
export function MentionAutocomplete({ value, selection, onPick }: Props) {
  const token = activeMentionToken(value, selection);
  const [matches, setMatches] = useState<UsernameMatch[]>([]);

  useEffect(() => {
    if (token === null) {
      setMatches([]);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      const res = await searchUsernames(token);
      if (!cancelled) setMatches(res);
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [token]);

  if (token === null || matches.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {matches.map((m) => (
        <Pressable key={m.id} style={styles.row} onPress={() => onPick(applyMention(value, selection, m.username))}>
          <View style={styles.avatar}>
            {m.avatarUrl ? (
              <Image source={{ uri: m.avatarUrl }} style={styles.avatarImg} contentFit="cover" {...AVATAR_IMAGE} />
            ) : (
              <Text style={styles.avatarInitial}>{(m.name || m.username).trim().charAt(0).toUpperCase() || '♡'}</Text>
            )}
          </View>
          <View style={styles.textCol}>
            <Text style={styles.username} numberOfLines={1}>@{m.username}</Text>
            {!!m.name && <Text style={styles.name} numberOfLines={1}>{m.name}</Text>}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const AVATAR_SIZE = 28;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r3,
    marginTop: 6,
    overflow: 'hidden',
    ...Shadow.s1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: Spacing.s3 },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.sakura, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(12), color: '#fff' },
  textCol: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  username: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink, flexShrink: 0 },
  name: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3, flexShrink: 1 },
});
