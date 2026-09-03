import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostAuthorHeader } from '@/components/community/PostAuthorHeader';
import { PostCard } from '@/components/community/PostCard';
import { PostDetailSkeleton } from '@/components/community/PostDetailSkeleton';
import { useIPad } from '@/hooks/use-ipad';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { useActivityDetail, type CommunityPost } from '@/store/community';
import { InlineToast, useInlineToast } from '@/components/ui/InlineToast';

export default function ActivityDetailScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activity, responses, loading, toggleResponseLikeOptimistic, pollVoteOptimistic } = useActivityDetail(id);
  const { message: toastMsg, nonce: toastNonce, show: showToast } = useInlineToast();

  const renderResponse = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostCard
        post={item}
        onToggleLike={() => toggleResponseLikeOptimistic(item.id, () => showToast("couldn't update like — try again"))}
        onPollVote={(i) => pollVoteOptimistic(item.id, i, () => showToast("couldn't update vote — try again"))}
      />
    ),
    [toggleResponseLikeOptimistic, pollVoteOptimistic, showToast],
  );

  if (loading || !activity) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={[styles.header, column]}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>‹</Text>
          </Pressable>
        </View>
        <View style={[styles.content, column]}>
          <PostDetailSkeleton />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.toastWrap} pointerEvents="none">
        <InlineToast message={toastMsg} nonce={toastNonce} />
      </View>

      <View style={[styles.header, column]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={20} />
          <Text style={styles.headerTitle}>activity</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={responses}
        keyExtractor={(p) => p.id}
        renderItem={renderResponse}
        contentContainerStyle={[styles.content, column]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <PostAuthorHeader author={activity.author} fo={activity.fo} createdAt={activity.createdAt} size="lg" />
            {!!activity.body && <Text style={styles.body}>{activity.body}</Text>}

            <Pressable
              style={styles.respondBtn}
              onPress={() => router.push(`/social/post/new?activityId=${activity.id}` as any)}
            >
              <Text style={styles.respondBtnText}>+ post under this activity</Text>
            </Pressable>

            <View style={styles.divider} />
            <Text style={styles.responsesLabel}>responses · {responses.length}</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>no responses yet</Text>
            <Text style={styles.emptySub}>be the first to post ♡</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s5, paddingVertical: Spacing.s2,
  },
  headerBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnText: { fontSize: sf(20), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: sf(22) },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s3, paddingBottom: Spacing.s8 },
  body: { fontFamily: FontFamily.ui, fontSize: sf(15), color: Colors.ink, lineHeight: sf(23), marginTop: Spacing.s4 },
  respondBtn: {
    marginTop: Spacing.s5, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderRadius: Radius.r4, backgroundColor: Colors.sakuraDeep,
  },
  respondBtnText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(14), color: '#fff' },
  divider: { height: 1, backgroundColor: Colors.line, marginTop: Spacing.s6, marginBottom: Spacing.s4 },
  responsesLabel: {
    fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.ink3,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12,
  },
  separator: { height: 12 },
  toastWrap: { position: 'absolute', left: 0, right: 0, top: 4, zIndex: 10, alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: Colors.ink },
  emptySub: { fontFamily: FontFamily.ui, fontSize: sf(12.5), color: Colors.ink3, marginTop: 6 },
});
