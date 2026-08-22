import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
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
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';

import { MediaComposer, mediaFromAssets } from '@/components/community/MediaComposer';
import { MIN_POLL_OPTIONS, PollComposer } from '@/components/community/PollComposer';
import { useIPad } from '@/hooks/use-ipad';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { createPost, MAX_IMAGES, type LocalPickedMedia } from '@/store/community';
import { getGlobalSetting } from '@/store/onboarding';

const MAX_BODY = 4000;

function ImageIcon({ size = 21, color = Colors.sakuraDeep }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M2 3.5C2 2.7 2.7 2 3.5 2h9c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-9C2.7 14 2 13.3 2 12.5v-9z" stroke={color} strokeWidth={1.2} />
      <Path d="M2.5 11.5l3.3-3.3c.4-.4 1-.4 1.4 0L8 9l2.3-2.3c.4-.4 1-.4 1.4 0l2 2" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PollIcon({ size = 21, color = Colors.sakuraDeep }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Rect x="2" y="9" width="3" height="5" rx="0.8" stroke={color} strokeWidth={1.2} />
      <Rect x="6.5" y="5.5" width="3" height="8.5" rx="0.8" stroke={color} strokeWidth={1.2} />
      <Rect x="11" y="2" width="3" height="12" rx="0.8" stroke={color} strokeWidth={1.2} />
    </Svg>
  );
}

function GifIcon({ size = 21, color = Colors.sakuraDeep }: { size?: number; color?: string }) {
  return (
    // same 2–14 vertical span as ImageIcon/PollIcon above, so all three read
    // as the same size in the toolbar row despite different shapes
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Rect x="1" y="2" width="14" height="12" rx="2.5" stroke={color} strokeWidth={1.2} />
      <SvgText
        x="8"
        y="10"
        fontSize="6.4"
        fontWeight="700"
        fill={color}
        textAnchor="middle"
        fontFamily={FontFamily.uiSemiBold}
      >
        GIF
      </SvgText>
    </Svg>
  );
}

export default function NewPostScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
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

  const [body, setBody] = useState('');
  const [media, setMedia] = useState<LocalPickedMedia[]>([]);
  // null = no poll attached; an array (starts at 2 blank options) = poll mode,
  // mutually exclusive with media — same as Twitter/IG
  const [poll, setPoll] = useState<string[] | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const filledPollOptions = poll?.map((o) => o.trim()).filter(Boolean) ?? [];
  const pollReady = poll ? filledPollOptions.length >= MIN_POLL_OPTIONS : true;
  // a post just needs *something* in it — words, a photo, a gif, or a poll, any one is enough
  const canPost = (body.trim().length > 0 || media.length > 0 || !!poll) && pollReady && !posting;
  const remaining = MAX_BODY - body.length;
  // photos, gif, and poll are three mutually exclusive attachment modes —
  // picking one clears the others, same as Twitter
  const hasGif = media[0]?.type === 'gif';
  const hasPhotos = media.length > 0 && !hasGif;

  // photos and gifs share the same system picker (there's no OS-level "photos
  // only" or "gifs only" filter) — mediaFromAssets reads each asset's real
  // type and routes it correctly rather than rejecting a mismatched pick
  async function pickImages() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, MAX_IMAGES - media.length),
      quality: 0.9,
    });
    if (res.canceled) return;
    setPoll(null);
    setMedia((prev) => mediaFromAssets(res.assets, prev));
  }

  // one gif per post, same as Twitter — mutually exclusive with photos/poll
  async function pickGif() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled) return;
    setPoll(null);
    setMedia(mediaFromAssets(res.assets));
  }

  async function submit() {
    if (!canPost) return;
    setPosting(true);
    setError('');
    try {
      await createPost({
        body,
        media: poll ? [] : media,
        foProfileId: isActivity ? undefined : identifyFoId || undefined,
        kind: isActivity ? 'activity' : undefined,
        poll: poll ? filledPollOptions : undefined,
      });
      router.canGoBack() ? router.back() : router.replace('/(tabs)/community' as any);
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
          {posting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.postBtnText}>{isActivity ? 'submit' : 'post'}</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, column]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isActivity && <Text style={styles.kindLabel}>submitting an activity — everyone can vote on it</Text>}

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

        {!isActivity && !!poll && (
          <View style={styles.attachWrap}>
            <PollComposer options={poll} onChange={setPoll} onRemove={() => setPoll(null)} />
          </View>
        )}

        {!isActivity && media.length > 0 && !poll && (
          <View style={styles.mediaWrap}>
            <MediaComposer media={media} onChange={setMedia} />
          </View>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      {!isActivity ? (
        <View style={[styles.toolbar, column]}>
          <Pressable style={styles.toolbarBtn} disabled={!!poll || hasGif} onPress={pickImages}>
            <ImageIcon color={poll || hasGif ? Colors.line : Colors.sakuraDeep} />
          </Pressable>
          <Pressable style={styles.toolbarBtn} disabled={!!poll || hasPhotos} onPress={pickGif}>
            <GifIcon color={poll || hasPhotos ? Colors.line : hasGif ? Colors.sakuraInk : Colors.sakuraDeep} />
          </Pressable>
          <Pressable
            style={styles.toolbarBtn}
            disabled={media.length > 0}
            onPress={() => setPoll(poll ? null : ['', ''])}
          >
            <PollIcon color={media.length > 0 ? Colors.line : poll ? Colors.sakuraInk : Colors.sakuraDeep} />
          </Pressable>
          <View style={styles.toolbarSpacer} />
          {remaining < 200 && (
            <Text style={[styles.counterInline, remaining < 0 && styles.counterOver]}>{remaining}</Text>
          )}
        </View>
      ) : (
        remaining < 200 && (
          <Text style={[styles.counter, remaining < 0 && styles.counterOver]}>{remaining}</Text>
        )
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

  attachWrap: { marginTop: Spacing.s3, paddingLeft: 48 },
  mediaWrap: { marginTop: Spacing.s3 },

  error: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ember, marginTop: 16, textAlign: 'center' },

  toolbar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.s5,
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s3,
    borderTopWidth: 1, borderTopColor: Colors.line,
  },
  toolbarBtn: { padding: 2 },
  toolbarSpacer: { flex: 1 },
  counterInline: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink3 },

  counter: {
    position: 'absolute', right: Spacing.s5, bottom: Spacing.s4,
    fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink3,
  },
  counterOver: { color: Colors.ember },
});
