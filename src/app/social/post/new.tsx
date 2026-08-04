import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
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

import { MediaComposer } from '@/components/community/MediaComposer';
import { Chip } from '@/components/ui/Chip';
import { Row } from '@/components/ui/Row';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { createPost, type LocalPickedMedia } from '@/store/community';
import { getGlobalSetting } from '@/store/onboarding';
import { useFos } from '@/store/fo';

const MAX_BODY = 4000;

export default function NewPostScreen() {
  const insets = useSafeAreaInsets();
  const fos = useFos().filter((f) => f.isPublic);
  const identifyFoId = getGlobalSetting('user_identify_fo_id');
  const me = {
    name: getGlobalSetting('user_name'),
    avatar: getGlobalSetting('user_avatar'),
    color: getGlobalSetting('user_color') || Colors.sakura,
  };

  const [body, setBody] = useState('');
  const [media, setMedia] = useState<LocalPickedMedia[]>([]);
  const [foId, setFoId] = useState<string | undefined>(
    () => fos.find((f) => f.id === identifyFoId)?.id,
  );
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  // a post just needs *something* in it — words or a photo, either is enough
  const canPost = (body.trim().length > 0 || media.length > 0) && !posting;
  const remaining = MAX_BODY - body.length;

  async function submit() {
    if (!canPost) return;
    setPosting(true);
    setError('');
    try {
      await createPost({ body, media, foProfileId: foId });
      router.back();
    } catch (e: any) {
      setError(e?.message ?? 'something went wrong — try again');
    } finally {
      setPosting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.s1 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
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
          {posting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.postBtnText}>post</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
            placeholder="what's on your mind?"
            placeholderTextColor={Colors.ink3}
            multiline
            autoFocus
            maxLength={MAX_BODY}
            style={styles.bodyInput}
          />
        </View>

        <View style={styles.mediaWrap}>
          <MediaComposer media={media} onChange={setMedia} />
        </View>

        {fos.length > 0 && (
          <View style={styles.foSection}>
            <Text style={styles.foLabel}>with</Text>
            <Row gap={6} wrap>
              <Chip
                color={!foId ? Colors.sakuraDeep : Colors.ink2}
                bg={!foId ? Colors.sakuraSoft : Colors.paperDeep}
                active={!foId}
                onPress={() => setFoId(undefined)}
              >
                just me
              </Chip>
              {fos.map((f) => (
                <Chip
                  key={f.id}
                  color={foId === f.id ? Colors.sakuraDeep : Colors.ink2}
                  bg={foId === f.id ? Colors.sakuraSoft : Colors.paperDeep}
                  active={foId === f.id}
                  onPress={() => setFoId(f.id)}
                >
                  {f.name}
                </Chip>
              ))}
            </Row>
          </View>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      {remaining < 200 && (
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

  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s6 },

  composerRow: { flexDirection: 'row', gap: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 38, height: 38, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: '#fff' },
  bodyInput: {
    flex: 1, minHeight: 90, paddingTop: 8, textAlignVertical: 'top',
    fontFamily: FontFamily.ui, fontSize: sf(15), color: Colors.ink, lineHeight: sf(22),
  },

  mediaWrap: { marginTop: Spacing.s3, paddingLeft: 48 },

  foSection: { marginTop: Spacing.s5, paddingLeft: 48, gap: 8 },
  foLabel: {
    fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3,
    letterSpacing: 1.4, textTransform: 'uppercase',
  },

  error: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ember, marginTop: 16, textAlign: 'center' },
  counter: {
    position: 'absolute', right: Spacing.s5, bottom: Spacing.s4,
    fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink3,
  },
  counterOver: { color: Colors.ember },
});
