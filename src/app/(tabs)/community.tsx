import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { useAuthUser, signInWithApple, signInWithGoogle } from '@/store/auth';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf, Shadow } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Mark } from '@/components/ui/Mark';
import { Star } from '@/components/deco/Star';
import { Cloud } from '@/components/deco/Cloud';
import { Heart } from '@/components/deco/Heart';
import { Sparkle } from '@/components/deco/Sparkle';
import { StickerEnvelope, StickerPolaroid } from '@/components/deco/Stickers';
import { useIPad } from '@/hooks/use-ipad';
import Svg, { Path } from 'react-native-svg';
import { CozyModal } from '@/components/ui/CozyModal';
import { DismissKeyboardView } from '@/components/ui/DismissKeyboardView';
import { Image } from 'expo-image';
import { AccountSheet } from '@/components/community/AccountSheet';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { ActivityPromptRow } from '@/components/community/ActivityPromptRow';
import { PostCard } from '@/components/community/PostCard';
import { TodaysActivityCard } from '@/components/community/TodaysActivityCard';
import type { CommunityPost } from '@/store/community';
import {
  checkUsernameAvailable,
  claimUsername,
  fetchActivityPool,
  fetchProfile,
  fetchTodaysActivity,
  logSyncFailure,
  pushOwnProfile,
  subscribeActivityPool,
  syncIdentifyFoPublish,
  toggleLike,
  useCommunityFeed,
} from '@/store/community';

/**
 * The locally cached username is only trustworthy for the account it was
 * cached for. Without this check, deleting an account and signing into a new
 * one (or switching accounts on a shared device) could resurrect a stale
 * username — silently unlocking the feed and posting before the *current*
 * account has actually claimed a handle server-side.
 */
function cachedUsernameFor(userId: string | undefined): string {
  if (!userId) return '';
  return getGlobalSetting('user_username_uid') === userId ? getGlobalSetting('user_username') : '';
}
import { InlineToast, useInlineToast } from '@/components/ui/InlineToast';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { FeedSkeleton } from '@/components/community/PostCardSkeleton';
import { getGlobalSetting, saveGlobalSetting } from '@/store/onboarding';

// ─── Google Icon ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <Text style={{
      fontFamily: FontFamily.uiSemiBold,
      // matches appleBtnText/Button's size="lg" text so the "G" glyph reads
      // the same weight as the Apple logo mark beside it
      fontSize: FontSize.bodyLg,
      color: Colors.vellum,
    }}>G</Text>
  );
}

// ─── Apple Icon ───────────────────────────────────────────────────────────────

function AppleIcon() {
  return (
    <Svg width={14} height={17} viewBox="0 0 14 17" fill="none">
      <Path
        d="M12.03 9.42c.03-2.23 1.83-3.3 1.92-3.35-1.04-1.52-2.66-1.73-3.23-1.78-1.37-.14-2.68.8-3.38.8-.7 0-1.78-.79-2.94-.77-1.52.02-2.93.88-3.71 2.24-1.58 2.73-.4 6.78 1.13 8.99.75 1.08 1.63 2.29 2.8 2.25 1.12-.05 1.55-.73 2.91-.73 1.35 0 1.75.73 2.92.7 1.19-.02 1.98-1.1 2.72-2.19.86-1.26 1.21-2.48 1.23-2.54-.03-.02-2.37-.9-2.37-3.62z"
        fill="#fff"
      />
      <Path
        d="M9.74 3.01c.61-.74 1.02-1.77.9-2.8-.88.03-1.95.59-2.58 1.32-.57.65-1.07 1.69-.95 2.71.98.08 1.99-.48 2.63-1.23z"
        fill="#fff"
      />
    </Svg>
  );
}

// ─── Username claim gate ──────────────────────────────────────────────────────

