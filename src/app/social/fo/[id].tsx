import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileCard } from '@/components/profile/ProfileCard';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, Radius, Spacing, sf } from '@/constants/theme';
import { fetchFoProfile, type CommunityFoProfile } from '@/store/community';

export default function PublicFoProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<CommunityFoProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFoProfile(id).then((p) => {
      if (!cancelled) {
        setProfile(p);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Mark size={22} />
          <Text style={styles.headerTitle} numberOfLines={1}>{profile?.name || 'their profile'}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.sakuraDeep} />
      ) : !profile ? (
        <Text style={styles.notFound}>this profile isn't available</Text>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileCard
            name={profile.name || 'untitled'}
            pronouns={profile.pronouns}
            bio={profile.bio}
            photoUri={profile.avatarUrl}
          />
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6, paddingBottom: Spacing.s6 },
  notFound: {
    fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink3, textAlign: 'center', marginTop: 60,
  },
});
