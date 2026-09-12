import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconPin } from '@/components/ui/Icon';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import type { CommunityGroup } from '@/store/groups';

const AVATAR_SIZE = 44;

/** A group you're already in, WhatsApp/Instagram-style: unread groups read
 *  bold with a count badge, already-read ones read plain — distinct from
 *  GroupCard, which is for the "discover" list and has no read state or
 *  badge, just a join button. */
export function MyGroupRow({ group }: { group: CommunityGroup }) {
  const unread = group.unreadCount > 0;

  return (
    <Pressable style={styles.row} onPress={() => router.push(`/social/groups/${group.id}` as any)}>
      {group.isPinned && (
        <View style={styles.pinBadge}>
          <IconPin size={16} color={Colors.ink3} />
        </View>
      )}
      <View style={styles.avatar}>
        {group.avatarUrl ? (
          <Image source={{ uri: group.avatarUrl }} style={styles.avatarImg} contentFit="cover" {...AVATAR_IMAGE} />
        ) : (
          <Text style={styles.avatarInitial}>{group.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.name, unread && styles.nameUnread, unread && styles.namePad]} numberOfLines={1}>{group.name}</Text>
        {!!group.fandom && (
          <Text style={[styles.fandom, unread && styles.fandomUnread]} numberOfLines={1}>#{group.fandom}</Text>
        )}
      </View>
      {unread && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{group.unreadCount > 99 ? '99+' : group.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r4,
    padding: Spacing.s4,
    position: 'relative',
  },
  pinBadge: { position: 'absolute', top: 8, right: 10 },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.sakura, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(18), color: '#fff' },
  textCol: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontFamily: FontFamily.uiMedium, fontSize: sf(14.5), color: Colors.ink2, flexShrink: 1 },
  nameUnread: { fontFamily: FontFamily.uiSemiBold, color: Colors.ink },
  // only unread rows render the trailing count badge — only they need the room
  namePad: { paddingRight: 22 },
  fandom: { fontFamily: FontFamily.ui, fontSize: sf(11.5), color: Colors.ink3 },
  fandomUnread: { color: Colors.ink2 },
  badge: {
    minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6,
    backgroundColor: Colors.sakuraDeep, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: '#fff' },
});
