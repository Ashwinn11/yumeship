import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { Colors, FontFamily, Radius, Spacing, sf } from '@/constants/theme';
import { persistImage } from '@/lib/localMedia';
import { useIPad } from '@/hooks/use-ipad';
import { memberColor, membersLabel, updateShip, useShip } from '@/store/ships';

const AVATAR_SIZE = 84;
const MEMBER_AVATAR_SIZE = 44;

/**
 * The polyship equivalent of the community group's info/edit screen (see
 * social/groups/[id]/info.tsx) — reached the same way, a pencil in the chat
 * header's corner, not by tapping avatars inside the conversation. Everything
 * here is local to this one ship: no publishing, no membership to manage,
 * just the group's own cover + name and each member's own photo.
 */
export default function ShipGroupScreen() {
  const insets = useSafeAreaInsets();
  const { column } = useIPad();
  const { id: shipId } = useLocalSearchParams<{ id: string }>();
  const ship = useShip(shipId);
  const members = ship?.members ?? [];
  const [shipName, setShipName] = useState(ship?.shipName ?? '');

  async function pickCover() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true, aspect: [1, 1], quality: 0.85,
    });
    if (res.canceled || !res.assets[0] || !shipId) return;
    updateShip(shipId, { coverUri: await persistImage(res.assets[0].uri) });
  }

  async function pickMemberPhoto(memberId: string) {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true, aspect: [1, 1], quality: 0.85,
    });
    if (res.canceled || !res.assets[0] || !shipId) return;
    const photoUri = await persistImage(res.assets[0].uri);
    updateShip(shipId, { members: members.map((m) => (m.id === memberId ? { ...m, photoUri } : m)) });
  }

  function commitShipName() {
    const trimmed = shipName.trim();
    if (shipId && trimmed && trimmed !== ship?.shipName) updateShip(shipId, { shipName: trimmed });
  }

  if (!ship) {
    return (
      <View style={styles.screen}>
        <ProfileScreenHeader insetsTop={insets.top} onBack={() => router.back()} title="" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ProfileScreenHeader insetsTop={insets.top} onBack={() => router.back()} title="group details" />

      <ScrollView contentContainerStyle={[styles.content, column]} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <Pressable onPress={pickCover} style={styles.avatarWrap}>
            {ship.coverUri ? (
              <Image source={{ uri: ship.coverUri }} style={styles.avatarImg} contentFit="cover" />
            ) : (
              <View style={[styles.avatarImg, styles.avatarFallback, { backgroundColor: ship.gradEnd || Colors.sakuraDeep }]}>
                <Text style={styles.avatarInitial}>{(ship.shipName || ship.name || '♡').charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <Text style={styles.changePhotoLabel}>change cover</Text>
          </Pressable>

          <TextInput
            value={shipName}
            onChangeText={setShipName}
            onBlur={commitShipName}
            placeholder="polycule name"
            placeholderTextColor={Colors.ink3}
            style={styles.nameInput}
          />
          <Text style={styles.memberCount}>{membersLabel(ship)}</Text>
        </View>

        <Text style={styles.sectionLabel}>{members.length} {members.length === 1 ? 'member' : 'members'}</Text>
        <View style={styles.memberList}>
          {members.map((m, i) => (
            <View key={m.id} style={styles.memberRow}>
              <Pressable onPress={() => pickMemberPhoto(m.id)} style={styles.memberAvatar}>
                {m.photoUri ? (
                  <Image source={{ uri: m.photoUri }} style={styles.memberAvatarImg} contentFit="cover" />
                ) : (
                  <View style={[styles.memberAvatarImg, styles.memberAvatarFallback, { backgroundColor: memberColor(i) }]}>
                    <Text style={styles.memberAvatarInitial}>{(m.name || '?').charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </Pressable>
              <View style={styles.memberTextCol}>
                <Text style={styles.memberName} numberOfLines={1}>{m.name || 'untitled'}</Text>
                {/* the avatar itself is the tap target — this just makes that
                    obvious, same reason the group cover above has its own
                    "change cover" caption rather than a bare tappable image */}
                <Pressable onPress={() => pickMemberPhoto(m.id)} hitSlop={6}>
                  <Text style={styles.changeMemberPhoto}>change photo</Text>
                </Pressable>
              </View>
              {m.isMe && (
                <View style={styles.meBadge}>
                  <Text style={styles.meBadgeText}>you</Text>
                </View>
              )}
            </View>
          ))}
        </View>
        <Text style={styles.hint}>tap a photo to change it — renaming or adding members happens back on the roster screen</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s2, paddingBottom: Spacing.s8 },
  identity: { alignItems: 'center', gap: 8, marginBottom: Spacing.s6 },
  avatarWrap: { alignItems: 'center', gap: 8 },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, borderWidth: 2, borderColor: Colors.line },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(30), color: '#fff' },
  changePhotoLabel: { fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: Colors.sakuraDeep },
  nameInput: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(19), color: Colors.ink,
    textAlign: 'center', marginTop: Spacing.s2, minWidth: 160,
  },
  memberCount: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3 },
  sectionLabel: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.ink3,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.s3,
  },
  memberList: { gap: Spacing.s3 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberAvatar: { width: MEMBER_AVATAR_SIZE, height: MEMBER_AVATAR_SIZE, borderRadius: MEMBER_AVATAR_SIZE / 2 },
  memberAvatarImg: { width: MEMBER_AVATAR_SIZE, height: MEMBER_AVATAR_SIZE, borderRadius: MEMBER_AVATAR_SIZE / 2 },
  memberAvatarFallback: { alignItems: 'center', justifyContent: 'center' },
  memberAvatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: '#fff' },
  memberTextCol: { flex: 1, gap: 2 },
  memberName: { fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.ink },
  changeMemberPhoto: { fontFamily: FontFamily.ui, fontSize: sf(11.5), color: Colors.sakuraDeep },
  meBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line,
  },
  meBadgeText: { fontFamily: FontFamily.uiMedium, fontSize: sf(10), color: Colors.ink3 },
  hint: {
    fontFamily: FontFamily.ui, fontSize: sf(11.5), color: Colors.ink3,
    marginTop: Spacing.s6, textAlign: 'center', lineHeight: sf(16),
  },
});
