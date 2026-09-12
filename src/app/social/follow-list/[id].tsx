import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FollowButton } from '@/components/community/FollowButton';
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import { useAuthUser } from '@/store/auth';
import { useFollowList, type CommunityFollowRow } from '@/store/community';

const AVATAR_SIZE = 44;
const keyExtractor = (p: CommunityFollowRow) => p.id;

function Row({ row, isMe, isOwnFollowing }: { row: CommunityFollowRow; isMe: boolean; isOwnFollowing: boolean }) {
  return (
    <Pressable style={styles.row} onPress={() => router.push(`/social/user/${row.id}` as any)}>
      <View style={[styles.avatar, { backgroundColor: row.color || Colors.sakura }]}>
        {row.avatarUrl ? (
          <Image source={{ uri: row.avatarUrl }} style={styles.avatarImg} contentFit="cover" {...AVATAR_IMAGE} />
        ) : (
          <Text style={styles.avatarInitial}>{row.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={styles.name} numberOfLines={1}>{row.name || 'someone soft'}</Text>
        {!!row.username && <Text style={styles.username} numberOfLines={1}>@{row.username}</Text>}
      </View>
      {/* Whether the viewer follows this row's person is only known for free
       * on the viewer's own "following" list — every row there is by
       * definition someone they follow. Anywhere else it'd need a per-row
       * lookup, so this stays scoped to that one case; other lists rely on
       * tapping through to the profile's own FollowButton. */}
      {!isMe && isOwnFollowing && (
        <FollowButton userId={row.id} initialFollowing={true} />
      )}
    </Pressable>
  );
}

export default function FollowListScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const me = useAuthUser();
  const { id, tab: initialTab, name } = useLocalSearchParams<{ id: string; tab?: string; name?: string }>();
  const [tab, setTab] = useState<'followers' | 'following'>(initialTab === 'following' ? 'following' : 'followers');

  const { rows, loading, refreshing, refresh, loadMore } = useFollowList(id, tab);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const isOwn = me?.id === id;

  const renderRow = useCallback(
    ({ item }: { item: CommunityFollowRow }) => (
      <Row row={item} isMe={item.id === me?.id} isOwnFollowing={isOwn && tab === 'following'} />
    ),
    [me?.id, isOwn, tab],
  );

  return (
    <View style={styles.screen}>
      <ProfileScreenHeader
        insetsTop={insets.top}
        onBack={() => router.back()}
        title={name || (isOwn ? 'you' : 'their circle')}
      />

      <View style={[styles.tabsWrap, column]}>
        <SegmentedTabs
          tabs={[{ key: 'followers', label: 'followers' }, { key: 'following', label: 'following' }]}
          value={tab}
          onChange={(t) => setTab(t as 'followers' | 'following')}
        />
      </View>

      <FlatList
        contentContainerStyle={[styles.content, column]}
        data={rows}
        keyExtractor={keyExtractor}
        renderItem={renderRow}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.sakuraDeep} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={Colors.sakuraDeep} style={styles.spinner} />
          ) : (
            <Text style={styles.empty}>
              {tab === 'followers' ? 'no followers yet' : 'not following anyone yet'}
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  tabsWrap: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s3 },
  content: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s8 },
  spinner: { marginTop: 60 },
  empty: {
    fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink3,
    textAlign: 'center', marginTop: 60,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: '#fff' },
  textCol: { flex: 1, minWidth: 0, gap: 1 },
  name: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(14), color: Colors.ink },
  username: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.ink3 },
});
