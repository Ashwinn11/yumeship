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

import { MediaComposer } from '@/components/community/MediaComposer';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { createPost, fetchPost, type CommunityPost, type LocalPickedMedia } from '@/store/community';
import { getGlobalSetting } from '@/store/onboarding';

const MAX_BODY = 4000;

export default function NewPostScreen() {
  const insets = useSafeAreaInsets();
  const { kind, activityId } = useLocalSearchParams<{ kind?: string; activityId?: string }>();
  const isActivity = kind === 'activity';

  // whichever F/O is paired in edit profile tags every post automatically —
  // no separate per-post picker to choose from. Skipped for an activity
  // submission itself: a prompt is for everyone to answer, not about one F/O.
  const identifyFoId = getGlobalSetting('user_identify_fo_id');
  const me = {
    name: getGlobalSetting('user_name'),
    avatar: getGlobalSetting('user_avatar'),
    color: getGlobalSetting('user_color') || Colors.sakura,
  };

  const [respondingTo, setRespondingTo] = useState<CommunityPost | null>(null);
  useEffect(() => {
    if (!activityId) return;
    fetchPost(activityId).then(setRespondingTo);
  }, [activityId]);

  const [body, setBody] = useState('');
  const [media, setMedia] = useState<LocalPickedMedia[]>([]);
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
      await createPost({
        body,
        media,
        foProfileId: isActivity ? undefined : identifyFoId || undefined,
        kind: isActivity ? 'activity' : undefined,
        activityId: activityId || undefined,
      });
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
            <Text style={styles.postBtnText}>{isActivity ? 'submit' : 'post'}</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isActivity && <Text style={styles.kindLabel}>submitting an activity — everyone can vote and answer it</Text>}
        {!!respondingTo && (
          <Text style={styles.kindLabel} numberOfLines={2}>
            ↳ responding to "{respondingTo.title || respondingTo.body}"
          </Text>
        )}

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
            placeholder={isActivity ? 'what should everyone try? e.g. "show your F/O\'s comfort outfit"' : "what's on your mind?"}
            placeholderTextColor={Colors.ink3}
            multiline
            autoFocus
            maxLength={MAX_BODY}
            style={styles.bodyInput}
          />
        </View>

        {!isActivity && (
          <View style={styles.mediaWrap}>
            <MediaComposer media={media} onChange={setMedia} />
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
    flex: 1, minHeight: 90, paddingTop: 8, textAlignVertical: 'top',
    fontFamily: FontFamily.ui, fontSize: sf(15), color: Colors.ink, lineHeight: sf(22),
  },

  mediaWrap: { marginTop: Spacing.s3, paddingLeft: 48 },

  error: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ember, marginTop: 16, textAlign: 'center' },
  counter: {
    position: 'absolute', right: Spacing.s5, bottom: Spacing.s4,
    fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink3,
  },
  counterOver: { color: Colors.ember },
});
