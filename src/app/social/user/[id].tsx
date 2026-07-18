import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FollowButton } from '@/components/community/FollowButton';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { CozyModal } from '@/components/ui/CozyModal';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { useAuthUser } from '@/store/auth';
import { blockUser, fetchProfile, fetchRelationship, unblockUser, type CommunityProfile } from '@/store/community';

export default function PublicUserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useAuthUser();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [relationship, setRelationship] = useState({ following: false, blocked: false });
  const [loading, setLoading] = useState(true);
  const [confirmBlock, setConfirmBlock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchProfile(id), fetchRelationship(id)]).then(([p, r]) => {
      if (cancelled) return;
      setProfile(p);
      setRelationship(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isMe = me?.id === id;

  async function handleBlock() {
    setConfirmBlock(false);
    await blockUser(id);
    router.back();
  }

  async function handleUnblock() {
    await unblockUser(id);
    setRelationship((r) => ({ ...r, blocked: false }));
  }

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>‹</Text>
          </Pressable>
        </View>
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.sakuraDeep} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>‹</Text>
          </Pressable>
        </View>
        <Text style={styles.notFound}>this profile isn't available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={22} />
          <Text style={styles.headerTitle} numberOfLines={1}>{profile.name || 'their profile'}</Text>
        </View>
        {isMe ? (
          <View style={{ width: 32 }} />
        ) : (
          <Pressable
            onPress={() => (relationship.blocked ? handleUnblock() : setConfirmBlock(true))}
            style={relationship.blocked ? styles.textBtn : styles.headerBtn}
          >
            <Text style={relationship.blocked ? styles.textBtnLabel : styles.headerBtnText}>
              {relationship.blocked ? 'unblock' : '⋯'}
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileCard
          name={profile.name || 'someone soft'}
          pronouns={profile.pronouns}
          username={profile.username}
          bio={profile.bio}
          photoUri={profile.avatarUrl}
        />

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.followerCount}</Text>
            <Text style={styles.statLabel}>followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.followingCount}</Text>
            <Text style={styles.statLabel}>following</Text>
          </View>
        </View>

        {!isMe && !relationship.blocked && (
          <View style={styles.followRow}>
            <FollowButton userId={profile.id} initialFollowing={relationship.following} />
          </View>
        )}
      </ScrollView>

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
  headerBtnText: { fontSize: sf(18), color: Colors.ink2, fontFamily: FontFamily.ui, lineHeight: sf(20) },
  textBtn: {
    paddingHorizontal: 12, height: 32, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, alignItems: 'center', justifyContent: 'center',
  },
  textBtnLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink2 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6, paddingBottom: Spacing.s6 },
  notFound: {
    fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink3, textAlign: 'center', marginTop: 60,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 36, marginTop: Spacing.s5 },
  stat: { alignItems: 'center' },
  statValue: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(16), color: Colors.ink },
  statLabel: { fontFamily: FontFamily.ui, fontSize: sf(10.5), color: Colors.ink3, marginTop: 1 },
  followRow: { alignItems: 'center', marginTop: Spacing.s4 },
});
