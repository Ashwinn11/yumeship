import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sakura } from '@/components/deco/Sakura';
import { Sparkle } from '@/components/deco/Sparkle';
import { CardThemeSheet } from '@/components/profile/CardThemeSheet';
import { type CardTheme } from '@/components/profile/cardTheme';
import { pairedProps } from '@/components/profile/cardProps';
import { FoAvatarCard } from '@/components/profile/FoAvatarCard';
import { PageBackground } from '@/components/profile/PageBackground';
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { PostCard } from '@/components/community/PostCard';
import { FeedSkeleton } from '@/components/community/PostCardSkeleton';
import { CozyModal } from '@/components/ui/CozyModal';
import { InlineToast, useInlineToast } from '@/components/ui/InlineToast';
import { useAuthUser } from '@/store/auth';
import {
  deletePost,
  fetchProfile,
  logSyncFailure,
  pushFoProfile,
  pushOwnProfile,
  subscribeProfile,
  unpublishFoProfile,
  useUserPosts,
  type CommunityPost,
} from '@/store/community';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { IconEdit, IconPalette } from '@/components/ui/Icon';
import { Colors, FontFamily, Radius, sf, Spacing } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { usePremium } from '@/store/premium';
import { useFos } from '@/store/fo';
import { meCardTheme, readMe, saveMe, type Me } from '@/store/me';

const keyExtractor = (p: CommunityPost) => p.id;
const PostSeparator = () => <View style={styles.postSeparator} />;

