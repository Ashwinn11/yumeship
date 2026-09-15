import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sparkle } from '@/components/deco/Sparkle';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import type { CommunityPost } from '@/store/community';

import { MentionText } from './MentionText';

const AVATAR_SIZE = 38;

function Avatar({ uri, name }: { uri: string; name: string }) {
  return (
    <View style={styles.avatarRing}>
      <View style={styles.avatar}>
        {uri ? (
          <Image source={{ uri }} style={styles.avatarImg} contentFit="cover" recyclingKey={uri} {...AVATAR_IMAGE} />
        ) : (
          <Text style={styles.avatarInitial}>{name.trim().charAt(0).toUpperCase() || '♡'}</Text>
        )}
      </View>
    </View>
  );
}

/** The pinned daily winner — the clear hero of the Activities tab, so it
 * carries real elevation and a warmer tint rather than the plain-bordered
 * treatment a pool row gets. Distinct from both a regular post and a pool
 * row, matching nothing else on the tab. */
export function TodaysActivityCard({ activity }: { activity: CommunityPost }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/social/activity/${activity.id}` as any)}
    >
      <View style={styles.sparkle} pointerEvents="none">
        <Sparkle size={14} color={Colors.sakuraDeep} />
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.label}>today's activity</Text>
        <Text style={styles.labelSub}>· community picked</Text>
      </View>

      <View style={styles.contentRow}>
        <Avatar uri={activity.author.avatarUrl} name={activity.author.name} />
        <View style={styles.textCol}>
          <MentionText body={activity.body} mentions={activity.mentions} style={styles.headline} numberOfLines={3} />
          {!!activity.author.username && <Text style={styles.username}>@{activity.author.username}</Text>}
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.sakuraSoft,
    borderWidth: 1,
    borderColor: Colors.sakura,
    borderRadius: Radius.r4,
    padding: Spacing.s4,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.s1,
  },
  cardPressed: { transform: [{ scale: 0.96 }] },
  sparkle: { position: 'absolute', top: 10, right: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  label: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(11), color: Colors.sakuraDeep,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  labelSub: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3 },
  contentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  // a slim ring around the avatar (radius = avatar radius + ring padding,
  // concentric per better-ui) is what marks this one out as the winner
  avatarRing: {
    width: AVATAR_SIZE + 4, height: AVATAR_SIZE + 4, borderRadius: (AVATAR_SIZE + 4) / 2,
    borderWidth: 1.5, borderColor: Colors.sakuraDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.sakura, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(15), color: '#fff' },
  textCol: { flex: 1, minWidth: 0, gap: 2 },
  headline: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(17.5), color: Colors.ink, lineHeight: sf(23) },
  username: { fontFamily: FontFamily.uiMedium, fontSize: sf(11.5), color: Colors.ink3 },
  chevron: { fontFamily: FontFamily.ui, fontSize: sf(22), color: Colors.sakuraDeep, lineHeight: sf(24) },
});
