import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { CommunityGroup } from '@/store/groups';

import { JoinGroupButton } from './JoinGroupButton';

const AVATAR_SIZE = 44;

export function GroupCard({ group }: { group: CommunityGroup }) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/social/groups/${group.id}` as any)}>
      <View style={[styles.avatar, { backgroundColor: Colors.sakura }]}>
        {group.avatarUrl ? (
          <Image source={{ uri: group.avatarUrl }} style={styles.avatarImg} contentFit="cover" {...AVATAR_IMAGE} />
        ) : (
          <Text style={styles.avatarInitial}>{group.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={styles.name} numberOfLines={1}>{group.name}</Text>
        {!!group.fandom && <Text style={styles.fandom} numberOfLines={1}>#{group.fandom}</Text>}
        <Text style={styles.memberCount}>{group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}</Text>
      </View>
      {!group.isOwner && (
        <JoinGroupButton groupId={group.id} initialMember={group.isMember} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r4,
    padding: Spacing.s4,
    ...Shadow.s1,
  },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(18), color: '#fff' },
  textCol: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(14.5), color: Colors.ink },
  fandom: { fontFamily: FontFamily.marker, fontSize: sf(10.5), color: Colors.ink3, letterSpacing: 0.6, textTransform: 'uppercase' },
  memberCount: { fontFamily: FontFamily.ui, fontSize: sf(11.5), color: Colors.ink3, marginTop: 2 },
});
