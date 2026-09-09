import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostCard } from '@/components/community/PostCard';
import { FeedSkeleton } from '@/components/community/PostCardSkeleton';
import { PageBackground } from '@/components/profile/PageBackground';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileCardSkeleton } from '@/components/profile/ProfileCardSkeleton';
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { InlineToast, useInlineToast } from '@/components/ui/InlineToast';
import { Colors, FontFamily, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { relationshipStatus, sharingStatus } from '@/components/profile/cardProps';
import { fetchFoProfile, useFoPosts, type CommunityFoProfile, type CommunityPost } from '@/store/community';

const keyExtractor = (p: CommunityPost) => p.id;
const PostSeparator = () => <View style={styles.postSeparator} />;

export default function PublicFoProfileScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<CommunityFoProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { message: toastMsg, nonce: toastNonce, show: showToast } = useInlineToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFoProfile(id).then((p) => {
      if (!cancelled) {
        setProfile(p);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const { posts, loading: postsLoading, refreshing, refresh: refreshPosts, loadMore, toggleLikeOptimistic, pollVoteOptimistic } = useFoPosts(id);

  const renderPost = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostCard
        post={item}
        onToggleLike={() => toggleLikeOptimistic(item.id, () => showToast("couldn't update like — try again"))}
        onPollVote={(i) => pollVoteOptimistic(item.id, i, () => showToast("couldn't update vote — try again"))}
      />
    ),
    [toggleLikeOptimistic, pollVoteOptimistic, showToast],
  );

  const pageBg = profile?.pageBgImage || profile?.pageBgColor;

  const body = (
    <View style={[styles.screen, !pageBg && styles.screenDefaultBg]}>
      <View style={[styles.toastWrap, { top: insets.top + Spacing.s2 }]} pointerEvents="none">
        <InlineToast message={toastMsg} nonce={toastNonce} />
      </View>

      <ProfileScreenHeader
        insetsTop={insets.top}
        onBack={() => router.back()}
        title={profile?.name || 'their profile'}
      />

      {loading ? (
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, column]} showsVerticalScrollIndicator={false}>
          <ProfileCardSkeleton />
        </ScrollView>
      ) : !profile ? (
        <Text style={styles.notFound}>this profile isn't available</Text>
      ) : (
        <FlatList
          style={styles.scroll}
          contentContainerStyle={[styles.content, column]}
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
                name={profile.name || 'untitled'}
                pronouns={profile.pronouns}
                subtitle={profile.fandom}
                bio={profile.bio}
                tagline={profile.tagline}
                photoUri={profile.avatarUrl}
                fallbackColor={profile.color || Colors.sakura}
                type={relationshipStatus(profile.relStatus)}
                sharing={sharingStatus(profile.shareStatus)}
                height={profile.height}
                weight={profile.weight}
                age={profile.age}
                birthday={profile.birthday}
                song={profile.song}
                songLink={profile.songLink}
                gallery={profile.gallery}
                cardBgColor={profile.cardBgColor}
                cardBgImage={profile.cardBgImage}
                cardBgGradient={profile.cardBgGradient}
                cardTransparent={profile.cardTransparent}
                textColor={profile.textColor}
                borderStyle={profile.borderStyle}
                nameFont={profile.nameFont}
                flags={profile.flags}
              />
              <Text style={styles.postsLabel}>posts about them</Text>
            </>
          }
          ListEmptyComponent={
            postsLoading ? <FeedSkeleton /> : <Text style={styles.postsEmpty}>no posts about them yet</Text>
          }
        />
      )}
    </View>
  );

  // the owner styled their page too, so mirror it here rather than always paper
  return (
    <PageBackground bgImage={profile?.pageBgImage} bgColor={profile?.pageBgColor}>
      {body}
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenDefaultBg: { backgroundColor: Colors.paper },
  toastWrap: { position: 'absolute', left: 0, right: 0, zIndex: 10, alignItems: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6, paddingBottom: Spacing.s6 },
  postSeparator: { height: 12 },
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
