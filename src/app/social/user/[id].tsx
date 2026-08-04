import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FollowButton } from '@/components/community/FollowButton';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { CozyModal } from '@/components/ui/CozyModal';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { useAuthUser } from '@/store/auth';
import {
  blockUser,
  fetchFoProfile,
  fetchProfile,
  fetchRelationship,
  subscribeProfile,
  unblockUser,
  type CommunityFoProfile,
  type CommunityProfile,
} from '@/store/community';

export default function PublicUserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useAuthUser();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [pairedFo, setPairedFo] = useState<CommunityFoProfile | null>(null);
  const [relationship, setRelationship] = useState({ following: false, blocked: false });
  const [loading, setLoading] = useState(true);
  const [confirmBlock, setConfirmBlock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchProfile(id), fetchRelationship(id)]).then(async ([p, r]) => {
      if (cancelled) return;
      setProfile(p);
      setRelationship(r);
      setLoading(false);
      // their paired F/O lives in its own row — fetch it after the card is up
      // rather than blocking the whole screen on a second round trip
      if (p?.identifyFoId) {
        const fo = await fetchFoProfile(p.identifyFoId);
        if (!cancelled) setPairedFo(fo);
      } else {
        setPairedFo(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    return subscribeProfile(id, (patch) =>
      setProfile((p) => (p ? { ...p, followerCount: patch.followerCount, followingCount: patch.followingCount } : p)),
    );
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

  const pageBg = profile.pageBgImage || profile.pageBgColor;

  const body = (
    <View style={[styles.screen, !pageBg && styles.screenDefaultBg, { paddingTop: insets.top }]}>
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
          fallbackColor={profile.color || Colors.sakura}
          statusLabel={profile.statusLabel}
          height={profile.height}
          weight={profile.weight}
          song={profile.song}
          songLink={profile.songLink}
          gallery={profile.gallery}
          cardBgColor={profile.cardBgColor}
          cardBgImage={profile.cardBgImage}
          cardBgGradient={profile.cardBgGradient}
          cardTransparent={profile.cardTransparent}
          textColor={profile.textColor}
          borderStyle={profile.borderStyle}
          decoration={profile.decoration}
          nameFont={profile.nameFont}
          showPairedIdentity={!!pairedFo}
          pairedName={pairedFo?.name}
          pairedPronouns={pairedFo?.pronouns}
          pairedAvatarUri={pairedFo?.avatarUrl}
          pairedStatusLabel={pairedFo?.statusLabel}
          followerCount={profile.followerCount}
          followingCount={profile.followingCount}
          followAction={
            !isMe && !relationship.blocked ? (
              <FollowButton userId={profile.id} initialFollowing={relationship.following} />
            ) : undefined
          }
        />
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

  // their page styling travels with the profile, same as on their own device
  if (profile.pageBgImage) {
    return <ImageBackground source={{ uri: profile.pageBgImage }} style={styles.fill}>{body}</ImageBackground>;
  }
  if (profile.pageBgColor) {
    return <View style={[styles.fill, { backgroundColor: profile.pageBgColor }]}>{body}</View>;
  }
  return body;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  screen: { flex: 1 },
  screenDefaultBg: { backgroundColor: Colors.paper },
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
});
