import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { router } from 'expo-router';

import { useAuthUser, signInWithApple, signInWithGoogle, signOut } from '@/store/auth';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf, Shadow } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Mark } from '@/components/ui/Mark';
import { Star } from '@/components/deco/Star';
import { Cloud } from '@/components/deco/Cloud';
import { Sparkle } from '@/components/deco/Sparkle';
import { StickerEnvelope, StickerPolaroid } from '@/components/deco/Stickers';
import { useIPad } from '@/hooks/use-ipad';
import Svg, { Path } from 'react-native-svg';
import { CozyModal } from '@/components/ui/CozyModal';
import { PostCard } from '@/components/community/PostCard';
import { checkUsernameAvailable, claimUsername, fetchProfile, pushOwnProfile, useCommunityFeed } from '@/store/community';
import { getGlobalSetting, saveGlobalSetting } from '@/store/onboarding';

// ─── Google Icon ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <Text style={{
      fontFamily: FontFamily.uiSemiBold,
      fontSize: sf(15),
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

function Feed({ insets }: { insets: { top: number } }) {
  const [mode, setMode] = useState<'global' | 'following'>('global');
  const { posts, loading, refreshing, refresh, loadMore, toggleLikeOptimistic } = useCommunityFeed(mode);

  return (
    <View style={styles.feedWrap}>
      <View style={styles.tabsRow}>
        {(['global', 'following'] as const).map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={[styles.tab, mode === m && styles.tabActive]}>
            <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>{m}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item} onToggleLike={() => toggleLikeOptimistic(item.id)} />}
        contentContainerStyle={styles.feedContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.sakuraDeep} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={Colors.sakuraDeep} />
          ) : (
            <View style={styles.feedEmpty}>
              <Text style={styles.emptyTitle}>
                {mode === 'following' ? 'quiet in here' : 'be the first to post'}
              </Text>
              <Text style={styles.claimSub}>
                {mode === 'following' ? 'follow people to see their posts here' : 'share something with the club ♡'}
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
  const { column } = useIPad();

  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string } | null>(null);
  const [username, setUsername] = useState(() => getGlobalSetting('user_username'));
  const [checkingUsername, setCheckingUsername] = useState(!!user && !getGlobalSetting('user_username'));

  useEffect(() => {
    if (!user) return;
    pushOwnProfile().catch(() => {});
    const local = getGlobalSetting('user_username');
    if (local) {
      setUsername(local);
      setCheckingUsername(false);
      return;
    }
    setCheckingUsername(true);
    fetchProfile(user.id).then((profile) => {
      if (profile?.username) {
        saveGlobalSetting('user_username', profile.username);
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
            <Pressable style={styles.signOutBtn} onPress={signOut}>
              <Text style={styles.signOutText}>sign out</Text>
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
        >
          {!user ? (
            // 1. UNAUTHENTICATED empty/sign-in state matching other app empty states
            <>
              <StickerPolaroid size={80} style={styles.emptySticker} />

              <Text style={styles.emptyTitle}>join the club</Text>

              <View style={styles.buttons}>
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
        </ScrollView>
      )}
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
    lineHeight: 34,
    letterSpacing: -0.4,
    color: Colors.ink,
  },
  signOutBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  signOutText: {
    fontFamily: FontFamily.uiMedium,
    fontSize: sf(11),
    color: Colors.ink2,
  },
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
    fontSize: sf(15),
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
    lineHeight: 17,
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
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.s5,
    paddingBottom: Spacing.s3,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  tabActive: { backgroundColor: Colors.sakuraSoft, borderColor: Colors.sakuraDeep },
  tabText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3, textTransform: 'capitalize' },
  tabTextActive: { color: Colors.sakuraDeep },
  feedContent: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s8 },
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
