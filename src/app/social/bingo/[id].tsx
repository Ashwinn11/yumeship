import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BingoGrid } from '@/components/bingo/BingoGrid';
import { useIPad } from '@/hooks/use-ipad';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { clearBingoMarks, type BingoCard } from '@/lib/bingo';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { createPost, fetchPost } from '@/store/community';
import { getGlobalSetting } from '@/store/onboarding';

const MAX_BODY = 4000;

/**
 * "Use this template" lands here, not in the composer — using someone's card
 * is purely marking, never editing. The 25 prompts and the look are fixed,
 * carried over exactly as posted; the only thing you get to change is which
 * squares are true for you. To write your own prompts from scratch, that's
 * the composer's Bingo tab, a separate and deliberate choice.
 */
export default function UseBingoTemplateScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { id } = useLocalSearchParams<{ id: string }>();

  const identifyFoId = getGlobalSetting('user_identify_fo_id');
  const me = {
    name: getGlobalSetting('user_name'),
    avatar: getGlobalSetting('user_avatar'),
    color: getGlobalSetting('user_color') || Colors.sakura,
  };

  const [card, setCard] = useState<BingoCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  // same 25 prompts and the same marker/background as the source post, every
  // mark wiped so this starts as a blank copy, not the original poster's board
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const src = await fetchPost(id);
      if (cancelled) return;
      if (src?.bingo) setCard({ ...src.bingo, cells: clearBingoMarks(src.bingo.cells) });
      else setNotFound(true);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  function toggle(i: number) {
    setCard((prev) => prev && { ...prev, cells: prev.cells.map((c, j) => (j === i ? { ...c, marked: !c.marked } : c)) });
  }

  const canPost = !!card && !posting;
  const remaining = MAX_BODY - body.length;

  async function submit() {
    if (!card || posting) return;
    setPosting(true);
    setError('');
    try {
      await createPost({ body, media: [], bingo: card, foProfileId: identifyFoId || undefined });
      router.canGoBack() ? router.back() : router.replace('/(tabs)/community' as any);
    } catch (e: any) {
      setError(e?.message ?? 'something went wrong — try again');
    } finally {
      setPosting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, column, { paddingTop: insets.top + Spacing.s1 }]}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/community' as any))} hitSlop={8}>
          <Text style={styles.cancel}>cancel</Text>
        </Pressable>
        <Pressable
          onPress={submit}
          disabled={!canPost}
          style={({ pressed }) => [
            styles.postBtn,
            !canPost && styles.postBtnDisabled,
            pressed && canPost && styles.postBtnPressed,
          ]}
        >
          {posting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.postBtnText}>post</Text>}
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerFill}><ActivityIndicator color={Colors.sakuraDeep} /></View>
      ) : notFound || !card ? (
        <View style={styles.centerFill}><Text style={styles.notFoundText}>this card isn't available anymore</Text></View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, column]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.kindLabel}>mark what's true for you and your F/O, then post it</Text>

          <View style={styles.composerRow}>
            <View style={[styles.avatar, { backgroundColor: me.color }]}>
              {me.avatar ? (
                <Image source={{ uri: me.avatar }} style={styles.avatarImg} contentFit="cover" {...AVATAR_IMAGE} />
              ) : (
                <Text style={styles.avatarInitial}>{me.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
              )}
            </View>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="say something about your card (optional)"
              placeholderTextColor={Colors.ink3}
              multiline
              maxLength={MAX_BODY}
              style={styles.bodyInput}
            />
          </View>

          <View style={styles.gridWrap}>
            <BingoGrid card={card} onToggle={toggle} />
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
      )}

      {!loading && !notFound && remaining < 200 && (
        <Text style={[styles.counter, remaining < 0 && styles.counterOver]}>{remaining}</Text>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s3,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  cancel: { fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink2 },
  postBtn: {
    minWidth: 68, height: 34, borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.s4,
  },
  postBtnDisabled: { opacity: 0.35 },
  postBtnPressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
  postBtnText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: '#fff' },

  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.s6 },
  notFoundText: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3, textAlign: 'center' },

  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s6 },

  kindLabel: {
    fontFamily: FontFamily.uiMedium, fontSize: sf(11.5), color: Colors.sakuraDeep,
    marginBottom: Spacing.s3, lineHeight: sf(16),
  },

  composerRow: { flexDirection: 'row', gap: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 38, height: 38, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: '#fff' },
  bodyInput: {
    flex: 1, minHeight: 44, paddingTop: 8, textAlignVertical: 'top',
    fontFamily: FontFamily.ui, fontSize: sf(15), color: Colors.ink, lineHeight: sf(22),
  },

  gridWrap: { marginTop: Spacing.s3 },

  error: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ember, marginTop: 16, textAlign: 'center' },

  counter: {
    position: 'absolute', right: Spacing.s5, bottom: Spacing.s4,
    fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink3,
  },
  counterOver: { color: Colors.ember },
});
