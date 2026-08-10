import { router, useLocalSearchParams } from 'expo-router';
import { MEDIA_IMAGE } from '@/lib/imageProps';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileCard } from '@/components/profile/ProfileCard';
import { Mark } from '@/components/ui/Mark';
import { Colors, FontFamily, FontSize, RelationshipColors, SharingColors, Radius, Spacing, sf } from '@/constants/theme';
import { fetchFoProfile, type CommunityFoProfile } from '@/store/community';

const REL_LABEL: Record<string, string> = { romantic: 'romantic', platonic: 'platonic', familial: 'familial' };
const SHARE_LABEL: Record<string, string> = { yes: 'Yes', no: 'No', selective: 'Selective' };

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

  const pageBg = profile?.pageBgImage || profile?.pageBgColor;

  const body = (
    <View style={[styles.screen, !pageBg && styles.screenDefaultBg, { paddingTop: insets.top }]}>
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
            subtitle={profile.fandom}
            bio={profile.bio}
            photoUri={profile.avatarUrl}
            fallbackColor={Colors.lavender}
            statusLabel={profile.statusLabel}
            type={{ label: REL_LABEL[profile.relStatus] ?? profile.relStatus, color: RelationshipColors[profile.relStatus] }}
            sharing={{ label: SHARE_LABEL[profile.shareStatus] ?? profile.shareStatus, color: SharingColors[profile.shareStatus] }}
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
          />
        </ScrollView>
      )}
    </View>
  );

  // the owner styled their page too, so mirror it here rather than always paper
  if (profile?.pageBgImage) {
    return (
      <View style={styles.fill}>
        <Image source={{ uri: profile.pageBgImage }} style={StyleSheet.absoluteFill} contentFit="cover" {...MEDIA_IMAGE} />
        {body}
      </View>
    );
  }
  if (profile?.pageBgColor) {
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  headerTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h6, color: Colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6, paddingBottom: Spacing.s6 },
  notFound: {
    fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink3, textAlign: 'center', marginTop: 60,
  },
});
