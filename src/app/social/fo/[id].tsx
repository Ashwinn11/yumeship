import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageBackground } from '@/components/profile/PageBackground';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileCardSkeleton } from '@/components/profile/ProfileCardSkeleton';
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader';
import { Colors, FontFamily, Spacing, sf } from '@/constants/theme';
import { relationshipStatus, sharingStatus } from '@/components/profile/cardProps';
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

  const pageBg = profile?.pageBgImage || profile?.pageBgColor;

  const body = (
    <View style={[styles.screen, !pageBg && styles.screenDefaultBg]}>
      <ProfileScreenHeader
        insetsTop={insets.top}
        onBack={() => router.back()}
        title={profile?.name || 'their profile'}
      />

      {loading ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileCardSkeleton />
        </ScrollView>
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
            type={relationshipStatus(profile.relStatus)}
            sharing={sharingStatus(profile.shareStatus)}
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
  return (
    <PageBackground bgImage={profile?.pageBgImage} bgColor={profile?.pageBgColor}>
      {body}
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenDefaultBg: { backgroundColor: Colors.paper },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.s6, paddingTop: Spacing.s6, paddingBottom: Spacing.s6 },
  notFound: {
    fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink3, textAlign: 'center', marginTop: 60,
  },
});
