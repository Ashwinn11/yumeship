import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FollowButton } from '@/components/community/FollowButton';
import { PostCard } from '@/components/community/PostCard';
import { FeedSkeleton } from '@/components/community/PostCardSkeleton';
import { pairedProps } from '@/components/profile/cardProps';
import { FoAvatarCard } from '@/components/profile/FoAvatarCard';
import { InlineToast, useInlineToast } from '@/components/ui/InlineToast';
import { PageBackground } from '@/components/profile/PageBackground';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileCardSkeleton } from '@/components/profile/ProfileCardSkeleton';
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { CozyModal } from '@/components/ui/CozyModal';
import { Colors, FontFamily, Radius, sf, Spacing } from '@/constants/theme';
import { useAuthUser } from '@/store/auth';
import {
  blockUser,
  fetchFoProfile,
  fetchProfile,
  fetchRelationship,
  fetchUserFoProfiles,
  subscribeProfile,
  unblockUser,
  useUserPosts,
  type CommunityFoProfile,
  type CommunityFoSummary,
  type CommunityPost,
  type CommunityProfile,
} from '@/store/community';

const keyExtractor = (p: CommunityPost) => p.id;
const PostSeparator = () => <View style={styles.postSeparator} />;

export default function PublicUserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useAuthUser();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [pairedFo, setPairedFo] = useState<CommunityFoProfile | null>(null);
  const [fos, setFos] = useState<CommunityFoSummary[]>([]);
  const [relationship, setRelationship] = useState({ following: false, blocked: false });
  const [loading, setLoading] = useState(true);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const { message: toastMsg, nonce: toastNonce, show: showToast } = useInlineToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchProfile(id), fetchRelationship(id), fetchUserFoProfiles(id)]).then(async ([p, r, foList]) => {
      if (cancelled) return;
      setProfile(p);
      setRelationship(r);
      setFos(foList);
      setLoading(false);
      // their paired F/O lives in its own row — fetch it after the card is up
      // rather than blocking the whole screen on a second round trip
      if (p?.identifyFoId) {
        const fo = await fetchFoProfile(p.identifyFoId);
        if (!cancelled) setPairedFo(fo);
      } else {
        setPairedFo(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    return subscribeProfile(id, (patch) =>
      setProfile((p) => (p ? { ...p, followerCount: patch.followerCount, followingCount: patch.followingCount } : p)),
    );
  }, [id]);

  const isMe = me?.id === id;

  const { posts, loading: postsLoading, refreshing, refresh: refreshPosts, loadMore, toggleLikeOptimistic } = useUserPosts(id);

  const renderPost = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostCard
        post={item}
        onToggleLike={() => toggleLikeOptimistic(item.id, () => showToast("couldn't update like — try again"))}
      />
    ),
    [toggleLikeOptimistic, showToast],
  );

  async function handleBlock() {
    setConfirmBlock(false);
    try {
      await blockUser(id);
      router.back();
    } catch {
      showToast("couldn't block — try again");
    }
  }

  async function handleUnblock() {
    try {
      await unblockUser(id);
      setRelationship((r) => ({ ...r, blocked: false }));
    } catch {
      showToast("couldn't unblock — try again");
    }
  }

  if (loading) {
    return (
      <View style={styles.screen}>
        <ProfileScreenHeader insetsTop={insets.top} onBack={() => router.back()} title="" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.screen}>
        <ProfileScreenHeader insetsTop={insets.top} onBack={() => router.back()} title="" />
        <Text style={styles.notFound}>this profile isn't available</Text>
      </View>
    );
  }

  const pageBg = profile.pageBgImage || profile.pageBgColor;

  const body = (
    <View style={[styles.screen, !pageBg && styles.screenDefaultBg]}>
      <View style={[styles.toastWrap, { top: insets.top + Spacing.s2 }]} pointerEvents="none">
        <InlineToast message={toastMsg} nonce={toastNonce} />
      </View>

      <ProfileScreenHeader
        insetsTop={insets.top}
        onBack={() => router.back()}
        title={profile.name || 'their profile'}
        right={
          isMe ? undefined : (
            <Pressable
              onPress={() => (relationship.blocked ? handleUnblock() : setConfirmBlock(true))}
              style={relationship.blocked ? styles.textBtn : styles.headerBtn}
            >
              <Text style={relationship.blocked ? styles.textBtnLabel : styles.headerBtnText}>
                {relationship.blocked ? 'unblock' : '⋯'}
              </Text>
            </Pressable>
          )
        }
      />

      <FlatList
        style={styles.scroll}
        contentContainerStyle={styles.content}
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
              name={profile.name || 'someone soft'}
              pronouns={profile.pronouns}
              username={profile.username}
              bio={profile.bio}
              photoUri={profile.avatarUrl}
              fallbackColor={profile.color || Colors.sakura}
              statusLabel={profile.statusLabel}
              height={profile.height}
              weight={profile.weight}
              song={profile.song}
              songLink={profile.songLink}
              gallery={profile.gallery}
              cardBgColor={profile.cardBgColor}
              cardBgImage={profile.cardBgImage}
              cardBgGradient={profile.cardBgGradient}
              cardTransparent={profile.cardTransparent}
              textColor={profile.textColor}
              borderStyle={profile.borderStyle}
              decoration={profile.decoration}
              nameFont={profile.nameFont}
              {...pairedProps(pairedFo && { name: pairedFo.name, pronouns: pairedFo.pronouns, avatarUri: pairedFo.avatarUrl, statusLabel: pairedFo.statusLabel })}
              followerCount={profile.followerCount}
              followingCount={profile.followingCount}
              followAction={
                !isMe && !relationship.blocked ? (
                  <FollowButton
                    userId={profile.id}
                    initialFollowing={relationship.following}
                    onFailure={() => showToast("couldn't update follow — try again")}
                  />
                ) : undefined
              }
            />

            {fos.length > 0 && (
              <>
                <Text style={styles.postsLabel}>f/os</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foRow}>
                  {fos.map((f) => (
                    <FoAvatarCard
                      key={f.id}
                      name={f.name}
                      avatarUri={f.avatarUrl}
                      pronouns={f.pronouns}
                      bio={f.bio}
                      statusLabel={f.statusLabel}
                      onPress={() => router.push(`/social/fo/${f.id}` as any)}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={styles.postsLabel}>posts</Text>
          </>
        }
        ListEmptyComponent={
          relationship.blocked ? null : postsLoading ? (
            <FeedSkeleton />
          ) : (
            <Text style={styles.postsEmpty}>no posts yet</Text>
          )
        }
      />

      <CozyModal
        visible={confirmBlock}
        title={`Block ${profile.name || 'them'}?`}
        message="Neither of you will see each other's posts, comments, or profile anymore."
        confirmText="Block"
        cancelText="Cancel"
        onConfirm={handleBlock}
        onClose={() => setConfirmBlock(false)}
        isDestructive
      />
    </View>
  );

  // their page styling travels with the profile, same as on their own device
  return (
    <PageBackground bgImage={profile.pageBgImage} bgColor={profile.pageBgColor}>
      {body}
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  toastWrap: { position: 'absolute', left: 0, right: 0, zIndex: 10, alignItems: 'center' },
  screenDefaultBg: { backgroundColor: Colors.paper },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnText: { fontSize: sf(18), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: sf(20) },
  textBtn: {
    paddingHorizontal: 12, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  textBtnLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6, paddingBottom: Spacing.s6 },
  postSeparator: { height: 12 },
  foRow: { flexDirection: 'row', gap: 14, paddingBottom: 2 },
  postsLabel: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ink3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: Spacing.s6, marginBottom: Spacing.s3,
  },
  postsEmpty: {
    fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink3,
    textAlign: 'center', marginTop: Spacing.s3,
  },
  notFound: {
    fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink3, textAlign: 'center', marginTop: 60,
  },
});