export default function MyProfileScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const [me, setMe] = useState(readMe);
  useFocusEffect(useCallback(() => { setMe(readMe()); }, []));
  const premium = usePremium();
  const [showCustomize, setShowCustomize] = useState(false);
  const fos = useFos();
  const pairedFo = fos.find((f) => f.id === me.identifyFoId);

  // Follower/following counts live only on the server — local storage never
  // had them, which is exactly why this screen showed none while the public
  // view of the same account did. Fetched once signed in, then kept live the
  // same way the public profile screen does.
  const user = useAuthUser();
  const [counts, setCounts] = useState({ followerCount: 0, followingCount: 0 });
  useEffect(() => {
    if (!user) { setCounts({ followerCount: 0, followingCount: 0 }); return; }
    let cancelled = false;
    fetchProfile(user.id).then((p) => {
      if (!cancelled && p) setCounts({ followerCount: p.followerCount, followingCount: p.followingCount });
    });
    return () => { cancelled = true; };
  }, [user?.id]);
  useEffect(() => {
    if (!user) return;
    return subscribeProfile(user.id, (patch) => setCounts(patch));
  }, [user?.id]);

  const {
    posts,
    loading: postsLoading,
    refreshing,
    refresh: refreshPosts,
    loadMore,
    toggleLikeOptimistic,
    pollVoteOptimistic,
    removePost,
  } = useUserPosts(user?.id);
  const { message: toastMsg, nonce: toastNonce, show: showToast } = useInlineToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingFosPublic, setTogglingFosPublic] = useState(false);
  const allFosPublic = fos.length > 0 && fos.every((f) => f.isPublic);

  // one switch for every F/O at once, not a per-F/O toggle — publish/unpublish
  // whichever ones don't already match, in parallel, and surface anything that
  // failed (e.g. an F/O whose sharing status is "no" can't be published) rather
  // than letting the switch silently not do what it looked like it did
  async function handleToggleAllFosPublic(next: boolean) {
    setTogglingFosPublic(true);
    const targets = fos.filter((f) => f.isPublic !== next);
    const results = await Promise.allSettled(
      targets.map((f) => (next ? pushFoProfile(f.id) : unpublishFoProfile(f.id))),
    );
    const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    if (failures.length > 0) {
      failures.forEach((f) => logSyncFailure('toggle all F/Os public')(f.reason));
      showToast(
        failures.length === 1 && failures[0].reason?.message
          ? failures[0].reason.message
          : `${failures.length} f/o${failures.length > 1 ? 's' : ''} couldn't be updated`,
      );
    }
    setTogglingFosPublic(false);
  }

  async function confirmDeletePost() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePost(deleteTarget);
      removePost(deleteTarget);
    } catch {
      showToast("couldn't delete that post — try again");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const renderPost = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostCard
        post={item}
        onToggleLike={() => toggleLikeOptimistic(item.id, () => showToast("couldn't update like — try again"))}
        onPollVote={(i) => pollVoteOptimistic(item.id, i, () => showToast("couldn't update vote — try again"))}
        onRequestDelete={() => setDeleteTarget(item.id)}
      />
    ),
    [toggleLikeOptimistic, pollVoteOptimistic, showToast],
  );

  function handleThemeChange(patch: Partial<CardTheme>) {
    saveMe(patch as Partial<Me>);
    setMe((p) => ({ ...p, ...patch }));
  }

  // theme edits apply live inside the sheet (one push per tap would be
  // excessive) — push once, on close, so everyone else actually sees them
  function handleThemeSheetClose() {
    setShowCustomize(false);
    pushOwnProfile().catch(logSyncFailure('push own profile'));
  }

  const pageBg = me.pageBgImage || me.pageBgColor;

  const body = (
    <View style={[styles.screen, !pageBg && { backgroundColor: Colors.paper }]}>
      <View style={styles.decoTL} pointerEvents="none">
        <Sakura size={24} color={Colors.sakura} />
      </View>
      <View style={styles.decoBR} pointerEvents="none">
        <Sparkle size={16} color={Colors.lavenderDeep} />
      </View>

      <ProfileScreenHeader
        insetsTop={insets.top}
        onBack={() => router.back()}
        title="my profile"
        right={
          <View style={styles.headerActions}>
            <Pressable onPress={() => setShowCustomize(true)} style={styles.headerBtn}>
              <IconPalette size={13} color={Colors.ink2} />
            </Pressable>
            <Pressable onPress={() => router.push('/profile/edit' as any)} style={styles.headerBtn}>
              <IconEdit size={13} color={Colors.ink2} />
            </Pressable>
          </View>
        }
      />

      <View style={[styles.toastWrap, { top: insets.top + Spacing.s2 }]} pointerEvents="none">
        <InlineToast message={toastMsg} nonce={toastNonce} />
      </View>

      <FlatList
        style={styles.scroll}
        contentContainerStyle={[styles.content, column, { paddingBottom: Spacing.s5 }]}
        showsVerticalScrollIndicator={false}
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderPost}
        ItemSeparatorComponent={PostSeparator}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshPosts} tintColor={Colors.sakuraDeep} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <>
            <ProfileCard
              name={me.name || 'someone soft'}
              pronouns={me.pronouns}
              username={me.username}
              bio={me.bio}
              tagline={me.tagline}
              photoUri={me.avatar}
              fallbackColor={me.color}
              height={me.height}
              weight={me.weight}
              song={me.song}
              songLink={me.songLink}
              gallery={me.gallery}
              cardBgColor={me.cardBgColor}
              cardBgImage={me.cardBgImage}
              cardBgGradient={me.cardBgGradient}
              cardTransparent={me.cardTransparent}
              textColor={me.textColor}
              borderStyle={me.borderStyle}
              nameFont={me.nameFont}
              nameOrnament={me.nameOrnament}
              flags={me.flags}
              avatarFrame={me.avatarFrame}
              avatarFrameUrl={me.avatarFrameUrl}
              {...pairedProps(pairedFo && { name: pairedFo.name, pronouns: pairedFo.pronouns, avatarUri: pairedFo.photoUri })}
              followerCount={counts.followerCount}
              followingCount={counts.followingCount}
            />
            <Text style={styles.footnote}>this is you, in their world ♡</Text>

            {fos.length > 0 && (
              <>
                <Text style={styles.postsLabel}>your f/os</Text>
                {/* publishing is an account feature — offering the switch while
                    signed out just fails on every f/o with "not signed in" */}
                {!!user && (
                  <View style={styles.toggleRow}>
                    <View style={styles.toggleTextWrap}>
                      <Text style={styles.toggleLabel}>public profiles</Text>
                      <Text style={styles.toggleSub}>
                        {allFosPublic ? 'anyone can view and comment on all your f/os' : 'turn on to make every f/o public at once'}
                      </Text>
                    </View>
                    <Switch
                      value={allFosPublic}
                      onValueChange={handleToggleAllFosPublic}
                      disabled={togglingFosPublic}
                      trackColor={{ true: Colors.sakuraDeep, false: Colors.line }}
                      thumbColor={Colors.vellum}
                    />
                  </View>
                )}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foRow}>
                  {fos.map((f) => (
                    <FoAvatarCard
                      key={f.id}
                      name={f.name}
                      avatarUri={f.photoUri}
                      pronouns={f.pronouns}
                      bio={f.bio}
                      onPress={() => router.push(`/fo/${f.id}` as any)}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={styles.postsLabel}>your posts</Text>
          </>
        }
        ListEmptyComponent={
          postsLoading ? (
            <FeedSkeleton />
          ) : (
            <Text style={styles.postsEmpty}>you haven't posted yet</Text>
          )
        }
      />

      <CardThemeSheet
        visible={showCustomize}
        onClose={handleThemeSheetClose}
        theme={meCardTheme(me)}
        onChange={handleThemeChange}
        premium={premium}
      />

      <CozyModal
        visible={!!deleteTarget}
        title="Delete this post?"
        message="This can't be undone."
        confirmText={deleting ? 'deleting…' : 'Delete'}
        cancelText="Cancel"
        onConfirm={confirmDeletePost}
        onClose={() => setDeleteTarget(null)}
        isDestructive
      />
    </View>
  );

  return (
    <PageBackground bgImage={me.pageBgImage} bgColor={me.pageBgColor}>
      {body}
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingBottom: Spacing.s1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  toastWrap: { position: 'absolute', left: 0, right: 0, zIndex: 10, alignItems: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6 },
  postSeparator: { height: 12 },
  foRow: { flexDirection: 'row', gap: 14, paddingBottom: 2, paddingTop: 4 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.s4, marginBottom: Spacing.s3,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
  },
  toggleTextWrap: { flex: 1, marginRight: Spacing.s3 },
  toggleLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink },
  toggleSub: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3, marginTop: 2 },
  postsLabel: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ink3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: Spacing.s6, marginBottom: Spacing.s3,
  },
  postsEmpty: {
    fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink3,
    textAlign: 'center', marginTop: Spacing.s3,
  },
  footnote: {
    fontFamily: FontFamily.script, fontSize: sf(15), color: Colors.ink3,
    textAlign: 'center', marginTop: Spacing.s4,
  },
  decoTL: { position: 'absolute', top: 120, left: 22 },
  decoBR: { position: 'absolute', bottom: 110, right: 28 },
});
