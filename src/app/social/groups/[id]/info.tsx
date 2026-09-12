import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { CozyModal } from '@/components/ui/CozyModal';
import { IconEdit } from '@/components/ui/Icon';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import { useIPad } from '@/hooks/use-ipad';
import {
  deleteGroup,
  fetchGroup,
  fetchGroupMembers,
  leaveGroup,
  setGroupMuted,
  setGroupPinned,
  type CommunityGroup,
  type GroupMember,
} from '@/store/groups';

const AVATAR_SIZE = 84;
const MEMBER_AVATAR_SIZE = 38;

export default function GroupInfoScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [group, setGroup] = useState<CommunityGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [g, m] = await Promise.all([fetchGroup(id), fetchGroupMembers(id)]);
    setGroup(g);
    setMembers(m);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleMute(next: boolean) {
    setGroup((g) => (g ? { ...g, isMuted: next } : g));
    try {
      await setGroupMuted(id, next);
    } catch {
      setGroup((g) => (g ? { ...g, isMuted: !next } : g));
    }
  }

  async function togglePin(next: boolean) {
    setGroup((g) => (g ? { ...g, isPinned: next } : g));
    try {
      await setGroupPinned(id, next);
    } catch {
      setGroup((g) => (g ? { ...g, isPinned: !next } : g));
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError('');
    try {
      await deleteGroup(id);
      setConfirmDelete(false);
      router.replace('/(tabs)/community?tab=groups' as any);
    } catch (e: any) {
      setError(e?.message ?? "couldn't delete — try again");
      setConfirmDelete(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleExit() {
    setBusy(true);
    setError('');
    try {
      await leaveGroup(id);
      setConfirmExit(false);
      router.replace('/(tabs)/community?tab=groups' as any);
    } catch (e: any) {
      setError(e?.message ?? "couldn't leave — try again");
      setConfirmExit(false);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator color={Colors.sakuraDeep} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.screen}>
        <ProfileScreenHeader insetsTop={insets.top} onBack={() => router.back()} title="" />
        <Text style={styles.notFound}>this group isn't available</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ProfileScreenHeader
        insetsTop={insets.top}
        onBack={() => router.back()}
        title="group info"
        right={
          group.isOwner ? (
            <Pressable
              onPress={() => router.push(`/social/groups/${group.id}/edit` as any)}
              style={styles.headerEditBtn}
              accessibilityLabel="Edit group"
            >
              <IconEdit size={13} color={Colors.ink2} />
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={[styles.content, column]} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            {group.avatarUrl ? (
              <Image source={{ uri: group.avatarUrl }} style={styles.avatarImg} contentFit="cover" {...AVATAR_IMAGE} />
            ) : (
              <Text style={styles.avatarInitial}>{group.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
            )}
          </View>
          <Text style={styles.name}>{group.name}</Text>
          {!!group.fandom && (
            <View style={styles.fandomPill}>
              <Text style={styles.fandomPillText}>#{group.fandom}</Text>
            </View>
          )}
          {!!group.description && <Text style={styles.description}>{group.description}</Text>}
          <Text style={styles.memberCount}>{group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}</Text>
        </View>

        <Text style={styles.sectionLabel}>notifications</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>mute notifications</Text>
          <Switch
            value={group.isMuted}
            onValueChange={toggleMute}
            trackColor={{ true: Colors.sakuraDeep, false: Colors.line }}
            thumbColor={Colors.vellum}
            accessibilityLabel="Mute notifications"
          />
        </View>

        {/* pinning is where this group sits in *your* list, not a notification
            setting — grouping it with mute under one label mixed two different
            concerns under one heading */}
        <Text style={styles.sectionLabel}>preferences</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>pin to top of your groups</Text>
          <Switch
            value={group.isPinned}
            onValueChange={togglePin}
            trackColor={{ true: Colors.sakuraDeep, false: Colors.line }}
            thumbColor={Colors.vellum}
            accessibilityLabel="Pin to top of your groups"
          />
        </View>

        <Text style={styles.sectionLabel}>{members.length} {members.length === 1 ? 'member' : 'members'}</Text>
        <View style={styles.memberList}>
          {members.map((m) => (
            <Pressable key={m.id} style={styles.memberRow} onPress={() => router.push(`/social/user/${m.id}` as any)}>
              <View style={styles.memberAvatar}>
                {m.avatarUrl ? (
                  <Image source={{ uri: m.avatarUrl }} style={styles.memberAvatarImg} contentFit="cover" {...AVATAR_IMAGE} />
                ) : (
                  <Text style={styles.memberAvatarInitial}>{(m.name || m.username).trim().charAt(0).toUpperCase() || '♡'}</Text>
                )}
              </View>
              <View style={styles.memberTextCol}>
                <Text style={styles.memberName} numberOfLines={1}>{m.name || m.username || 'someone soft'}</Text>
                {!!m.username && <Text style={styles.memberUsername} numberOfLines={1}>@{m.username}</Text>}
              </View>
              {m.role === 'owner' && (
                <View style={styles.ownerBadge}>
                  <Text style={styles.ownerBadgeText}>owner</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.dangerDivider} />

        <Pressable
          style={styles.dangerBtn}
          onPress={() => (group.isOwner ? setConfirmDelete(true) : setConfirmExit(true))}
          accessibilityLabel={group.isOwner ? 'Delete group' : 'Exit group'}
        >
          <Text style={styles.dangerBtnText}>{group.isOwner ? 'delete group' : 'exit group'}</Text>
        </Pressable>
      </ScrollView>

      <CozyModal
        visible={confirmDelete}
        title={`Delete ${group.name}?`}
        message="This erases the group, its member list, and every message. This can't be undone."
        confirmText={busy ? 'deleting…' : 'Delete'}
        cancelText="Cancel"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
        isDestructive
      />

      <CozyModal
        visible={confirmExit}
        title={`Exit ${group.name}?`}
        message="You'll stop seeing its messages, and can rejoin anytime since it's open."
        confirmText={busy ? 'leaving…' : 'Exit'}
        cancelText="Cancel"
        onConfirm={handleExit}
        onClose={() => setConfirmExit(false)}
        isDestructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  centeredScreen: { flex: 1, backgroundColor: Colors.paper, alignItems: 'center', justifyContent: 'center' },
  notFound: {
    fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink3, textAlign: 'center', marginTop: 60,
  },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s3, paddingBottom: Spacing.s8 },

  identity: { alignItems: 'center', marginBottom: Spacing.s5 },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.sakura, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.vellum, ...Shadow.s1,
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(32), color: '#fff' },
  name: { fontFamily: FontFamily.displayItalic, fontSize: sf(22), color: Colors.ink, marginTop: Spacing.s3, textAlign: 'center' },
  fandomPill: {
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: Radius.pill, backgroundColor: Colors.sakuraSoft,
  },
  fandomPillText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(12), color: Colors.sakuraDeep },
  description: {
    fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink2, lineHeight: sf(19),
    textAlign: 'center', marginTop: Spacing.s3, paddingHorizontal: Spacing.s2,
  },
  memberCount: { fontFamily: FontFamily.ui, fontSize: sf(11.5), color: Colors.ink3, marginTop: Spacing.s2 },
  headerEditBtn: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.s4, marginBottom: Spacing.s3,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
  },
  toggleLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink },

  sectionLabel: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ink3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: Spacing.s3, marginBottom: Spacing.s3,
  },
  memberList: {
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    paddingHorizontal: Spacing.s4,
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  memberAvatar: {
    width: MEMBER_AVATAR_SIZE, height: MEMBER_AVATAR_SIZE, borderRadius: MEMBER_AVATAR_SIZE / 2,
    backgroundColor: Colors.sakura, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  memberAvatarImg: { width: MEMBER_AVATAR_SIZE, height: MEMBER_AVATAR_SIZE, borderRadius: MEMBER_AVATAR_SIZE / 2 },
  memberAvatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(15), color: '#fff' },
  memberTextCol: { flex: 1, minWidth: 0, gap: 1 },
  memberName: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13.5), color: Colors.ink },
  memberUsername: { fontFamily: FontFamily.uiMedium, fontSize: sf(11.5), color: Colors.ink3 },
  ownerBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: Radius.pill, backgroundColor: Colors.sakuraSoft },
  ownerBadgeText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(9.5), color: Colors.sakuraDeep, textTransform: 'uppercase', letterSpacing: 0.4 },

  error: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ember, marginTop: Spacing.s4, textAlign: 'center' },
  // pulls the destructive action out of the member list's visual rhythm —
  // space, not just margin, is what actually reads as "a different zone"
  dangerDivider: { height: 1, backgroundColor: Colors.line, marginTop: Spacing.s5, opacity: 0.6 },
  dangerBtn: { marginTop: Spacing.s4, alignItems: 'center', paddingVertical: 12 },
  dangerBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13.5), color: Colors.ember },
});
