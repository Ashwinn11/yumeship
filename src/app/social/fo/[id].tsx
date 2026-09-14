import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostCard } from '@/components/community/PostCard';
import { FeedSkeleton } from '@/components/community/PostCardSkeleton';
import { PageBackground } from '@/components/profile/PageBackground';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { AboutSection } from '@/components/profile/AboutSection';
import { ProfileMediaGrid } from '@/components/profile/ProfileMediaGrid';
import { ProfileCardSkeleton } from '@/components/profile/ProfileCardSkeleton';
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { IconFlag, IconShare } from '@/components/ui/Icon';
import { InlineToast, useInlineToast } from '@/components/ui/InlineToast';
import { ReportSheet } from '@/components/community/ReportSheet';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { relationshipStatus, sharingStatus } from '@/components/profile/cardProps';
import { foProfileUrl, shareProfileLink } from '@/lib/shareProfile';
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
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reportingProfile, setReportingProfile] = useState(false);

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
        onRequestReport={() => setReportTarget(item.id)}
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
        right={
          profile ? (
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => shareProfileLink(foProfileUrl(profile.id), (reason) => showToast(reason))}
                style={styles.headerBtn}
                accessibilityLabel="Share profile"
              >
                <IconShare size={13} color={Colors.ink2} />
              </Pressable>
              <Pressable
                onPress={() => setReportingProfile(true)}
                style={styles.headerBtn}
                accessibilityLabel="Report this F/O profile"
              >
                <IconFlag size={13} color={Colors.ink2} />
              </Pressable>
            </View>
          ) : undefined
        }
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
                subtitle={profile.fandom ? `#${profile.fandom}` : ''}
                tagline={profile.tagline}
                photoUri={profile.avatarUrl}
                fallbackColor={profile.color || Colors.sakura}
                type={relationshipStatus(profile.relStatus)}
                sharing={sharingStatus(profile.shareStatus)}
                since={profile.sinceDate}
                cardBgColor={profile.cardBgColor}
                cardBgImage={profile.cardBgImage}
                cardBgGradient={profile.cardBgGradient}
                cardTransparent={profile.cardTransparent}
                textColor={profile.textColor}
                borderStyle={profile.borderStyle}
                nameFont={profile.nameFont}
                cardLayout={profile.cardLayout}
                blinkies={profile.blinkies}
                flags={profile.flags}
                links={profile.links}
              />
              <AboutSection about={profile.about} />
              <ProfileMediaGrid songs={profile.songs} gallery={profile.gallery} />
              <Text style={styles.postsLabel}>posts about them</Text>
            </>
          }
          ListEmptyComponent={
            postsLoading ? <FeedSkeleton /> : <Text style={styles.postsEmpty}>no posts about them yet</Text>
          }
        />
      )}

      <ReportSheet
        visible={!!reportTarget}
        targetType="post"
        targetId={reportTarget ?? ''}
        onClose={() => setReportTarget(null)}
        onSubmitted={() => { setReportTarget(null); showToast('report sent — thank you'); }}
        onFailure={() => showToast("couldn't send report — try again")}
      />
      {!!profile && (
        <ReportSheet
          visible={reportingProfile}
          targetType="fo_profile"
          targetId={profile.id}
          onClose={() => setReportingProfile(false)}
          onSubmitted={() => { setReportingProfile(false); showToast('report sent — thank you'); }}
          onFailure={() => showToast("couldn't send report — try again")}
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
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
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