function UsernameClaim({ onClaimed }: { onClaimed: (username: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const v = value.trim();
    if (v.length < 3) {
      setChecking(false);
      setAvailable(false);
      setError('');
      return;
    }
    setChecking(true);
    setError('');
    const handle = setTimeout(async () => {
      const res = await checkUsernameAvailable(v);
      setChecking(false);
      setAvailable(res.ok);
      if (!res.ok) setError(res.reason ?? '');
    }, 400);
    return () => clearTimeout(handle);
  }, [value]);

  async function submit() {
    setBusy(true);
    setError('');
    const res = await claimUsername(value);
    setBusy(false);
    if (res.ok) {
      onClaimed(value.trim().toLowerCase());
    } else {
      setError(res.reason ?? 'something went wrong');
      setAvailable(false);
    }
  }

  return (
    <>
      <StickerEnvelope size={88} style={{ marginBottom: Spacing.s1 }} />
      <Text style={styles.emptyTitle}>pick your handle</Text>
      <Text style={styles.claimSub}>this is how others will find and tag you — choose carefully, it's yours alone</Text>
      <View style={styles.claimInputRow}>
        <Text style={styles.claimAt}>@</Text>
        <TextInput
          value={value}
          onChangeText={(v) => setValue(v.toLowerCase())}
          placeholder="yourname"
          placeholderTextColor={Colors.ink3}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          style={styles.claimInput}
        />
        {checking && <ActivityIndicator size="small" color={Colors.ink3} />}
      </View>
      {!!error && <Text style={styles.claimError}>{error}</Text>}
      {!error && !checking && available && <Text style={styles.claimAvailable}>@{value.trim()} is yours ✓</Text>}
      <View style={{ width: '100%', marginTop: Spacing.s3, paddingHorizontal: Spacing.s4 }}>
        <Button variant="primary" size="lg" full disabled={busy || checking || !available} onPress={submit}>
          {busy ? 'claiming…' : 'claim it'}
        </Button>
      </View>
    </>
  );
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

// Module scope on purpose: an inline `() => <View/>` is a *new component type*
// every render, so React unmounts and remounts every separator in the list.
const FeedSeparator = () => <View style={styles.feedSeparator} />;
const keyExtractor = (p: CommunityPost) => p.id;

function Feed({ insets }: { insets: { top: number } }) {
  const { column } = useIPad();
  const { tab: initialTab } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<'global' | 'following' | 'activities'>(
    initialTab === 'activities' ? 'activities' : 'global',
  );
  // the underlying feed hook only ever runs in global/following mode — picking
  // the activities pill doesn't touch it, just swaps which data source the
  // list below renders from, so switching back restores it with no re-fetch
  const [feedMode, setFeedMode] = useState<'global' | 'following'>('global');
  const { posts, loading, refreshing, refresh, loadMore, toggleLikeOptimistic, pollVoteOptimistic } = useCommunityFeed(feedMode);
  const { message: toastMsg, nonce: toastNonce, show: showToast } = useInlineToast();

  function selectTab(t: typeof tab) {
    setTab(t);
    if (t !== 'activities') setFeedMode(t);
  }

  // follows aren't realtime, so the "following" list otherwise won't include
  // someone new until the tab is left and reopened — the moment a follow made
  // from a profile screen actually needs to show up here. Skip the very first
  // focus: the mode-change effect inside the hook already loads on mount, so
  // firing again here would just flash the pull-to-refresh spinner for nothing.
  const mountedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (mountedRef.current) refresh();
      mountedRef.current = true;
    }, [refresh]),
  );

  // the like pool: activity prompts nobody has picked yet, most-liked first.
  // No pagination (like-count ordering doesn't map to a `before` cursor, and
  // this app's submission volume doesn't need it) but it is realtime — new
  // submissions and like changes from other people show up live.
  const [pool, setPool] = useState<CommunityPost[]>([]);
  const [poolLoading, setPoolLoading] = useState(true);
  const [poolRefreshing, setPoolRefreshing] = useState(false);
  const loadPool = useCallback(async () => {
    setPool(await fetchActivityPool());
  }, []);
  useEffect(() => {
    if (tab !== 'activities') return;
    setPoolLoading(true);
    loadPool().finally(() => setPoolLoading(false));
  }, [tab, loadPool]);

  useEffect(() => {
    if (tab !== 'activities') return;
    return subscribeActivityPool({
      onInsert: (p) => setPool((prev) => (prev.some((x) => x.id === p.id) ? prev : [p, ...prev])),
      onLikeUpdate: ({ id, likeCount, featured: isFeatured }) => {
        // the pinned card has its own state, not the pool array — keep it in
        // sync too, so someone else's like on today's winner shows up live
        setFeatured((f) => (f && f.id === id ? { ...f, likeCount } : f));

        // once someone's client features it, it belongs in the pinned slot,
        // not the pool of unpicked prompts
        if (isFeatured) {
          setPool((prev) => prev.filter((p) => p.id !== id));
          return;
        }
        setPool((prev) =>
          prev.map((p) => (p.id === id ? { ...p, likeCount } : p)).sort((a, b) => b.likeCount - a.likeCount),
        );
      },
      onDelete: (id) => setPool((prev) => prev.filter((p) => p.id !== id)),
    });
  }, [tab]);

  const inFlightPool = useRef<Set<string>>(new Set());
  const likePoolOptimistic = useCallback(
    async (postId: string) => {
      if (inFlightPool.current.has(postId)) return;
      const target = pool.find((p) => p.id === postId);
      if (!target) return;
      const wasLiked = target.likedByMe;
      const apply = (liked: boolean, delta: number) =>
        setPool((prev) => prev.map((p) => (p.id === postId ? { ...p, likedByMe: liked, likeCount: p.likeCount + delta } : p)));
      inFlightPool.current.add(postId);
      apply(!wasLiked, wasLiked ? -1 : 1);
      try {
        await toggleLike(postId, wasLiked);
      } catch {
        apply(wasLiked, wasLiked ? 1 : -1);
        showToast("couldn't update like — try again");
      } finally {
        inFlightPool.current.delete(postId);
      }
    },
    [pool, showToast],
  );

  // today's featured activity — the single daily winner, pinned above the
  // pills regardless of which one is selected, fetched once per app session
  // (calling it is what picks the winner the first time anyone opens the feed
  // that day; every client after just reads the same row back — see
  // fetchTodaysActivity's doc comment)
  const [featured, setFeatured] = useState<CommunityPost | null>(null);
  useEffect(() => {
    fetchTodaysActivity().then(setFeatured);
  }, []);
  const renderPost = useCallback(
    ({ item, index }: { item: CommunityPost; index: number }) =>
      tab === 'activities' ? (
        <ActivityPromptRow
          post={item}
          onToggleLike={() => likePoolOptimistic(item.id)}
          isLast={index === pool.length - 1}
        />
      ) : (
        <PostCard
          post={item}
          onToggleLike={() => toggleLikeOptimistic(item.id, () => showToast("couldn't update like — try again"))}
          onPollVote={(i) => pollVoteOptimistic(item.id, i, () => showToast("couldn't update vote — try again"))}
        />
      ),
    [tab, pool.length, likePoolOptimistic, toggleLikeOptimistic, pollVoteOptimistic, showToast],
  );

  const activityData = tab === 'activities';
  const data = activityData ? pool : posts;
  const isLoading = activityData ? poolLoading : loading;
  const isRefreshing = activityData ? poolRefreshing : refreshing;
  const handleRefresh = useCallback(async () => {
    if (activityData) {
      setPoolRefreshing(true);
      await loadPool();
      setPoolRefreshing(false);
    } else {
      await refresh();
    }
  }, [activityData, loadPool, refresh]);

  return (
    <View style={styles.feedWrap}>
      <View style={styles.feedToastWrap} pointerEvents="none">
        <InlineToast message={toastMsg} nonce={toastNonce} />
      </View>

      <View style={[styles.tabsWrap, column]}>
        <SegmentedTabs
          tabs={[
            { key: 'global', label: 'global' },
            { key: 'following', label: 'following' },
            { key: 'activities', label: 'activities' },
          ]}
          value={tab}
          onChange={selectTab}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderPost}
        contentContainerStyle={[styles.feedContent, column]}
        ItemSeparatorComponent={activityData ? undefined : FeedSeparator}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.sakuraDeep} />}
        onEndReached={activityData ? undefined : loadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => Keyboard.dismiss()}
        // posts carry photos, so keep the mounted window tight — offscreen cards
        // hold decoded bitmaps that add up fast on older devices
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
        ListHeaderComponent={
          featured || activityData ? (
            <>
              {featured && (
                <View style={styles.featuredWrap}>
                  <TodaysActivityCard activity={featured} />
                </View>
              )}
              {activityData && (
                <View style={styles.submittedHeaderCard}>
                  <View style={styles.submittedHeaderLeft}>
                    <Heart size={16} color={Colors.sakuraDeep} />
                    <View>
                      <Text style={styles.submittedTitle}>Submitted Activities</Text>
                      <Text style={styles.submittedSub}>Help pick tomorrow's</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => router.push('/social/post/new?kind=activity' as any)} hitSlop={8}>
                    <Text style={styles.submittedSubmitLink}>Submit</Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <FeedSkeleton />
          ) : activityData ? (
            <View style={[styles.feedEmpty, styles.submittedEmptyClose]}>
              <Text style={styles.emptyTitle}>the pool's empty</Text>
              <Text style={styles.claimSub}>submit a prompt and be the first to get liked up ♡</Text>
            </View>
          ) : (
            <View style={styles.feedEmpty}>
              <Text style={styles.emptyTitle}>
                {tab === 'following' ? 'quiet in here' : 'be the first to post'}
              </Text>
              <Text style={styles.claimSub}>
                {tab === 'following' ? 'follow people to see their posts here' : 'share something with the club ♡'}
              </Text>
            </View>
          )
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/social/post/new' as any)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const user = useAuthUser();
  const insets = useSafeAreaInsets();
  const { column, isIPad } = useIPad();

  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string } | null>(null);
  const [username, setUsername] = useState(() => cachedUsernameFor(user?.id));
  const [checkingUsername, setCheckingUsername] = useState(!!user && !cachedUsernameFor(user?.id));
  const [showAccount, setShowAccount] = useState(false);
  const [avatarUri, setAvatarUri] = useState(() => getGlobalSetting('user_avatar'));
  // measured rather than derived: header height shifts with safe-area insets
  const [menuTop, setMenuTop] = useState(0);
  useFocusEffect(useCallback(() => { setAvatarUri(getGlobalSetting('user_avatar')); }, []));

  useEffect(() => {
    if (!user) return;
    // publish the paired F/O first: the profile row points at it with a foreign
    // key, so pushing the profile before the F/O exists would drop the pairing
    (async () => {
      const identifyFoId = getGlobalSetting('user_identify_fo_id');
      if (identifyFoId) await syncIdentifyFoPublish(identifyFoId).catch(logSyncFailure('publish paired F/O'));
      await pushOwnProfile().catch(logSyncFailure('push own profile'));
    })();
    const local = cachedUsernameFor(user.id);
    if (local) {
      setUsername(local);
      setCheckingUsername(false);
      return;
    }
    setCheckingUsername(true);
    fetchProfile(user.id).then((profile) => {
      if (profile?.username) {
        saveGlobalSetting('user_username', profile.username);
        saveGlobalSetting('user_username_uid', user.id);
        setUsername(profile.username);
      }
      setCheckingUsername(false);
    });
  }, [user?.id]);

  async function handleGoogle() {
    setLoading('google');
    try {
      await signInWithGoogle();
    } catch (e: any) {
      const msg = e?.message ?? '';
      // User cancelled browser — do not show error
      const isCancel = msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('dismiss');
      if (!isCancel) {
        setAlertModal({ title: 'Google Sign In', message: msg || 'An error occurred during authentication.' });
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleApple() {
    setLoading('apple');
    try {
      await signInWithApple();
    } catch (e: any) {
      const msg = e?.message ?? '';
      const code = (e as any)?.code ?? '';
      const isCancel = code === 'ERR_REQUEST_CANCELED' || msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('dismiss');
      if (!isCancel) {
        setAlertModal({ title: 'Apple Sign In', message: msg || 'An error occurred during authentication.' });
      }
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;
  const showFeed = !!user && !checkingUsername && !!username;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Background accents */}
      <View style={styles.decoTL} pointerEvents="none">
        <Star size={18} color={Colors.butter} />
      </View>
      <View style={styles.decoBR} pointerEvents="none">
        <Cloud size={28} color={Colors.sakura} />
      </View>

      {/* Header */}
      <View style={[styles.header, column]}>
        <View style={styles.headerRow}>
          <Mark size={26} />
        </View>

        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.title}>community</Text>
            <Sparkle size={18} color={Colors.lavenderDeep} />
          </View>
          {user && (
            <Pressable
              onPress={() => setShowAccount(true)}
              hitSlop={8}
              onLayout={(e) => {
                const { y, height } = e.nativeEvent.layout;
                setMenuTop(insets.top + Spacing.s2 + y + height + 8);
              }}
            >
              <View style={[styles.headerAvatar, { backgroundColor: getGlobalSetting('user_color') || Colors.sakura }]}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.headerAvatarImg} contentFit="cover" {...AVATAR_IMAGE} />
                ) : (
                  <Text style={styles.headerAvatarInitial}>
                    {getGlobalSetting('user_name').trim().charAt(0).toUpperCase() || '♡'}
                  </Text>
                )}
              </View>
            </Pressable>
          )}
        </View>
      </View>

      {showFeed ? (
        <Feed insets={insets} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.emptyContainer, column]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          <DismissKeyboardView>
          {!user ? (
            // 1. UNAUTHENTICATED empty/sign-in state matching other app empty states
            <>
              <StickerPolaroid size={80} style={styles.emptySticker} />

              <Text style={styles.emptyTitle}>join the club</Text>

              <View style={[styles.buttons, isIPad && styles.buttonsIPad]}>
                {/* Apple Button (iOS Only) — rendered first */}
                {Platform.OS === 'ios' && (
                  <Pressable
                    id="community-sign-in-apple"
                    style={({ pressed }) => [
                      styles.appleBtnCustom,
                      { opacity: busy ? 0.55 : pressed ? 0.85 : 1 }
                    ]}
                    onPress={handleApple}
                    disabled={busy}
                  >
                    {loading === 'apple' ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <AppleIcon />
                        <Text style={styles.appleBtnText}>Continue with Apple</Text>
                      </>
                    )}
                  </Pressable>
                )}

                {/* Google Button — rendered second */}
                <Button
                  variant="primary"
                  size="lg"
                  full
                  icon={loading === 'google' ? <ActivityIndicator size="small" color={Colors.vellum} /> : <GoogleIcon />}
                  onPress={handleGoogle}
                  disabled={busy}
                >
                  Continue with Google
                </Button>

              </View>
            </>
          ) : checkingUsername ? (
            <ActivityIndicator color={Colors.sakuraDeep} />
          ) : (
            <UsernameClaim onClaimed={setUsername} />
          )}
          </DismissKeyboardView>
        </ScrollView>
      )}
      <AccountSheet visible={showAccount} onClose={() => setShowAccount(false)} anchorTop={menuTop} />

      <CozyModal
        visible={!!alertModal}
        title={alertModal?.title}
        message={alertModal?.message}
        confirmText="OK"
        onClose={() => setAlertModal(null)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s2,
    paddingBottom: Spacing.s2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.s4,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  title: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(34),
    lineHeight: sf(34),
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  headerAvatar: {
    width: 34, height: 34, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.vellum,
    ...Shadow.s1,
  },
  headerAvatarImg: { width: 34, height: 34, borderRadius: Radius.pill },
  headerAvatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(15), color: '#fff' },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.s5,
    paddingTop: Spacing.s3,
    paddingBottom: Spacing.s8,
  },
  emptySticker: {
    marginBottom: Spacing.s1,
  },
  emptyTitle: {
    fontFamily: FontFamily.script,
    fontSize: sf(26),
    color: Colors.ink,
    textAlign: 'center',
    marginTop: 10,
  },
  emptySub: {
    fontFamily: FontFamily.ui,
    fontSize: FontSize.caption,
    lineHeight: 18,
    color: Colors.ink3,
    textAlign: 'center',
    paddingHorizontal: Spacing.s5,
    marginVertical: 12,
  },
  buttons: {
    gap: 10,
    width: '100%',
    marginTop: Spacing.s4,
    paddingHorizontal: Spacing.s4,
  },
  // a sign-in CTA reads as oversized stretched across the same 760pt reading
  // column everything else uses — cap it to a normal button width instead
  buttonsIPad: {
    maxWidth: 420,
    alignSelf: 'center',
  },

  appleBtnCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    borderRadius: Radius.pill,
    backgroundColor: '#000000',
    width: '100%',
    ...Shadow.s1,
  },
  appleBtnText: {
    fontFamily: FontFamily.uiMedium,
    // matches Button's size="lg" text (FontSize.bodyLg) — this is a bespoke
    // Pressable, not the shared Button component, so nothing keeps its text
    // in sync automatically; it drifted to a smaller sf(15) before
    fontSize: FontSize.bodyLg,
    color: '#ffffff',
  },

  actionBtn: {
    backgroundColor: Colors.sakuraDeep,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 99,
    marginTop: 10,
    shadowColor: 'rgba(110,58,90,0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnTxt: {
    fontFamily: FontFamily.uiMedium,
    fontSize: sf(14),
    color: Colors.vellum,
  },
  decoTL: {
    position: 'absolute',
    top: 130,
    left: 20,
  },
  decoBR: {
    position: 'absolute',
    bottom: 120,
    right: 30,
  },

  // username claim
  claimSub: {
    fontFamily: FontFamily.ui,
    fontSize: sf(12),
    color: Colors.ink3,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: Spacing.s4,
    lineHeight: sf(17),
  },
  claimInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.s4,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.lineStrong,
    paddingBottom: 6,
    width: '80%',
  },
  claimAt: { fontFamily: FontFamily.uiMedium, fontSize: sf(18), color: Colors.ink3 },
  claimInput: { flex: 1, fontFamily: FontFamily.uiMedium, fontSize: sf(18), color: Colors.ink, paddingLeft: 2 },
  claimError: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ember, marginTop: 8 },
  claimAvailable: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.sageDeep, marginTop: 8 },

  // feed
  feedWrap: { flex: 1 },
  feedToastWrap: { position: 'absolute', top: 4, left: 0, right: 0, zIndex: 10, alignItems: 'center' },
  featuredWrap: { paddingBottom: Spacing.s3 },
  submittedHeaderCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.vellum,
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.line,
    borderTopLeftRadius: Radius.r4, borderTopRightRadius: Radius.r4,
    padding: Spacing.s4,
  },
  submittedHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  submittedTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(14), color: Colors.ink },
  submittedSub: { fontFamily: FontFamily.ui, fontSize: sf(11.5), color: Colors.ink3, marginTop: 1 },
  submittedSubmitLink: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.sakuraDeep },
  submittedEmptyClose: {
    backgroundColor: Colors.vellum,
    borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: Colors.line,
    borderBottomLeftRadius: Radius.r4, borderBottomRightRadius: Radius.r4,
    paddingVertical: Spacing.s6,
  },
  tabsWrap: {
    paddingHorizontal: Spacing.s5,
    paddingBottom: Spacing.s3,
  },
  feedContent: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s8 },
  feedSeparator: { height: 12 },
  feedEmpty: { alignItems: 'center', paddingTop: 60 },
  fab: {
    position: 'absolute',
    bottom: Spacing.s5,
    right: Spacing.s5,
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    backgroundColor: Colors.sakuraDeep,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.s1,
  },
  fabText: { fontFamily: FontFamily.ui, fontSize: sf(26), color: '#fff', lineHeight: sf(28) },
});
