import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Spacing, sf } from '@/constants/theme';
import { useNotifications, type CommunityNotification } from '@/store/community';

const AVATAR_SIZE = 40;
const keyExtractor = (n: CommunityNotification) => n.id;

function describe(n: CommunityNotification): string {
  const who = n.actor.name || (n.actor.username ? `@${n.actor.username}` : 'someone');
  switch (n.type) {
    case 'like':
      return `${who} liked your post`;
    case 'comment':
      return `${who} commented on your post`;
    case 'reply':
      return `${who} replied to your comment`;
    case 'follow':
      return `${who} started following you`;
    case 'mention':
      return `${who} mentioned you`;
  }
}

function Row({ n, onPress }: { n: CommunityNotification; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.dotSlot}>{!n.readAt && <View style={styles.unreadDot} />}</View>
      <View style={styles.avatar}>
        {n.actor.avatarUrl ? (
          <Image source={{ uri: n.actor.avatarUrl }} style={styles.avatarImg} contentFit="cover" {...AVATAR_IMAGE} />
        ) : (
          <Text style={styles.avatarInitial}>{(n.actor.name || n.actor.username).trim().charAt(0).toUpperCase() || '♡'}</Text>
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={styles.desc} numberOfLines={2}>{describe(n)}</Text>
        {!!n.postPreview && n.type !== 'follow' && (
          <Text style={styles.preview} numberOfLines={1}>"{n.postPreview}"</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { items, loading, refreshing, refresh, loadMore, markRead, markAllRead } = useNotifications();
  const hasUnread = items.some((n) => !n.readAt);

  const onPressRow = useCallback(
    (n: CommunityNotification) => {
      markRead(n.id);
      if (n.type === 'follow') {
        router.push(`/social/user/${n.actor.id}` as any);
      } else if (n.postId) {
        router.push(`/social/post/${n.postId}` as any);
      }
    },
    [markRead],
  );

  const renderRow = useCallback(
    ({ item }: { item: CommunityNotification }) => <Row n={item} onPress={() => onPressRow(item)} />,
    [onPressRow],
  );

  return (
    <View style={styles.screen}>
      <ProfileScreenHeader
        insetsTop={insets.top}
        onBack={() => router.back()}
        title="notifications"
        right={
          hasUnread ? (
            <Pressable onPress={markAllRead} hitSlop={8}>
              <Text style={styles.markAllText}>mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />

      <FlatList
        contentContainerStyle={styles.content}
        data={items}
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
            <Text style={styles.empty}>nothing yet — likes, comments, follows and mentions will show up here</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  content: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s8 },
  spinner: { marginTop: 60 },
  empty: {
    fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink3,
    textAlign: 'center', marginTop: 60, paddingHorizontal: Spacing.s6, lineHeight: sf(20),
  },
  markAllText: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.sakuraDeep },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  dotSlot: { width: 7, alignItems: 'center' },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.sakuraDeep },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.sakura, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: '#fff' },
  textCol: { flex: 1, minWidth: 0, gap: 2 },
  desc: { fontFamily: FontFamily.uiMedium, fontSize: sf(13.5), color: Colors.ink, lineHeight: sf(18) },
  preview: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3 },
});
