import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostCard } from '@/components/community/PostCard';
import { FeedSkeleton } from '@/components/community/PostCardSkeleton';
import { ReportSheet } from '@/components/community/ReportSheet';
import { InlineToast, useInlineToast } from '@/components/ui/InlineToast';
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { Colors, FontFamily, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { POST_TYPE_LABELS, useTaggedPosts, type CommunityPost, type PostType } from '@/store/community';

const keyExtractor = (p: CommunityPost) => p.id;
const PostSeparator = () => <View style={styles.postSeparator} />;

export default function TaggedPostsScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { type } = useLocalSearchParams<{ type: string }>();
  const postType = (type as PostType) ?? 'general';
  const label = POST_TYPE_LABELS[postType] ?? postType;
  const { message: toastMsg, nonce: toastNonce, show: showToast } = useInlineToast();
  const [reportTarget, setReportTarget] = useState<string | null>(null);

  const { posts, loading, refreshing, refresh, loadMore, toggleLikeOptimistic, pollVoteOptimistic } = useTaggedPosts(postType);

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

  return (
    <View style={styles.screen}>
      <View style={[styles.toastWrap, { top: insets.top + Spacing.s2 }]} pointerEvents="none">
        <InlineToast message={toastMsg} nonce={toastNonce} />
      </View>

      <ProfileScreenHeader insetsTop={insets.top} onBack={() => router.back()} title={`#${label}`} />

      <FlatList
        style={styles.scroll}
        contentContainerStyle={[styles.content, column]}
        showsVerticalScrollIndicator={false}
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderPost}
        ItemSeparatorComponent={PostSeparator}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.sakuraDeep} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          loading ? <FeedSkeleton /> : <Text style={styles.empty}>no {label} posts yet</Text>
        }
      />

      <ReportSheet
        visible={!!reportTarget}
        targetType="post"
        targetId={reportTarget ?? ''}
        onClose={() => setReportTarget(null)}
        onSubmitted={() => { setReportTarget(null); showToast('report sent — thank you'); }}
        onFailure={() => showToast("couldn't send report — try again")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  toastWrap: { position: 'absolute', left: 0, right: 0, zIndex: 10, alignItems: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s4, paddingBottom: Spacing.s6, flexGrow: 1 },
  postSeparator: { height: 12 },
  empty: {
    fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink3,
    textAlign: 'center', marginTop: Spacing.s9,
  },
});
