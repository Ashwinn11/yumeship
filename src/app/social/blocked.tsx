import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { fetchBlockedUsers, unblockUser, type CommunityProfile } from '@/store/community';

export default function BlockedUsersScreen() {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<CommunityProfile[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setUsers(await fetchBlockedUsers());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUnblock(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    await unblockUser(id);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={22} />
          <Text style={styles.headerTitle}>blocked</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.sakuraDeep} />
      ) : users.length === 0 ? (
        <Text style={styles.empty}>no one's blocked ♡</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {users.map((u) => (
            <View key={u.id} style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: Colors.sakura }]}>
                {u.avatarUrl ? (
                  <Image source={{ uri: u.avatarUrl }} style={styles.avatarImg} contentFit="cover" />
                ) : (
                  <Text style={styles.avatarInitial}>{u.name.trim().charAt(0).toUpperCase() || '♡'}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{u.name || 'someone'}</Text>
                {!!u.username && <Text style={styles.username}>@{u.username}</Text>}
              </View>
              <Pressable onPress={() => handleUnblock(u.id)} style={styles.unblockBtn}>
                <Text style={styles.unblockText}>unblock</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s4, paddingBottom: Spacing.s6, gap: 10 },
  empty: {
    fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink3, textAlign: 'center', marginTop: 60,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r4, padding: Spacing.s3,
  },
  avatar: { width: 40, height: 40, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: 40, height: 40, borderRadius: Radius.pill },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(17), color: '#fff' },
  name: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink },
  username: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3, marginTop: 1 },
  unblockBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line,
  },
  unblockText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink2 },
});
